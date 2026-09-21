"""Bài viết của mục "Câu chuyện khách hàng".

HAI NHÓM ĐƯỜNG DẪN, tách hẳn nhau:

  /api/bai-viet…            CÔNG KHAI — chỉ thấy bài ĐÃ ĐĂNG.
  /api/quan-tri/bai-viet…   CẦN ĐĂNG NHẬP — thấy cả bài nháp, và sửa được.

Vì sao tách làm hai gốc đường dẫn chứ không dùng chung một gốc rồi xét quyền
bên trong: đường công khai và đường quản trị khác nhau ở chỗ *thấy được gì*,
mà đó đúng là loại nhầm lẫn khó phát hiện nhất — bài nháp lọt ra ngoài thì
không có lỗi nào hiện lên, chỉ là khách đọc được thứ chưa ai duyệt. Tách gốc
đường dẫn thì nhìn tên hàm là biết ngay hàm đó phục vụ ai.

VỀ HAI VAI TRÒ (xem auth.py):
  · quan_tri  — làm mọi thứ.
  · khach_thu — viết và sửa bài NHÁP, nhưng KHÔNG đăng và KHÔNG xoá được.

Mật khẩu của tài khoản dùng thử hiện công khai ở màn hình đăng nhập, nên phải
coi như cả internet đang cầm tài khoản đó. Cho nó viết nháp thì không sao —
nháp không ai nhìn thấy. Cho nó bấm ĐĂNG thì là cho người lạ viết lên trang
công khai của công ty, đứng tên iMob.
"""

import re
import unicodedata

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

import db
from auth import VAI_QUAN_TRI, chi_quan_tri, nguoi_dang_nhap

router = APIRouter(tags=["bai-viet"])

CHI_QUAN_TRI_XOA = chi_quan_tri("Tài khoản dùng thử không xoá được bài viết.")

# Giới hạn độ dài ngay ở cửa. Thân bài 40.000 ký tự đã là khoảng 30 trang A4 —
# dài hơn thế gần như chắc chắn là dán nhầm chứ không phải bài viết.
DAI_NHAT_TIEU_DE = 200
DAI_NHAT_TOM_TAT = 500
DAI_NHAT_NOI_DUNG = 40_000


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
def danh_sach_cong_khai():
    """Danh sách bài ĐÃ ĐĂNG, mới nhất trước. Không kèm thân bài.

    Chưa có database thì trả danh sách RỖNG chứ không báo lỗi — cả website đã
    theo nguyên tắc "database hỏng thì tắt riêng phần đó" (xem db.py), và một
    mục bài viết trống thì vô hại, còn một trang báo lỗi đỏ thì không.
    """
    return db.danh_sach_bai_viet(chi_da_dang=True)


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
    tom_tat: str = Field(default="", max_length=DAI_NHAT_TOM_TAT)
    noi_dung: str = Field(default="", max_length=DAI_NHAT_NOI_DUNG)
    # id của ảnh trong bảng `anh` (tải lên qua /api/anh), hoặc bỏ trống.
    anh_bia: str | None = Field(default=None, max_length=100)
    ten_khach: str | None = Field(default=None, max_length=200)
    da_dang: bool = False
    # Để trống thì máy tự đặt theo tiêu đề. Người dùng sửa được vì đổi tiêu đề
    # của một bài ĐÃ ĐĂNG mà đường dẫn đổi theo là làm chết mọi link đã chia sẻ.
    duong_dan: str | None = Field(default=None, max_length=80)


def _chot_duong_dan(than: BaiVietVao, tru_ma: int | None = None) -> str:
    if than.duong_dan and than.duong_dan.strip():
        goc = tao_duong_dan(than.duong_dan)
        if db.duong_dan_dang_dung(goc, tru_ma):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Đường dẫn '{goc}' đã có bài khác dùng. Chọn đường dẫn khác nhé.",
            )
        return goc
    return duong_dan_chua_dung(than.tieu_de, tru_ma)


def _chan_khach_thu_dang(vai: str, da_dang: bool) -> None:
    if da_dang and vai != VAI_QUAN_TRI:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Tài khoản dùng thử viết và sửa được bài nháp, nhưng không đăng "
                "bài lên trang công khai. Lưu bài ở dạng nháp giúp mình nhé."
            ),
        )


@router.get("/api/quan-tri/bai-viet")
def danh_sach_quan_tri(_ai: tuple[str, str] = Depends(nguoi_dang_nhap)):
    """Cả bài nháp lẫn bài đã đăng. Nháp xếp lên trước."""
    _can_db()
    return db.danh_sach_bai_viet(chi_da_dang=False)


@router.get("/api/quan-tri/bai-viet/{ma}")
def doc_bai_quan_tri(ma: int, _ai: tuple[str, str] = Depends(nguoi_dang_nhap)):
    _can_db()
    bai = db.lay_bai_viet(ma)
    if bai is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Không có bài #{ma}."
        )
    return bai


@router.post("/api/quan-tri/bai-viet", status_code=status.HTTP_201_CREATED)
def them_bai(than: BaiVietVao, ai: tuple[str, str] = Depends(nguoi_dang_nhap)):
    _can_db()
    ten, vai = ai
    _chan_khach_thu_dang(vai, than.da_dang)
    return db.them_bai_viet(
        duong_dan=_chot_duong_dan(than),
        tieu_de=than.tieu_de.strip(),
        tom_tat=than.tom_tat.strip(),
        noi_dung=than.noi_dung.strip(),
        anh_bia=(than.anh_bia or "").strip() or None,
        ten_khach=(than.ten_khach or "").strip() or None,
        da_dang=than.da_dang,
        nguoi_sua=ten,
    )


@router.put("/api/quan-tri/bai-viet/{ma}")
def sua_bai(ma: int, than: BaiVietVao, ai: tuple[str, str] = Depends(nguoi_dang_nhap)):
    _can_db()
    ten, vai = ai

    dang_co = db.lay_bai_viet(ma)
    if dang_co is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Không có bài #{ma}."
        )

    # Chặn hai việc khác nhau, cùng một lý do.
    #   · Đăng một bài nháp — chuyện rõ ràng.
    #   · Sửa một bài ĐANG ĐĂNG — cũng là viết lên trang công khai, chỉ khác là
    #     đi cửa sau. Thiếu vế này thì tài khoản dùng thử vẫn thay được toàn bộ
    #     chữ trong một bài đã đăng mà không phạm luật nào.
    _chan_khach_thu_dang(vai, than.da_dang or dang_co["da_dang"])

    bai = db.sua_bai_viet(
        ma=ma,
        duong_dan=_chot_duong_dan(than, tru_ma=ma),
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
def xoa_bai(ma: int, _ten: str = Depends(CHI_QUAN_TRI_XOA)):
    _can_db()
    if not db.xoa_bai_viet(ma):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Không có bài #{ma}."
        )
    return {"ok": True, "id": ma}
