"""Tài khoản thành viên: đăng ký, xem và sửa hồ sơ của chính mình.

KHÁC GÌ api_auth.py: file kia chỉ lo việc ĐĂNG NHẬP, dùng chung cho cả quản trị
lẫn thành viên (cùng một bảng tài khoản, cùng một lò phát vé). File này lo phần
riêng của thành viên — thứ mà tài khoản quản trị không bao giờ cần tới.

RANH GIỚI QUAN TRỌNG: không đường dẫn nào ở đây nhận `vai_tro` từ người gọi.
Đăng ký luôn cho ra vai 'thanh_vien', viết cứng trong db.them_thanh_vien. Muốn
có thêm quản trị thì đặt biến môi trường ADMIN_USER/ADMIN_PASSWORD rồi khởi
động lại máy chủ — không có đường nào khác, và đó là chủ ý.

CHƯA CÓ QUÊN MẬT KHẨU. Máy chủ hiện không gửi được email, nên không làm được
khâu gửi link đặt lại. Ai quên thì quản trị đặt lại giúp. Ghi rõ ở đây để lần
sau không ai đi tìm xem chức năng đó nằm đâu.
"""

import os
import re
import unicodedata

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel

import auth
import db

router = APIRouter(tags=["thanh-vien"])

# ============================================================
# Luật đặt tên đăng nhập
# ============================================================
# Chỉ chữ thường không dấu, số, và . _ - ở giữa. Vì sao hẹp vậy:
#   · Không dấu: tên đăng nhập phải gõ được trên mọi bàn phím, kể cả khi bộ gõ
#     tiếng Việt đang tắt. Tên hiển thị (ho_ten) thì thoải mái dấu.
#   · Chữ thường: chặn hẳn chuyện "Admin" và "admin" trông như hai người.
#   · Phải bắt đầu bằng chữ hoặc số: tên kiểu "-abc" hay ".abc" dễ bị nhầm với
#     tham số dòng lệnh hoặc file ẩn khi sau này xuất dữ liệu ra.
MAU_TEN = re.compile(r"^[a-z0-9][a-z0-9._-]{2,23}$")
DAI_TEN_TOI_THIEU = 3
DAI_TEN_TOI_DA = 24

DAI_MAT_KHAU_TOI_THIEU = 8
DAI_HO_TEN_TOI_DA = 60

# Tên không cho đăng ký: nghe như người của công ty. Một tài khoản tên "hotro"
# nhắn tin cho khách thì khách tin ngay, và đó là lừa đảo sẵn đường.
TEN_CAM = {
    "admin", "administrator", "quantri", "quan-tri", "quan_tri", "root",
    "imob", "imobvn", "imob-vn", "support", "hotro", "ho-tro", "hotline",
    "system", "moderator", "mod", "staff", "nhanvien", "official", "chinhthuc",
    "webmaster", "postmaster", "security", "baomat", "null", "undefined",
}


def _ten_admin() -> str:
    """Tên đăng nhập của quản trị, đọc từ biến môi trường.

    Cấm luôn tên này để không ai đăng ký chiếm chỗ. Chiếm được thì lần khởi
    động sau máy chủ sẽ ghi đè dòng đó thành tài khoản quản trị — người kia mất
    tài khoản, và trong log không có gì ghi lại chuyện vừa xảy ra.
    """
    return os.getenv("ADMIN_USER", "").strip().lower()


def chuan_hoa_ten(tho: str) -> str:
    return (tho or "").strip().lower()


def kiem_ten(ten: str) -> str | None:
    """Trả về câu lỗi, hoặc None nếu tên dùng được."""
    if len(ten) < DAI_TEN_TOI_THIEU:
        return f"Tên đăng nhập cần ít nhất {DAI_TEN_TOI_THIEU} ký tự."
    if len(ten) > DAI_TEN_TOI_DA:
        return f"Tên đăng nhập dài quá {DAI_TEN_TOI_DA} ký tự."
    if not MAU_TEN.match(ten):
        return (
            "Tên đăng nhập chỉ gồm chữ thường không dấu, số và các dấu . _ - "
            "và phải bắt đầu bằng chữ hoặc số. Ví dụ: nam.tran hoặc hoa_2026."
        )
    if ten in TEN_CAM or ten == _ten_admin():
        return "Tên đăng nhập này đã được giữ chỗ. Bạn chọn tên khác giúp mình nhé."
    return None


# Mấy mật khẩu ai cũng thử đầu tiên. Danh sách ngắn, cố ý: đây không phải bộ
# lọc mật khẩu yếu cho đủ bộ, chỉ chặn đúng vài cái tệ nhất.
MAT_KHAU_QUA_DE = {"12345678", "password", "matkhau", "qwertyui", "11111111"}


