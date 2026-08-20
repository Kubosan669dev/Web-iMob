"""Khách để lại thông tin: nhận từ form liên hệ, và xem trong trang quản trị.

POST công khai — ai cũng gọi được, nên phải chặn spam và giới hạn độ dài.
GET / PATCH cần đăng nhập.
"""

import re
import time

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field, field_validator

import db
from auth import chi_quan_tri

router = APIRouter(tags=["lien-he"])

CHI_QUAN_TRI = chi_quan_tri(
    "Tài khoản dùng thử không xem được thông tin khách hàng."
)

REGEX_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

# Chặn spam: mỗi IP tối đa 5 lượt gửi trong 1 giờ.
SO_LUOT_TOI_DA = 5
CUA_SO_GIAY = 3600
_lich_su_gui: dict[str, list[float]] = {}


def _chan_spam(request: Request) -> None:
    chuyen_tiep = request.headers.get("x-forwarded-for", "")
    ip = (
        chuyen_tiep.split(",")[0].strip()
        if chuyen_tiep
        else (request.client.host if request.client else "khong-ro")
    )

    bay_gio = time.time()
    moc = _lich_su_gui.get(ip, [])
    # Bỏ các lượt đã quá cũ, chỉ giữ những lượt trong cửa sổ 1 giờ gần đây.
    moc = [t for t in moc if bay_gio - t < CUA_SO_GIAY]

    if len(moc) >= SO_LUOT_TOI_DA:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Bạn đã gửi khá nhiều lần. Vui lòng thử lại sau hoặc gọi hotline giúp mình nhé.",
        )

    moc.append(bay_gio)
    _lich_su_gui[ip] = moc


class GuiLienHe(BaseModel):
    # Giới hạn độ dài ngay ở cửa: tránh ai đó nhét vài MB chữ vào database.
    name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=1, max_length=200)
    phone: str = Field(default="", max_length=40)
    service: str = Field(default="", max_length=120)
    message: str = Field(min_length=1, max_length=5000)

    @field_validator("email")
    @classmethod
    def kiem_email(cls, v: str) -> str:
        if not REGEX_EMAIL.match(v.strip()):
            raise ValueError("Email không đúng định dạng.")
        return v.strip()


@router.post("/api/lien-he", status_code=status.HTTP_201_CREATED)
def gui_lien_he(than: GuiLienHe, request: Request):
    _chan_spam(request)

    if not db.co_db():
        # KHÔNG báo thành công giả. Website sẽ hiện lỗi thật kèm hotline để
        # khách còn có đường liên lạc khác — mất khách vì tưởng đã gửi được
        # thì tệ hơn nhiều so với hiện một thông báo lỗi.
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Hệ thống chưa sẵn sàng nhận liên hệ. Vui lòng gọi hotline giúp mình nhé.",
        )

    ma = db.them_lien_he(
        nguon="form",
        ho_ten=than.name.strip(),
        email=than.email,
        so_dien_thoai=than.phone.strip() or None,
        dich_vu=than.service.strip() or None,
        loi_nhan=than.message.strip(),
    )
    return {"ok": True, "id": ma}


# ============================================================
# Để lại liên hệ NHANH ngay trong khung chat
#
# Vì sao không dùng chung /api/lien-he ở trên: đường đó bắt buộc có `name`,
# `message` và một `email` ĐÚNG ĐỊNH DẠNG. Khách đang chat thì phần lớn chỉ
# muốn thả lại đúng số điện thoại rồi thôi — bắt điền đủ ba trường ngay trong
# khung chat là mất luôn cái lead đó.
#
# Đổi lại, dữ liệu vào đây MỎNG hơn (thường chỉ có một dòng liên hệ), nên nó
# được ghi với nguon="chatbot" để người trực ở /admin phân biệt được ngay đâu
# là form đầy đủ, đâu là số nhặt từ chat.
#
# Vẫn đi qua _chan_spam() chung với form: 5 lượt/IP/giờ.
# ============================================================
REGEX_SDT = re.compile(r"^[0-9+().\s-]{8,20}$")


class LienHeNhanh(BaseModel):
    # Một dòng duy nhất: số điện thoại HOẶC email, khách gõ kiểu nào cũng nhận.
    lien_he: str = Field(min_length=3, max_length=200)
    # Câu hỏi khách vừa gõ trong chat (nếu có) — giúp người gọi lại biết ngữ
    # cảnh. Không bắt buộc.
    ghi_chu: str = Field(default="", max_length=2000)


@router.post("/api/lien-he-nhanh", status_code=status.HTTP_201_CREATED)
def lien_he_nhanh(than: LienHeNhanh, request: Request):
    _chan_spam(request)

    gia_tri = than.lien_he.strip()
    la_email = bool(REGEX_EMAIL.match(gia_tri))
    la_sdt = bool(REGEX_SDT.match(gia_tri)) and sum(c.isdigit() for c in gia_tri) >= 8

    if not (la_email or la_sdt):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Bạn nhập giúp mình số điện thoại hoặc email nhé.",
        )

    if not db.co_db():
        # KHÔNG báo thành công giả — xem lý do ở /api/lien-he phía trên.
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Hệ thống chưa sẵn sàng nhận liên hệ. Bạn gọi hotline giúp mình nhé.",
        )

    ma = db.them_lien_he(
        nguon="chatbot",
        ho_ten=None,
        email=gia_tri if la_email else None,
        so_dien_thoai=gia_tri if la_sdt else None,
        dich_vu=None,
        loi_nhan=than.ghi_chu.strip() or "Khách để lại liên hệ trong khung chat.",
    )
    return {"ok": True, "id": ma}


# ⚠️ yeu_cau_quan_tri chứ KHÔNG phải yeu_cau_dang_nhap (đổi 20/08/2026).
# Từ khi có tài khoản dùng thử hiện mật khẩu công khai ở màn hình đăng nhập,
# "đã đăng nhập" không còn đồng nghĩa với "được tin cậy". Bảng lien_he chứa họ
# tên, số điện thoại, email và lời nhắn của khách thật — dữ liệu cá nhân theo
# Nghị định 13/2023. Để nguyên yeu_cau_dang_nhap thì công bố mật khẩu ở trang
# admin chính là công bố luôn danh sách khách hàng.
@router.get("/api/lien-he")
def danh_sach(_: str = Depends(CHI_QUAN_TRI)):
    if not db.co_db():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Chưa cấu hình database.",
        )
    return db.danh_sach_lien_he()


class DanhDau(BaseModel):
    da_xu_ly: bool


@router.patch("/api/lien-he/{ma}")
def danh_dau(ma: int, than: DanhDau, _: str = Depends(CHI_QUAN_TRI)):
    if not db.co_db():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Chưa cấu hình database.",
        )
    if not db.danh_dau_lien_he(ma, than.da_xu_ly):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy liên hệ #{ma}.",
        )
    return {"ok": True, "id": ma, "da_xu_ly": than.da_xu_ly}
