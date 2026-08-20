"""Tải ảnh lên từ trang quản trị, và phục vụ ảnh cho website.

Trước tính năng này, muốn đổi ảnh một sản phẩm phải: chép file vào public/anh/
→ gõ đường dẫn tay trong /admin → commit → push → chờ deploy. Ai không dùng Git
thì không tự làm được. Giờ chọn file ngay trong trang quản trị là xong.

BỐN ĐƯỜNG DẪN:
  POST   /api/anh        tải lên            — cần đăng nhập (cả tài khoản thử)
  GET    /api/anh        danh sách đã có    — cần đăng nhập
  GET    /api/anh/{id}   xem một tấm        — CÔNG KHAI, website gọi
  DELETE /api/anh/{id}   xóa                — chỉ quản trị thật

Ảnh lưu trong PostgreSQL chứ không ghi ra đĩa — xem lý do ở bảng `anh` trong
db.py (ổ đĩa của Render gói free là ổ tạm, deploy lại là mất sạch).
"""

import logging
import secrets

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import Response

import db
from auth import chi_quan_tri, yeu_cau_dang_nhap

log = logging.getLogger("imob.anh")

router = APIRouter(tags=["anh"])

CHI_QUAN_TRI = chi_quan_tri("Tài khoản dùng thử không xóa được ảnh.")

# ============================================================
# Giới hạn
#
# Trình duyệt đã nén ảnh sang WebP trước khi gửi (ChonAnh.jsx), nên một tấm
# thường chỉ 80–200KB. Đặt trần 5MB để vẫn nhận được cả trường hợp trình duyệt
# cũ không nén được, mà chặn được người cố tình nhét file lớn vào database.
#
# Postgres gói free chỉ 1GB dùng chung cho MỌI THỨ (nội dung, liên hệ, ảnh).
# TONG_DUNG_LUONG_TOI_DA giữ phần ảnh trong 200MB — chạm trần thì từ chối tải
# thêm kèm câu chỉ rõ phải xóa bớt, thay vì để database đầy rồi hỏng cả CMS lẫn
# việc lưu liên hệ của khách cùng một lúc.
# ============================================================
KICH_THUOC_TOI_DA = 5 * 1024 * 1024
TONG_DUNG_LUONG_TOI_DA = 200 * 1024 * 1024

# Chỉ nhận ảnh, và chỉ những định dạng trình duyệt nào cũng mở được.
# CỐ Ý KHÔNG nhận SVG: file SVG chạy được JavaScript, mà ảnh này sẽ phục vụ từ
# cùng tên miền API — một tấm "ảnh" SVG có mã độc bên trong là một lỗ XSS.
KIEU_CHO_PHEP = {
    "image/webp": "webp",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/avif": "avif",
}

# Chữ ký ở đầu file (magic bytes). Người gửi tự khai content-type nên không tin
# được — đổi đuôi file .exe thành .png rồi khai "image/png" là qua mặt được nếu
# chỉ nhìn phần khai báo.
CHU_KY = {
    "image/jpeg": [b"\xff\xd8\xff"],
    "image/png": [b"\x89PNG\r\n\x1a\n"],
    "image/gif": [b"GIF87a", b"GIF89a"],
}


def _kiem_du_lieu_anh(kieu: str, du_lieu: bytes) -> bool:
    """Nội dung file có đúng là ảnh như đã khai không?"""
    if kieu in ("image/webp", "image/avif"):
        # Cả hai đều nằm trong vỏ RIFF/ISO-BMFF: 4 byte đầu rồi tới nhãn ở byte 8.
        if kieu == "image/webp":
            return du_lieu[:4] == b"RIFF" and du_lieu[8:12] == b"WEBP"
        return du_lieu[4:8] == b"ftyp"
    return any(du_lieu.startswith(k) for k in CHU_KY.get(kieu, []))


def _bat_buoc_co_db() -> None:
    if not db.co_db():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Máy chủ chưa cấu hình database nên chưa tải ảnh lên được.",
        )


