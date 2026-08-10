"""API chatbot iMob — FastAPI, deploy trên Render.com.

Chạy local:   python -m uvicorn main:app --reload --port 8000
Trên Render:  uvicorn main:app --host 0.0.0.0 --port $PORT   (xem render.yaml)

Các đường dẫn:
  GET  /         — thông tin dịch vụ (mở bằng trình duyệt để kiểm tra sống/chết)
  GET  /health   — Render gọi định kỳ để biết service còn khỏe
  POST /api/chat — nơi website gửi câu hỏi của khách
  GET  /docs     — trang thử API tự sinh của FastAPI
"""

import os
import threading
import uuid
from collections import OrderedDict
from copy import copy
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from imob_bot import ChatBot, KienThuc

app = FastAPI(title="iMob Chatbot API", version="1.0.0")

# ============================================================
# CORS — cho phép website gọi sang API này
#
# Trên Render, website (static site) và API này nằm ở HAI TÊN MIỀN KHÁC NHAU.
# Mặc định trình duyệt CHẶN việc trang web ở miền A gọi API ở miền B, trừ khi
# API tự khai báo "tôi cho phép miền A". Đó là việc của đoạn dưới đây.
#
# Đặt biến môi trường ALLOWED_ORIGINS trên Render để siết lại cho an toàn, ví dụ:
#     ALLOWED_ORIGINS=https://imob-web.onrender.com,https://imob.vn
# Để "*" nghĩa là cho phép mọi trang web gọi (chấp nhận được vì API này không
# dùng cookie/đăng nhập, nhưng nên siết lại khi đã có tên miền chính thức).
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,  # không dùng cookie -> để False mới được phép dùng "*"
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

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

_bot_goc = ChatBot(KienThuc.tu_file(DATA_FILE))

# ============================================================
# Mỗi khách một phiên riêng
#
# VÌ SAO CẦN: ChatBot NHỚ trạng thái giữa các lượt — đang hỏi khách họ tên hay
# số điện thoại (self.lead), đã trượt mấy câu liên tiếp (self.so_lan_truot).
# Nếu cả website dùng chung một con bot thì khách A đang để lại SĐT mà khách B
# nhắn vào, câu của B sẽ bị nuốt làm "số điện thoại của A". Chạy một mình ở máy
# thì không thấy, nhưng lên mạng thật là lỗi ngay.
#
# copy() ở đây là "sao chép nông": phần nặng (kho kiến thức + chỉ mục TF-IDF)
# vẫn dùng chung một bản trong bộ nhớ, chỉ có phần trạng thái là riêng. Nhờ vậy
# tạo phiên mới gần như tức thì và không tốn thêm RAM đáng kể.
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


# ============================================================
# Kiểu dữ liệu vào / ra
# ============================================================
class ChatRequest(BaseModel):
    message: str
    history: list[dict[str, str]] = []
    # session_id: website tự sinh và gửi kèm mỗi lượt để bot nhớ đúng ngữ cảnh
    # của riêng khách đó. Không gửi cũng được — server sẽ cấp một mã mới.
    session_id: str | None = None


class ChatResponse(BaseModel):
    response: str
    session_id: str


# ============================================================
# Các đường dẫn
# ============================================================
@app.get("/")
def root():
    return {"service": "iMob Chatbot API", "status": "ok", "docs": "/docs"}


@app.get("/health")
def health():
    """Render gọi đường dẫn này để biết service còn sống (xem healthCheckPath)."""
    return {"status": "ok", "so_phien": len(_phien)}


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
