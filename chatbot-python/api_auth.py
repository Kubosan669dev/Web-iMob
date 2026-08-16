"""Đường dẫn đăng nhập trang quản trị."""

from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel

import auth
import db

router = APIRouter(tags=["quan-tri"])


class YeuCauDangNhap(BaseModel):
    ten_dang_nhap: str
    mat_khau: str


class KetQuaDangNhap(BaseModel):
    ve: str
    het_han_sau: int  # số giây
    ten_dang_nhap: str


@router.post("/api/dang-nhap", response_model=KetQuaDangNhap)
def dang_nhap(yeu_cau: YeuCauDangNhap, request: Request):
    if not db.co_db():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Máy chủ chưa cấu hình database nên chưa dùng được trang quản trị.",
        )

    # Bị khóa vì sai quá nhiều lần thì chặn ngay, khỏi động tới database.
    auth.kiem_tra_bi_khoa(request)

    nguoi = db.lay_nguoi_dung(yeu_cau.ten_dang_nhap.strip())

    # CỐ Ý kiểm mật khẩu cả khi không tìm thấy tài khoản, và trả về CÙNG MỘT câu
    # lỗi cho hai trường hợp "sai tên" và "sai mật khẩu". Nếu phân biệt, kẻ dò sẽ
    # biết được tên đăng nhập nào có thật để tập trung phá.
    hop_le = nguoi is not None and auth.kiem_mat_khau(
        yeu_cau.mat_khau, nguoi["mat_khau_hash"]
    )

    if not hop_le:
        auth.ghi_nhan_sai(request)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không đúng.",
        )

    auth.xoa_dem_sai(request)
    ve, het_han_sau = auth.tao_ve(nguoi["ten_dang_nhap"])
    return {
        "ve": ve,
        "het_han_sau": het_han_sau,
        "ten_dang_nhap": nguoi["ten_dang_nhap"],
    }
