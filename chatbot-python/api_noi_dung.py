"""Đọc/ghi nội dung website (thông tin công ty, trang pháp lý).

GET công khai — website gọi mỗi lần khách vào trang.
PUT cần đăng nhập — chỉ trang quản trị gọi.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

import db
from auth import yeu_cau_dang_nhap

router = APIRouter(tags=["noi-dung"])

# Chỉ chấp nhận đúng các khóa này. Không cho tự đặt khóa mới — tránh việc trang
# admin (hoặc ai đó gọi thẳng API) nhét dữ liệu rác vào bảng.
KHOA_HOP_LE = {"company", "legalPages", "hero", "about", "giaoDien"}


class GhiNoiDung(BaseModel):
    du_lieu: dict


@router.get("/api/noi-dung")
def doc_noi_dung():
    """Trả về toàn bộ nội dung đang lưu, dạng {'company': {...}, ...}.

    Chưa cấu hình database thì trả về rỗng — website tự dùng bản JSON đóng gói
    sẵn trong bundle làm mặc định, khách không thấy lỗi gì.
    """
    return db.lay_tat_ca_noi_dung()


@router.put("/api/noi-dung/{khoa}")
def ghi_noi_dung(
    khoa: str,
    than: GhiNoiDung,
    nguoi_sua: str = Depends(yeu_cau_dang_nhap),
):
    if khoa not in KHOA_HOP_LE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Khóa '{khoa}' không hợp lệ. Chỉ nhận: {', '.join(sorted(KHOA_HOP_LE))}.",
        )
    if not than.du_lieu:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Dữ liệu rỗng — từ chối ghi đè để tránh xóa nhầm nội dung.",
        )

    db.ghi_noi_dung(khoa, than.du_lieu, nguoi_sua)
    return {"ok": True, "khoa": khoa, "nguoi_sua": nguoi_sua}