def kiem_mat_khau_moi(mat_khau: str, ten: str) -> str | None:
    """Trả về câu lỗi, hoặc None nếu mật khẩu dùng được.

    CỐ Ý KHÔNG bắt phải có chữ hoa, số và ký tự đặc biệt. Luật đó đẻ ra toàn
    "Matkhau@1" — đúng luật, vẫn nằm trong mọi danh sách dò. Độ dài mới là thứ
    làm mật khẩu khó đoán, nên ở đây chỉ chặn ba thứ tệ thật: quá ngắn, trùng
    tên đăng nhập, và mấy mật khẩu ai cũng thử đầu tiên.
    """
    if len(mat_khau) < DAI_MAT_KHAU_TOI_THIEU:
        return f"Mật khẩu cần ít nhất {DAI_MAT_KHAU_TOI_THIEU} ký tự."
    if len(mat_khau.encode("utf-8")) > auth.GIOI_HAN_BYTE_MAT_KHAU:
        # bcrypt cắt cụt ở 72 byte mà không báo gì. Nói thẳng còn hơn để người
        # ta đặt mật khẩu dài rồi phần đuôi bị bỏ trong im lặng.
        return (
            f"Mật khẩu dài quá (tối đa {auth.GIOI_HAN_BYTE_MAT_KHAU} byte; "
            "chữ tiếng Việt có dấu tốn 2-3 byte mỗi ký tự)."
        )
    if mat_khau.strip().lower() == ten:
        return "Mật khẩu không được trùng tên đăng nhập."
    if mat_khau.lower() in MAT_KHAU_QUA_DE:
        return "Mật khẩu này quá dễ đoán. Bạn đặt câu gì dài dài cho dễ nhớ mà khó dò nhé."
    return None


def don_ho_ten(tho: str) -> str:
    """Gọn khoảng trắng, cắt bớt, và bỏ ký tự điều khiển.

    Ký tự điều khiển (xuống dòng, tab, các mã vô hình) lọt vào tên hiển thị sẽ
    làm vỡ bố cục ở mọi chỗ in tên ra sau này, mà nhìn danh sách thì không thấy
    gì bất thường.

    Thay bằng KHOẢNG TRẮNG chứ không xoá thẳng. Bản đầu xoá thẳng, và dán một
    cái tên xuống dòng vào ô đó cho ra "TrầnVănNam" dính liền — người dùng thấy
    tên mình sai mà không đoán nổi vì sao. Thay bằng khoảng trắng rồi gom lại
    thì ra đúng "Trần Văn Nam".
    """
    sach = "".join(
        " " if unicodedata.category(c)[0] == "C" else c for c in (tho or "")
    )
    return " ".join(sach.split())[:DAI_HO_TEN_TOI_DA]


# ============================================================
# Kiểu dữ liệu
# ============================================================
class YeuCauDangKy(BaseModel):
    ten_dang_nhap: str
    mat_khau: str
    ho_ten: str = ""


class YeuCauDoiMatKhau(BaseModel):
    mat_khau_cu: str
    mat_khau_moi: str


class YeuCauSuaHoSo(BaseModel):
    ho_ten: str = ""


class HoSo(BaseModel):
    ten_dang_nhap: str
    ho_ten: str
    vai_tro: str
    tao_luc: str | None = None
    dang_nhap_luc: str | None = None


class KetQuaDangKy(BaseModel):
    ve: str
    het_han_sau: int
    ten_dang_nhap: str
    vai_tro: str
    ho_ten: str


def _can_db() -> None:
    if not db.co_db():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Máy chủ chưa cấu hình database nên chưa tạo được tài khoản.",
        )


def _khong_con_tai_khoan() -> HTTPException:
    """Vé còn hạn nhưng dòng tài khoản đã biến mất khỏi database."""
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Tài khoản này không còn nữa.",
    )


def _ra_ho_so(nguoi: dict) -> dict:
    def gio(khoa):
        moc = nguoi.get(khoa)
        return moc.isoformat() if moc else None

    return {
        "ten_dang_nhap": nguoi["ten_dang_nhap"],
        "ho_ten": nguoi.get("ho_ten") or "",
        "vai_tro": nguoi.get("vai_tro") or auth.VAI_THANH_VIEN,
        "tao_luc": gio("tao_luc"),
        "dang_nhap_luc": gio("dang_nhap_luc"),
    }


