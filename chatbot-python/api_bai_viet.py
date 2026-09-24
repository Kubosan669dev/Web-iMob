"""Bài viết của mục "Câu chuyện khách hàng".

HAI NHÓM ĐƯỜNG DẪN, tách hẳn nhau:

  /api/bai-viet…            CÔNG KHAI — chỉ thấy bài ĐÃ ĐĂNG.
  /api/quan-tri/bai-viet…   CẦN ĐĂNG NHẬP — thấy cả bài nháp, và sửa được.

Vì sao tách làm hai gốc đường dẫn chứ không dùng chung một gốc rồi xét quyền
bên trong: đường công khai và đường quản trị khác nhau ở chỗ *thấy được gì*,
mà đó đúng là loại nhầm lẫn khó phát hiện nhất — bài nháp lọt ra ngoài thì
không có lỗi nào hiện lên, chỉ là khách đọc được thứ chưa ai duyệt. Tách gốc
đường dẫn thì nhìn tên hàm là biết ngay hàm đó phục vụ ai.

MỌI ĐƯỜNG DẪN QUẢN TRỊ ĐỀU ĐÒI VAI 'quan_tri', không phải chỉ "đã đăng nhập".
Sắp có tài khoản thành viên cho khách ngoài website, và vé của họ do cùng một
nơi phát ra — để nguyên "đã đăng nhập" là cho bất kỳ ai đăng ký cũng viết được
lên trang công khai của công ty, đứng tên iMob.
"""

import re
import unicodedata
from urllib.parse import unquote, urlsplit

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

import db
from auth import chi_quan_tri

router = APIRouter(tags=["bai-viet"])

CHI_QUAN_TRI = chi_quan_tri("Chỉ tài khoản quản trị mới soạn được bài viết.")

# Giới hạn độ dài ngay ở cửa. Thân bài 40.000 ký tự đã là khoảng 30 trang A4 —
# dài hơn thế gần như chắc chắn là dán nhầm chứ không phải bài viết.
DAI_NHAT_TIEU_DE = 200
DAI_NHAT_TOM_TAT = 500
DAI_NHAT_NOI_DUNG = 40_000

# ⚠️ Hai giới hạn dưới đây là cho thứ người dùng GÕ VÀO, không phải cho thứ
# được lưu. Trước 24/09/2026 chúng là 80 và 100, và đó là nguyên nhân lỗi 422
# sếp gặp khi đăng bài:
#
#   · Ô Đường dẫn: gõ tay một câu 81 ký tự là bị từ chối — trong khi máy chủ
#     vẫn tự rút gọn thành đường dẫn ≤ 80 ký tự (xem tao_duong_dan). Chặn ở cửa
#     một thứ mà bước sau vốn đã xử lý được là bắt người dùng làm việc thay máy.
#   · Ô Ảnh bìa: nhận cả link ảnh ở trang khác (utils/anh.js), mà link ảnh
#     Facebook dài 200–400 ký tự. Các mục khác trong /admin dùng CÙNG ô chọn ảnh
#     lại không giới hạn — cùng một link, dán ở Sản phẩm thì được, ở Bài viết thì
#     hỏng.
DAI_NHAT_DUONG_DAN_NHAP = 300
DAI_NHAT_ANH_BIA = 2000

# Tên miền được coi là "của mình": dán link bài trên các tên miền này vào ô
# Đường dẫn thì lấy phần đuôi. Link của mọi tên miền khác bị từ chối kèm lời
# giải thích.
TEN_MIEN_CUA_MINH = ("imob.vn", "localhost", "127.0.0.1")

# ============================================================
# HAI LOẠI BÀI
#
#   cau_chuyen  — câu chuyện khách hàng, kể về một sản phẩm đã bàn giao
#   tin_cong_ty — thông báo của iMob (ký kết, sự kiện, tuyển dụng…)
#
# Danh sách này là NGUỒN SỰ THẬT: giá trị lạ bị từ chối ngay ở cửa. Không
# chặn thì một lỗi gõ trong trang quản trị sẽ tạo ra một loại thứ ba mà
# không trang nào hiển thị — bài viết biến mất mà chẳng có lỗi nào báo.
# Giao diện phải dùng đúng hai chuỗi này (xem services/baiVietService.js).
# ============================================================
LOAI_CAU_CHUYEN = "cau_chuyen"
LOAI_TIN_CONG_TY = "tin_cong_ty"
LOAI_HOP_LE = {LOAI_CAU_CHUYEN, LOAI_TIN_CONG_TY}


