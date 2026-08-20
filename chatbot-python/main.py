"""API iMob — FastAPI, deploy trên Render.com.

Chạy local:   python -m uvicorn main:app --reload --port 8000
Trên Render:  uvicorn main:app --host 0.0.0.0 --port $PORT   (xem render.yaml)

Các nhóm đường dẫn:
  GET  /              — thông tin dịch vụ (mở bằng trình duyệt để kiểm tra sống/chết)
  GET  /health        — Render gọi định kỳ để biết service còn khỏe
  GET  /docs          — trang thử API tự sinh của FastAPI
  POST /api/chat      — nơi website gửi câu hỏi của khách
  POST /api/dang-nhap — đăng nhập trang quản trị        (api_auth.py)
  /api/noi-dung       — nội dung website cho CMS         (api_noi_dung.py)
  /api/lien-he        — khách để lại thông tin           (api_lien_he.py)
  /api/anh            — ảnh tải lên từ trang quản trị     (api_anh.py)

NGUYÊN TẮC: database là TÙY CHỌN. Không có (hoặc chết) thì CMS và việc lưu liên
hệ tự tắt, còn chatbot vẫn chạy y như cũ. Website cũng có bản JSON đóng gói sẵn
làm mặc định nên khách không bao giờ thấy trang trống.
"""

import cau_hinh  # noqa: F401  — phải nạp .env TRƯỚC khi đọc os.getenv bên dưới

import logging
import os
import threading
import uuid
from collections import OrderedDict
from contextlib import asynccontextmanager
from copy import copy
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import api_anh
import api_auth
import api_lien_he
import api_noi_dung
import auth
import db
from imob_bot import ChatBot, KienThuc
from imob_bot import gemini

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("imob")

# ============================================================
# Nạp kho kiến thức MỘT LẦN lúc khởi động
#
# Dựng ChatBot khá tốn sức: nó phải "học" toàn bộ kho kiến thức bằng TF-IDF
# (xem imob_bot/engine.py). Làm việc này mỗi lần khách nhắn tin thì API sẽ ì.
# Nên ở đây dựng sẵn MỘT con bot "gốc", rồi mỗi khách sao chép lại từ nó.
# ============================================================
DATA_DIR = Path(__file__).resolve().parent / "data"
DATA_FILE = DATA_DIR / "imob_chatbot_data.json"
if not DATA_FILE.exists():
    DATA_FILE = DATA_DIR / "sample_data.json"


def _luu_lead_tu_chatbot(da_thu: dict, service_id: str | None) -> None:
    """Khách chat xong để lại đủ họ tên / SĐT / email -> ghi vào database.

    Trước đây thông tin này chỉ được đọc lại cho khách nghe rồi bỏ đi — khách
    thật để lại số mà không ai biết. Các khóa (ho_ten, so_dien_thoai, email)
    lấy từ lead_capture.required_fields trong file dữ liệu chatbot.
    """
    db.them_lien_he(
        nguon="chatbot",
        ho_ten=da_thu.get("ho_ten"),
        email=da_thu.get("email"),
        so_dien_thoai=da_thu.get("so_dien_thoai"),
        dich_vu=KienThuc.ten_dich_vu(service_id) if service_id else None,
    )


_bot_goc = ChatBot(KienThuc.tu_file(DATA_FILE), khi_co_lead=_luu_lead_tu_chatbot)


# ============================================================
# Vòng đời ứng dụng: mở database lúc bật, đóng lúc tắt
# ============================================================
@asynccontextmanager
async def vong_doi(app: FastAPI):
    # NGUYÊN TẮC: hỏng phần nào tắt phần đó, KHÔNG kéo sập cả ứng dụng.
    # Chatbot phải phục vụ được khách kể cả khi CMS hỏng hoàn toàn.
    if db.DA_CAU_HINH:
        loi_cau_hinh = auth.kiem_tra_cau_hinh()
        if loi_cau_hinh:
            # Không mở database luôn -> không ai đăng nhập được (lay_nguoi_dung
            # trả None), nên không có chuyện ký vé bằng khóa yếu.
            log.error("CMS bị TẮT do cấu hình sai: %s", loi_cau_hinh)
            log.error("Chatbot vẫn chạy bình thường. Sửa biến môi trường rồi khởi động lại.")
        else:
            db.khoi_tao()
            if not db.co_db():
                log.warning("Đã đặt DATABASE_URL nhưng kết nối hỏng — CMS đang TẮT.")

    # Nói to trạng thái Gemini ngay lúc khởi động. Không có dòng này thì lúc
    # quên đặt khoá, bot vẫn chạy êm và không ai biết tầng AI đang tắt —
    # chỉ thấy khách thỉnh thoảng nhận câu "em chưa hiểu".
    log.info(
        "Tầng Gemini: %s",
        f"BẬT (model {gemini.MODEL})" if gemini.dang_bat()
        else "TẮT (chưa đặt GEMINI_API_KEY) — bot chạy bằng kho kiến thức trong máy",
    )

    yield
    db.dong()


app = FastAPI(title="iMob API", version="2.0.0", lifespan=vong_doi)

