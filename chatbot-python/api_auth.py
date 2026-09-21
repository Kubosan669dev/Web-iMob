"""Đường dẫn đăng nhập — dùng chung cho CẢ quản trị lẫn thành viên.

Một đường dẫn cho cả hai vai, cố ý. Làm hai đường riêng (/api/dang-nhap và
/api/dang-nhap-thanh-vien) thì phải trả lời được câu "gõ tài khoản thành viên
vào ô đăng nhập của admin thì sao?" — và mọi câu trả lời đều tệ: hoặc lộ ra
tài khoản đó có thật, hoặc báo một lỗi mà người gõ không hiểu. Ở đây ai gõ
đúng thì vào, còn đi được tới đâu thì vai trò trong vé quyết định.

Việc phân quyền nằm ở auth.chi_quan_tri(), không nằm ở đây.
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status
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
    ho_ten: str = ""


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
    #
    # ⚠️ 21/08/2026 — TRƯỚC ĐÂY DÒNG NÀY VIẾT:
    #       hop_le = nguoi is not None and auth.kiem_mat_khau(...)
    # và nó KHÔNG làm được điều ghi chú trên vừa hứa. Python gặp vế trái sai là
    # bỏ qua vế phải, nên tên đăng nhập không có thật thì bcrypt không hề chạy.
    # Đo trên bản đang chạy: tên không có thật 0,28 giây, tên có thật 1,88 giây
    # — chênh gần 7 lần, bấm giờ là dò ra được tên nào tồn tại.
    # Nay gọi kiem_mat_khau_gia() để hai nhánh tốn thời gian như nhau. Xem thêm
    # ghi chú dài trong auth.py.
    if nguoi is not None:
        hop_le = auth.kiem_mat_khau(yeu_cau.mat_khau, nguoi["mat_khau_hash"])
    else:
        hop_le = auth.kiem_mat_khau_gia(yeu_cau.mat_khau)

    if not hop_le:
        auth.ghi_nhan_sai(request)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không đúng.",
        )

    auth.xoa_dem_sai(request)
    # Thiếu vai thì coi là THÀNH VIÊN, tức quyền thấp nhất. Cột vai_tro trong
    # database là NOT NULL nên diện này gần như không xảy ra; để mặc định rơi
    # về quan_tri (như bản trước 21/09/2026) thì một dòng dữ liệu hỏng sẽ phát
    # ra vé quản trị, còn rơi về thanh_vien thì cùng lắm là vào không được.
    vai_tro = nguoi.get("vai_tro") or auth.VAI_THANH_VIEN
    ve, het_han_sau = auth.tao_ve(nguoi["ten_dang_nhap"], vai_tro)
    db.ghi_nhan_dang_nhap(nguoi["ten_dang_nhap"])
    return {
        "ve": ve,
        "het_han_sau": het_han_sau,
        "ten_dang_nhap": nguoi["ten_dang_nhap"],
        "vai_tro": vai_tro,
        "ho_ten": nguoi.get("ho_ten") or "",
    }