# ============================================================
# Đăng ký
# ============================================================
@router.post("/api/dang-ky", response_model=KetQuaDangKy, status_code=201)
def dang_ky(yeu_cau: YeuCauDangKy, request: Request):
    _can_db()
    auth.kiem_tra_dang_ky_qua_nhieu(request)

    ten = chuan_hoa_ten(yeu_cau.ten_dang_nhap)
    loi = kiem_ten(ten) or kiem_mat_khau_moi(yeu_cau.mat_khau, ten)
    if loi:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=loi)

    # Kiểm trùng trước CHỈ để nói được câu lỗi tử tế. Hàng rào thật là khóa
    # chính trong database (them_thanh_vien trả None nếu vướng) — hai người bấm
    # Đăng ký cùng lúc thì cả hai đều qua được bước này.
    if db.lay_nguoi_dung(ten) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Tên đăng nhập này đã có người dùng. Bạn thử tên khác nhé.",
        )

    nguoi = db.them_thanh_vien(
        ten, auth.bam_mat_khau(yeu_cau.mat_khau), don_ho_ten(yeu_cau.ho_ten)
    )
    if nguoi is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Tên đăng nhập này vừa có người khác lấy mất. Bạn thử tên khác nhé.",
        )

    auth.ghi_nhan_dang_ky(request)
    db.ghi_nhan_dang_nhap(ten)

    # Đăng ký xong vào thẳng, khỏi bắt gõ lại tên và mật khẩu vừa đặt. Vé phát
    # ở đây mang vai lấy TỪ DATABASE chứ không phải hằng số viết tay, để nếu
    # sau này them_thanh_vien đổi cách đặt vai thì hai nơi không lệch nhau.
    ve, het_han_sau = auth.tao_ve(nguoi["ten_dang_nhap"], nguoi["vai_tro"])
    return {
        "ve": ve,
        "het_han_sau": het_han_sau,
        "ten_dang_nhap": nguoi["ten_dang_nhap"],
        "vai_tro": nguoi["vai_tro"],
        "ho_ten": nguoi.get("ho_ten") or "",
    }


# ============================================================
# Hồ sơ của chính mình
# ============================================================
# Dùng yeu_cau_dang_nhap (nhận MỌI vai) chứ không chặn riêng vai thành viên:
# quản trị mở /tai-khoan cũng nên xem được hồ sơ của mình, không có lý do gì
# báo lỗi. Điều cần canh ở đây không phải "vai nào" mà là "ai" — và tên lấy
# thẳng từ vé, không nhận từ thân request, nên không ai đọc được hồ sơ người
# khác dù có sửa gì trong lời gọi.
@router.get("/api/toi", response_model=HoSo)
def ho_so_cua_toi(ten: str = Depends(auth.yeu_cau_dang_nhap)):
    _can_db()
    nguoi = db.lay_nguoi_dung(ten)
    if nguoi is None:
        raise _khong_con_tai_khoan()
    return _ra_ho_so(nguoi)


@router.put("/api/toi", response_model=HoSo)
def sua_ho_so(yeu_cau: YeuCauSuaHoSo, ten: str = Depends(auth.yeu_cau_dang_nhap)):
    _can_db()
    if not db.doi_ho_ten(ten, don_ho_ten(yeu_cau.ho_ten)):
        raise _khong_con_tai_khoan()
    return _ra_ho_so(db.lay_nguoi_dung(ten))


@router.put("/api/toi/mat-khau", status_code=204)
def doi_mat_khau(
    yeu_cau: YeuCauDoiMatKhau,
    request: Request,
    ten: str = Depends(auth.yeu_cau_dang_nhap),
):
    _can_db()
    # Vẫn đếm số lần sai như lúc đăng nhập. Không đếm thì một cái máy đã đăng
    # nhập sẵn (máy mượn, máy công ty, tab quên đóng) thành chỗ dò mật khẩu cũ
    # thoải mái, mà dò trúng là đổi được luôn mật khẩu và chiếm hẳn tài khoản.
    auth.kiem_tra_bi_khoa(request)

    nguoi = db.lay_nguoi_dung(ten)
    if nguoi is None:
        raise _khong_con_tai_khoan()

    if not auth.kiem_mat_khau(yeu_cau.mat_khau_cu, nguoi["mat_khau_hash"]):
        auth.ghi_nhan_sai(request)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu hiện tại không đúng.",
        )

    loi = kiem_mat_khau_moi(yeu_cau.mat_khau_moi, nguoi["ten_dang_nhap"].lower())
    if loi:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=loi)

    auth.xoa_dem_sai(request)
    db.doi_mat_khau(nguoi["ten_dang_nhap"], auth.bam_mat_khau(yeu_cau.mat_khau_moi))
    # ⚠️ Vé đã phát TRƯỚC lúc này vẫn còn hiệu lực tới 8 tiếng — đổi mật khẩu
    # KHÔNG đá được người khác ra khỏi máy họ đang dùng. Muốn làm được thì phải
    # lưu mốc "đổi mật khẩu lúc nào" rồi từ chối mọi vé phát trước mốc đó.
    # Chưa làm vì chưa cần, nhưng ai đọc tới đây thì biết là nó chưa có.
    return None