@router.post("/api/anh", status_code=status.HTTP_201_CREATED)
async def tai_len(
    file: UploadFile = File(...),
    nguoi_tai_len: str = Depends(yeu_cau_dang_nhap),
):
    _bat_buoc_co_db()

    kieu = (file.content_type or "").split(";")[0].strip().lower()
    if kieu not in KIEU_CHO_PHEP:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Chỉ nhận ảnh JPG, PNG, WebP, AVIF hoặc GIF. "
                "File SVG bị từ chối vì có thể chứa mã chạy được."
            ),
        )

    du_lieu = await file.read()

    if not du_lieu:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="File rỗng."
        )

    if len(du_lieu) > KICH_THUOC_TOI_DA:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=(
                f"Ảnh nặng {len(du_lieu) // 1024 // 1024}MB, vượt mức "
                f"{KICH_THUOC_TOI_DA // 1024 // 1024}MB."
            ),
        )

    if not _kiem_du_lieu_anh(kieu, du_lieu):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nội dung file không phải là ảnh như phần mở rộng khai báo.",
        )

    da_dung = db.tong_dung_luong_anh()
    if da_dung + len(du_lieu) > TONG_DUNG_LUONG_TOI_DA:
        raise HTTPException(
            status_code=status.HTTP_507_INSUFFICIENT_STORAGE,
            detail=(
                f"Kho ảnh đã dùng {da_dung // 1024 // 1024}MB trên mức "
                f"{TONG_DUNG_LUONG_TOI_DA // 1024 // 1024}MB. "
                "Xóa bớt ảnh cũ rồi tải lại."
            ),
        )

    # Mã ngẫu nhiên chứ không đánh số tăng dần: đường dẫn ảnh là công khai, đánh
    # số thì ai cũng đoán được /api/anh/1, /api/anh/2 để duyệt hết kho ảnh —
    # trong đó có thể có maket sản phẩm chưa tới ngày công bố.
    ma = f"{secrets.token_urlsafe(12)}.{KIEU_CHO_PHEP[kieu]}"

    db.them_anh(
        ma=ma,
        ten_goc=(file.filename or "anh")[:200],
        kieu=kieu,
        du_lieu=du_lieu,
        nguoi_tai_len=nguoi_tai_len,
    )

    return {
        "id": ma,
        "duong_dan": f"/api/anh/{ma}",
        "kich_thuoc": len(du_lieu),
        "ten_goc": file.filename,
    }


@router.get("/api/anh")
def danh_sach(_: str = Depends(yeu_cau_dang_nhap)):
    _bat_buoc_co_db()
    return {
        "danh_sach": db.danh_sach_anh(),
        "da_dung": db.tong_dung_luong_anh(),
        "toi_da": TONG_DUNG_LUONG_TOI_DA,
    }


@router.get("/api/anh/{ma}")
def xem(ma: str):
    """Đường dẫn CÔNG KHAI — thẻ <img> trên website trỏ thẳng vào đây."""
    tam = db.lay_anh(ma)
    if tam is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Không có ảnh này."
        )

    # immutable + 1 năm: mã ảnh sinh ngẫu nhiên và KHÔNG BAO GIỜ được dùng lại
    # cho tấm khác, nên nội dung ở một địa chỉ là bất biến. Nhờ vậy trình duyệt
    # tải mỗi tấm đúng MỘT lần rồi thôi.
    #
    # Việc này quan trọng hơn bình thường ở đây: API nằm trên Render gói free và
    # NGỦ sau 15 phút. Không có cache thì mỗi khách vào lúc máy chủ vừa ngủ dậy
    # sẽ thấy ảnh trống 30–50 giây. Có cache thì chỉ người đầu tiên chịu, và chỉ
    # một lần duy nhất.
    return Response(
        content=bytes(tam["du_lieu"]),
        media_type=tam["kieu"],
        headers={
            "Cache-Control": "public, max-age=31536000, immutable",
            # Ảnh do người dùng tải lên: cấm trình duyệt tự đoán lại kiểu file.
            "X-Content-Type-Options": "nosniff",
        },
    )


@router.delete("/api/anh/{ma}")
def xoa(ma: str, _: str = Depends(CHI_QUAN_TRI)):
    """Chỉ quản trị thật được xóa.

    Tài khoản dùng thử tải lên được nhưng không xóa được: mật khẩu của nó là
    công khai, mà xóa ảnh thì không hoàn tác được — người lạ vào nghịch một
    phút là mất sạch maket sản phẩm.
    """
    _bat_buoc_co_db()
    if not db.xoa_anh(ma):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Không có ảnh này."
        )
    return {"ok": True, "id": ma}