# ============================================================
# Đường dẫn thân thiện (slug)
# ============================================================
def tao_duong_dan(tieu_de: str) -> str:
    """"Yên Tử Số ra mắt" -> "yen-tu-so-ra-mat".

    NFD tách chữ cái khỏi dấu thanh/dấu mũ, rồi bỏ hết các ký tự thuộc nhóm
    "dấu" (category Mn). Riêng chữ 'đ' KHÔNG tách ra được bằng cách đó — nó là
    một chữ cái riêng trong bảng mã, không phải 'd' cộng dấu — nên phải thay
    tay. Quên dòng đó thì "đào tạo" ra thành "ao-tao".
    """
    chu = unicodedata.normalize("NFD", tieu_de.lower())
    chu = "".join(c for c in chu if unicodedata.category(c) != "Mn")
    chu = chu.replace("đ", "d").replace("Đ", "d")
    chu = re.sub(r"[^a-z0-9]+", "-", chu).strip("-")

    # Cắt cho ngắn lại, nhưng cắt ở ranh giới TỪ chứ không cắt giữa chừng.
    # Cắt thẳng ở ký tự thứ 80 thì tiêu đề dài sẽ ra "…chuyen-doi-s" hoặc tệ
    # hơn là "…chuyen-doi-" với một dấu gạch lủng lẳng ở cuối.
    if len(chu) > 80:
        chu = chu[:80]
        if "-" in chu:
            chu = chu.rsplit("-", 1)[0]
        chu = chu.rstrip("-")

    return chu or "bai-viet"


def duong_dan_tu_o_nhap(chu: str) -> str:
    """Thứ người dùng gõ vào ô Đường dẫn -> đường dẫn dùng được.

    Ô này tên là "Đường dẫn", và người ta hiểu chữ đó theo hai kiểu. Kiểu đúng
    là phần đuôi địa chỉ của bài (ngay-nay-nam-truoc). Kiểu sai nhưng rất tự
    nhiên là "link tới bài gốc" — dán cả link Facebook vào. Hàm này xử lý cả hai:

      "https://imob.vn/tin-tuc/ngay-nay-nam-truoc" -> "ngay-nay-nam-truoc"
      "/tin-tuc/ngay-nay-nam-truoc"                -> "ngay-nay-nam-truoc"
      "https://facebook.com/..."                   -> 400, giải thích ô này là gì
      "Ngày này năm trước"                         -> "ngay-nay-nam-truoc"

    Trước 24/09/2026 link imob.vn không bị từ chối mà bị biến thành
    "https-imob-vn-tin-tuc-ngay-nay-nam-truoc" — lỗi im lặng, chỉ lộ ra khi
    đem đường dẫn đó đi chia sẻ.
    """
    chu = chu.strip()
    la_link = "://" in chu or chu.lower().startswith("www.")
    if la_link:
        phan = urlsplit(chu if "://" in chu else "https://" + chu)
        may = (phan.hostname or "").lower()
        cua_minh = any(may == m or may.endswith("." + m) for m in TEN_MIEN_CUA_MINH)
        if not cua_minh:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Ô «Đường dẫn» là phần đuôi địa chỉ của bài NGAY TRÊN imob.vn "
                    "(ví dụ: ngay-nay-nam-truoc), không phải link tới trang khác. "
                    "Muốn dẫn nguồn thì dán link vào cuối nội dung bài. Để trống ô "
                    "này thì máy tự đặt theo tiêu đề."
                ),
            )
        chu = unquote(phan.path)

    # Còn dấu "/" (link của mình, hoặc gõ tay "/tin-tuc/abc") thì chỉ phần
    # cuối là đường dẫn của bài; phần trước là mục, do loại bài quyết định.
    if "/" in chu:
        doan = [d for d in chu.split("/") if d.strip()]
        if not doan:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Địa chỉ này không có phần đuôi của bài viết nào. Để trống ô «Đường dẫn» thì máy tự đặt theo tiêu đề.",
            )
        chu = doan[-1]

    return tao_duong_dan(chu)


def duong_dan_chua_dung(tieu_de: str, tru_ma: int | None = None) -> str:
    """Đường dẫn từ tiêu đề, thêm -2, -3… nếu đã có bài khác dùng.

    Cần thiết vì hai câu chuyện của cùng một khách rất dễ trùng tiêu đề, mà cột
    duong_dan là UNIQUE — không dò trước thì người dùng nhận về lỗi database
    khó hiểu thay vì một đường dẫn dùng được.
    """
    goc = tao_duong_dan(tieu_de)
    ung_vien = goc
    dem = 2
    while db.duong_dan_dang_dung(ung_vien, tru_ma):
        ung_vien = f"{goc}-{dem}"
        dem += 1
    return ung_vien


def _can_db() -> None:
    if not db.co_db():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Chưa cấu hình database — chưa dùng được mục bài viết.",
        )


# ============================================================
# Công khai
# ============================================================
@router.get("/api/bai-viet")
def danh_sach_cong_khai(
    loai: str | None = Query(default=None, description="cau_chuyen | tin_cong_ty"),
):
    """Danh sách bài ĐÃ ĐĂNG, mới nhất trước. Không kèm thân bài.

    Bỏ trống `loai` thì trả về cả hai loại.

    Chưa có database thì trả danh sách RỖNG chứ không báo lỗi — cả website đã
    theo nguyên tắc "database hỏng thì tắt riêng phần đó" (xem db.py), và một
    mục bài viết trống thì vô hại, còn một trang báo lỗi đỏ thì không.
    """
    if loai is not None and loai not in LOAI_HOP_LE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Loại '{loai}' không có. Chỉ nhận: {', '.join(sorted(LOAI_HOP_LE))}.",
        )
    return db.danh_sach_bai_viet(chi_da_dang=True, loai=loai)


