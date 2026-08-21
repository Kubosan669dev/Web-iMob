"""Đường dẫn đăng nhập trang quản trị."""

import os

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
    vai_tro = nguoi.get("vai_tro") or auth.VAI_QUAN_TRI
    ve, het_han_sau = auth.tao_ve(nguoi["ten_dang_nhap"], vai_tro)
    return {
        "ve": ve,
        "het_han_sau": het_han_sau,
        "ten_dang_nhap": nguoi["ten_dang_nhap"],
        "vai_tro": vai_tro,
    }


# ============================================================
# DÒNG TÀI KHOẢN HIỆN Ở MÀN HÌNH ĐĂNG NHẬP — đường dẫn CÔNG KHAI
#
# Trả về đúng tên và mật khẩu để trang /admin in lên cho người kiểm thử tự vào.
# Nghe ngược đời, nhưng đây chính là thứ công ty yêu cầu, và nó KHÔNG mở thêm
# cửa nào: mật khẩu đó dù sao cũng đang được in trên màn hình đăng nhập rồi.
#
# HAI NGUỒN, ưu tiên từ trên xuống:
#   1. Bảng tai_khoan_demo  — chỉnh trong /admin, có hiệu lực ngay
#   2. TESTER_USER/TESTER_PASSWORD — biến môi trường, cách cũ, giữ để bản đang
#      chạy không hỏng khi deploy bản mới
#
# ⚠️ CÔNG TY CHỌN HIỆN TÀI KHOẢN QUẢN TRỊ THẬT (20/08/2026), sau khi đã được
# nói rõ hậu quả bằng văn bản: ai vào /admin cũng đọc được toàn bộ họ tên, số
# điện thoại, email và lời nhắn của khách trong mục Tin nhắn, và xoá được nội
# dung website. Đây là quyết định của chủ sở hữu hệ thống, không phải mặc định
# của phần mềm — mặc định vẫn là TẮT.
#
# Vì vậy chỗ này KHÔNG tự đoán tài khoản nào để hiện. Nó chỉ in đúng cái đã
# được lưu, và trang quản trị có nhiệm vụ cảnh báo mỗi lần lưu (xem
# /api/cai-dat-demo bên dưới).
# ============================================================
# ⚠️⚠️ CỜ CỦA GIAI ĐOẠN DEMO — ĐỔI VỀ False TRƯỚC KHI BÀN GIAO THẬT ⚠️⚠️
#
# True  = màn hình đăng nhập tự hiện luôn ADMIN_USER / ADMIN_PASSWORD, không
#         phải đặt thêm biến nào trên Render, không phải bật gì trong /admin.
#         Người kiểm thử mở /admin là vào được ngay.
# False = chỉ hiện khi đã cấu hình riêng (trong /admin, hoặc TESTER_USER).
#
# Công ty quyết định 20/08/2026: "đây là bản demo nên tôi muốn tester thử chứ
# sau này sẽ sửa sau". Đặt True cho đúng giai đoạn đó.
#
# HẬU QUẢ KHI ĐỂ True — đã trình bày với công ty bằng văn bản trước khi làm:
# bất kỳ ai mở /admin cũng đọc được mật khẩu TOÀN QUYỀN, nên xem được toàn bộ
# mục Tin nhắn (họ tên, số điện thoại, email, lời nhắn của khách thật — dữ
# liệu cá nhân, Nghị định 13/2023) và xoá được nội dung website.
#
# HAI CÁCH TẮT, chọn cách nào cũng được:
#   · Đổi dòng dưới về False rồi deploy.
#   · Hoặc vào /admin → Khác → "Đăng nhập thử", bỏ tick, Lưu. Bản ghi trong
#     database THẮNG cờ này, nên tắt được ngay mà không cần deploy lại.
BAN_DEMO_HIEN_TAI_KHOAN_QUAN_TRI = True


