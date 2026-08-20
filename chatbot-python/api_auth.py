"""Đường dẫn đăng nhập trang quản trị."""

import os

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
    vai_tro: str


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
    vai_tro = nguoi.get("vai_tro") or auth.VAI_QUAN_TRI
    ve, het_han_sau = auth.tao_ve(nguoi["ten_dang_nhap"], vai_tro)
    return {
        "ve": ve,
        "het_han_sau": het_han_sau,
        "ten_dang_nhap": nguoi["ten_dang_nhap"],
        "vai_tro": vai_tro,
    }


# ============================================================
# Tài khoản dùng thử — đường dẫn CÔNG KHAI
#
# Trả về đúng tên và mật khẩu của tài khoản kiểm thử để màn hình đăng nhập hiện
# lên cho người test tự vào. Nghe thì ngược đời, nhưng đây chính là thứ công ty
# yêu cầu, và nó KHÔNG mở thêm cửa nào: mật khẩu đó dù sao cũng đang được in
# trên màn hình đăng nhập rồi.
#
# VÌ SAO LẤY TỪ API CHỨ KHÔNG VIẾT VÀO BIẾN VITE_ CỦA WEBSITE:
# Biến VITE_ bị nhúng cứng vào file JavaScript lúc build và nằm ở Vercel, trong
# khi tài khoản thật nằm ở Render. Hai nơi thì sớm muộn cũng lệch nhau — đổi
# TESTER_PASSWORD trên Render mà quên sửa bên Vercel là màn hình hiện một mật
# khẩu sai, người test gõ 5 lần rồi bị khóa IP 15 phút mà không hiểu vì sao.
# Lấy từ API thì chỉ có MỘT nguồn sự thật, và tắt cũng chỉ cần bỏ trống biến
# trên Render là xong, không phải build lại website.
# ============================================================
@router.get("/api/tai-khoan-thu")
def tai_khoan_thu():
    """Trả {} khi tính năng tắt — giao diện tự ẩn dòng gợi ý."""
    ten = os.getenv("TESTER_USER", "").strip()
    mat_khau = os.getenv("TESTER_PASSWORD", "")

    # Kiểm cả co_db(): biến đã đặt nhưng database chết thì tài khoản kia không
    # tồn tại, hiện ra chỉ tổ làm người test gõ vào rồi nhận "sai mật khẩu".
    if not ten or not mat_khau or not db.co_db():
        return {}

    return {"ten": ten, "mat_khau": mat_khau}