@router.get("/api/bai-viet/{duong_dan}")
def doc_bai_cong_khai(duong_dan: str):
    bai = db.lay_bai_viet_theo_duong_dan(duong_dan, chi_da_dang=True)
    if bai is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy bài viết này.",
        )
    return bai


# ============================================================
# Quản trị
# ============================================================
class BaiVietVao(BaseModel):
    tieu_de: str = Field(min_length=1, max_length=DAI_NHAT_TIEU_DE)
    loai: str = LOAI_CAU_CHUYEN
    tom_tat: str = Field(default="", max_length=DAI_NHAT_TOM_TAT)
    noi_dung: str = Field(default="", max_length=DAI_NHAT_NOI_DUNG)
    # Một trong ba dạng: /api/anh/<mã> (tải lên), /anh/ten.webp (có sẵn trong
    # website), hoặc https://… (ảnh ở trang khác) — xem src/utils/anh.js.
    anh_bia: str | None = Field(default=None, max_length=DAI_NHAT_ANH_BIA)
    ten_khach: str | None = Field(default=None, max_length=200)
    da_dang: bool = False
    # Để trống thì máy tự đặt theo tiêu đề. Người dùng sửa được vì đổi tiêu đề
    # của một bài ĐÃ ĐĂNG mà đường dẫn đổi theo là làm chết mọi link đã chia sẻ.
    # Giới hạn là cho chữ GÕ VÀO; đường dẫn lưu lại luôn ≤ 80 ký tự.
    duong_dan: str | None = Field(default=None, max_length=DAI_NHAT_DUONG_DAN_NHAP)


def _chot_duong_dan(than: BaiVietVao, tru_ma: int | None = None) -> str:
    if than.duong_dan and than.duong_dan.strip():
        goc = duong_dan_tu_o_nhap(than.duong_dan)
        if db.duong_dan_dang_dung(goc, tru_ma):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Đường dẫn '{goc}' đã có bài khác dùng. Chọn đường dẫn khác nhé.",
            )
        return goc
    return duong_dan_chua_dung(than.tieu_de, tru_ma)


def _chot_loai(than: BaiVietVao) -> str:
    if than.loai not in LOAI_HOP_LE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Loại '{than.loai}' không có. Chỉ nhận: {', '.join(sorted(LOAI_HOP_LE))}.",
        )
    return than.loai


@router.get("/api/quan-tri/bai-viet")
def danh_sach_quan_tri(_ten: str = Depends(CHI_QUAN_TRI)):
    """Cả bài nháp lẫn bài đã đăng. Nháp xếp lên trước."""
    _can_db()
    return db.danh_sach_bai_viet(chi_da_dang=False)


@router.get("/api/quan-tri/bai-viet/{ma}")
def doc_bai_quan_tri(ma: int, _ten: str = Depends(CHI_QUAN_TRI)):
    _can_db()
    bai = db.lay_bai_viet(ma)
    if bai is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Không có bài #{ma}."
        )
    return bai


@router.post("/api/quan-tri/bai-viet", status_code=status.HTTP_201_CREATED)
def them_bai(than: BaiVietVao, ten: str = Depends(CHI_QUAN_TRI)):
    _can_db()
    return db.them_bai_viet(
        duong_dan=_chot_duong_dan(than),
        loai=_chot_loai(than),
        tieu_de=than.tieu_de.strip(),
        tom_tat=than.tom_tat.strip(),
        noi_dung=than.noi_dung.strip(),
        anh_bia=(than.anh_bia or "").strip() or None,
        ten_khach=(than.ten_khach or "").strip() or None,
        da_dang=than.da_dang,
        nguoi_sua=ten,
    )


@router.put("/api/quan-tri/bai-viet/{ma}")
def sua_bai(ma: int, than: BaiVietVao, ten: str = Depends(CHI_QUAN_TRI)):
    _can_db()
    bai = db.sua_bai_viet(
        ma=ma,
        duong_dan=_chot_duong_dan(than, tru_ma=ma),
        loai=_chot_loai(than),
        tieu_de=than.tieu_de.strip(),
        tom_tat=than.tom_tat.strip(),
        noi_dung=than.noi_dung.strip(),
        anh_bia=(than.anh_bia or "").strip() or None,
        ten_khach=(than.ten_khach or "").strip() or None,
        da_dang=than.da_dang,
        nguoi_sua=ten,
    )
    if bai is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Không có bài #{ma}."
        )
    return bai


@router.delete("/api/quan-tri/bai-viet/{ma}")
def xoa_bai(ma: int, _ten: str = Depends(CHI_QUAN_TRI)):
    _can_db()
    if not db.xoa_bai_viet(ma):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Không có bài #{ma}."
        )
    return {"ok": True, "id": ma}