@router.get("/api/tai-khoan-thu")
def tai_khoan_thu():
    """Trả {} khi tắt — giao diện tự ẩn dòng gợi ý."""
    if not db.co_db():
        return {}

    cai_dat = db.lay_tai_khoan_demo()
    if cai_dat is not None:
        if not cai_dat["bat"]:
            # Đã tắt trong /admin thì TẮT HẲN, không lùi về biến môi trường.
            # Không có dòng này thì bấm tắt xong dòng chữ vẫn còn — người bấm
            # tưởng nút hỏng, trong khi thật ra nó đang đọc biến cũ trên Render.
            return {}
        if cai_dat["ten_hien"] and cai_dat["mat_khau_hien"]:
            return {"ten": cai_dat["ten_hien"], "mat_khau": cai_dat["mat_khau_hien"]}

    ten = os.getenv("TESTER_USER", "").strip()
    mat_khau = os.getenv("TESTER_PASSWORD", "")
    if ten and mat_khau:
        return {"ten": ten, "mat_khau": mat_khau}

    # Nguồn cuối cùng: chính tài khoản quản trị. Chỉ chạy trong giai đoạn demo
    # — xem khối cảnh báo ở trên. Máy chủ đã có sẵn hai biến này nên không phải
    # cấu hình thêm gì cả.
    if BAN_DEMO_HIEN_TAI_KHOAN_QUAN_TRI:
        ten = os.getenv("ADMIN_USER", "").strip()
        mat_khau = os.getenv("ADMIN_PASSWORD", "")
        if ten and mat_khau:
            return {"ten": ten, "mat_khau": mat_khau}

    return {}


# ============================================================
# Chỉnh dòng đó ngay trong /admin — khỏi phải mở Render
# ============================================================
CHI_QUAN_TRI = auth.chi_quan_tri(
    "Chỉ tài khoản quản trị mới đổi được dòng tài khoản trên màn hình đăng nhập."
)


class CaiDatDemo(BaseModel):
    bat: bool
    ten: str = ""
    mat_khau: str = ""


@router.get("/api/cai-dat-demo")
def doc_cai_dat_demo(_: str = Depends(CHI_QUAN_TRI)):
    if not db.co_db():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Chưa cấu hình database.",
        )

    cai_dat = db.lay_tai_khoan_demo()
    if cai_dat is None:
        # Chưa ai đặt gì -> lấy biến môi trường làm giá trị mở đầu, để người
        # đang dùng cách cũ mở trang lên là thấy đúng cái đang chạy.
        ten = os.getenv("TESTER_USER", "").strip()
        mat_khau = os.getenv("TESTER_PASSWORD", "")
        return {
            "bat": bool(ten and mat_khau),
            "ten": ten,
            "mat_khau": mat_khau,
            "vai_tro": db.vai_tro_cua(ten) if ten else None,
        }

    return {
        "bat": cai_dat["bat"],
        "ten": cai_dat["ten_hien"],
        "mat_khau": cai_dat["mat_khau_hien"],
        "vai_tro": db.vai_tro_cua(cai_dat["ten_hien"]) if cai_dat["ten_hien"] else None,
        "nguoi_sua": cai_dat["nguoi_sua"],
    }


@router.put("/api/cai-dat-demo")
def ghi_cai_dat_demo(than: CaiDatDemo, nguoi_sua: str = Depends(CHI_QUAN_TRI)):
    if not db.co_db():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Chưa cấu hình database.",
        )

    ten = than.ten.strip()
    mat_khau = than.mat_khau

    if than.bat:
        if not ten or not mat_khau:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Bật thì phải điền cả tên đăng nhập và mật khẩu.",
            )

        # ⚠️ KIỂM MẬT KHẨU CÓ ĐĂNG NHẬP ĐƯỢC THẬT KHÔNG, trước khi cho lưu.
        #
        # Không kiểm thì gõ sai một ký tự là màn hình đăng nhập in ra một mật
        # khẩu SAI. Người kiểm thử tin vào dòng đó, gõ đúng 5 lần, rồi bị khoá
        # IP 15 phút mà không hiểu vì sao — lỗi này rất khó lần ra vì nhìn đâu
        # cũng thấy "đã cấu hình xong".
        nguoi = db.lay_nguoi_dung(ten)
        if nguoi is None or not auth.kiem_mat_khau(mat_khau, nguoi["mat_khau_hash"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Cặp tên đăng nhập / mật khẩu này KHÔNG đăng nhập được. "
                    "Từ chối lưu, vì hiện một mật khẩu sai lên màn hình sẽ làm "
                    "người kiểm thử gõ sai nhiều lần rồi bị khoá IP 15 phút."
                ),
            )

    db.ghi_tai_khoan_demo(than.bat, ten, mat_khau, nguoi_sua)

    vai_tro = db.vai_tro_cua(ten) if ten else None
    return {"ok": True, "bat": than.bat, "vai_tro": vai_tro}