# ============================================================
# CORS — cho phép website gọi sang API này
#
# Trên Render, website (static site) và API này nằm ở HAI TÊN MIỀN KHÁC NHAU.
# Mặc định trình duyệt CHẶN việc trang web ở miền A gọi API ở miền B, trừ khi
# API tự khai báo "tôi cho phép miền A". Đó là việc của đoạn dưới đây.
#
# Đặt ALLOWED_ORIGINS trên Render, ngăn cách bằng dấu phẩy, ví dụ:
#     ALLOWED_ORIGINS=https://imob-web.onrender.com,https://imob.vn
# ============================================================
def _chuan_hoa_origin(o: str) -> str:
    """Thêm https:// nếu người dùng chỉ ghi tên miền trần (imob.onrender.com)."""
    o = o.strip().rstrip("/")
    if o and o != "*" and not o.startswith(("http://", "https://")):
        return f"https://{o}"
    return o


ALLOWED_ORIGINS = [
    _chuan_hoa_origin(o)
    for o in os.getenv("ALLOWED_ORIGINS", "*").split(",")
    if o.strip()
] or ["*"]

if db.DA_CAU_HINH and ALLOWED_ORIGINS == ["*"]:
    # Không ném lỗi (sẽ làm hỏng deploy đang chạy), nhưng phải kêu to.
    log.warning(
        "ALLOWED_ORIGINS đang để '*' trong khi đã bật CMS. Nên siết lại thành "
        "tên miền thật của website, ví dụ: https://imob-web.onrender.com"
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,  # dùng vé Bearer, không dùng cookie
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
)

app.include_router(api_auth.router)
app.include_router(api_noi_dung.router)
app.include_router(api_lien_he.router)
app.include_router(api_anh.router)

# ============================================================
# Mỗi khách một phiên chat riêng
#
# VÌ SAO CẦN: ChatBot NHỚ trạng thái giữa các lượt — đang hỏi khách họ tên hay
# số điện thoại (self.lead), đã trượt mấy câu liên tiếp (self.so_lan_truot).
# Nếu cả website dùng chung một con bot thì khách A đang để lại SĐT mà khách B
# nhắn vào, câu của B sẽ bị nuốt làm "số điện thoại của A".
#
# copy() ở đây là "sao chép nông": phần nặng (kho kiến thức + chỉ mục TF-IDF)
# vẫn dùng chung một bản trong bộ nhớ, chỉ có phần trạng thái là riêng.
#
# OrderedDict + MAX_PHIEN: giữ tối đa 500 phiên gần nhất, phiên cũ nhất bị đẩy
# ra. Không có bước này thì bộ nhớ cứ phình mãi cho tới khi Render giết service.
# ============================================================
MAX_PHIEN = 500
_phien: "OrderedDict[str, ChatBot]" = OrderedDict()
_khoa = threading.Lock()  # nhiều request có thể chạy song song -> khóa lại cho chắc


def lay_bot(session_id: str) -> ChatBot:
    with _khoa:
        bot = _phien.get(session_id)
        if bot is not None:
            _phien.move_to_end(session_id)  # đánh dấu "vừa dùng" -> khỏi bị dọn
            return bot

        bot = copy(_bot_goc)
        bot.lead = None
        bot.so_lan_truot = 0
        _phien[session_id] = bot
        while len(_phien) > MAX_PHIEN:
            _phien.popitem(last=False)  # bỏ phiên cũ nhất
        return bot


class ChatRequest(BaseModel):
    message: str
    history: list[dict[str, str]] = []
    # session_id: website tự sinh và gửi kèm mỗi lượt để bot nhớ đúng ngữ cảnh
    # của riêng khách đó. Không gửi cũng được — server sẽ cấp một mã mới.
    session_id: str | None = None


class ChatResponse(BaseModel):
    response: str
    session_id: str


@app.get("/")
def root():
    return {"service": "iMob API", "status": "ok", "docs": "/docs"}


@app.get("/health")
def health():
    """Render gọi đường dẫn này để biết service còn sống (xem healthCheckPath)."""
    return {
        "status": "ok",
        "so_phien": len(_phien),
        "database": "ok" if db.co_db() else ("loi" if db.DA_CAU_HINH else "tat"),
        # Chỉ báo BẬT/TẮT, tuyệt đối không lộ khoá ra đường dẫn công khai.
        "gemini": "bat" if gemini.dang_bat() else "tat",
    }


# Hàm này cố ý viết `def` chứ KHÔNG phải `async def`: việc tính TF-IDF là việc
# nặng cho CPU và không hề "chờ đợi" gì. Nếu để async, nó sẽ chiếm luôn luồng
# chính và mọi khách khác phải xếp hàng. Viết `def` thì FastAPI tự đẩy sang
# luồng phụ, nhiều khách vẫn được phục vụ song song.
@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    session_id = (request.session_id or "").strip() or uuid.uuid4().hex
    message = request.message.strip()

    if not message:
        return {"response": "Bạn vui lòng gửi câu hỏi nhé.", "session_id": session_id}

    bot = lay_bot(session_id)
    return {"response": bot.tra_loi(message), "session_id": session_id}


# Cho phép chạy thẳng: python main.py
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "8000")))
