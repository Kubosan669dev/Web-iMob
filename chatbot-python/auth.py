"""Đăng nhập trang quản trị: băm mật khẩu (bcrypt) + vé ra vào (JWT).

Hai khái niệm cho người mới:

BĂM MẬT KHẨU (hash) — một chiều. Từ mật khẩu tính ra chuỗi băm thì dễ, nhưng từ
chuỗi băm suy ngược lại mật khẩu thì gần như không thể. Nên database KHÔNG BAO
GIỜ chứa mật khẩu thật; kẻ lấy được database cũng không đăng nhập được. Lúc bạn
đăng nhập, server băm lại cái bạn gõ rồi so hai chuỗi băm với nhau.

JWT — tấm vé có chữ ký. Đăng nhập đúng thì server phát một tấm vé ghi "người này
tên X, hết hạn lúc Y" kèm chữ ký bằng JWT_SECRET. Các lần gọi sau chỉ cần đưa vé,
khỏi gửi lại mật khẩu. Sửa vé thì chữ ký sai ngay. Ai biết JWT_SECRET là tự làm
được vé giả — nên nó phải bí mật tuyệt đối và KHÔNG được commit lên Git.
"""

import cau_hinh  # noqa: F401  — phải nạp .env TRƯỚC khi đọc os.getenv bên dưới

import os
import time
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

JWT_SECRET = os.getenv("JWT_SECRET", "")
JWT_ALG = "HS256"
SO_GIO_HAN_VE = 8

# ============================================================
# HAI VAI TRÒ
#
# quan_tri   — tài khoản thật của công ty. Làm được mọi thứ.
# khach_thu  — tài khoản dùng thử, mật khẩu HIỆN CÔNG KHAI ở màn hình đăng nhập
#              để người kiểm thử tự vào. Sửa được nội dung website, nhưng KHÔNG
#              đọc được mục Liên hệ.
#
# Vì sao phải chặn mục Liên hệ: bảng lien_he chứa họ tên, số điện thoại, email
# và lời nhắn của khách thật — dữ liệu cá nhân theo Nghị định 13/2023. Mật khẩu
# đã công khai thì phải coi như cả internet đang cầm tài khoản đó.
#
# Chặn ở ĐÂY, tại máy chủ. Ẩn cái tab đi ở giao diện là vô nghĩa: mở F12 gõ một
# dòng fetch là đọc được sạch.
# ============================================================
VAI_QUAN_TRI = "quan_tri"
VAI_KHACH_THU = "khach_thu"

# bcrypt chỉ xử lý tối đa 72 byte; dài hơn là phần thừa bị bỏ lặng lẽ.
GIOI_HAN_BYTE_MAT_KHAU = 72


def kiem_tra_cau_hinh() -> str | None:
    """Kiểm tra JWT_SECRET. Trả về câu mô tả lỗi, hoặc None nếu ổn.

    CỐ Ý không đặt giá trị mặc định cho JWT_SECRET: một khóa mặc định nằm trong
    mã nguồn công khai thì ai cũng tự ký được vé admin cho mình.

    CỐ Ý KHÔNG ném lỗi làm sập ứng dụng. Bản đầu có ném, và đó là sai: một biến
    môi trường điền thiếu sẽ giết luôn cả API chatbot (Render trả 502 cho mọi
    thứ) chỉ vì phần quản trị cấu hình hỏng. Giờ trả lỗi về cho nơi gọi để nó
    TẮT RIÊNG phần CMS, còn chatbot vẫn phục vụ khách bình thường — đúng nguyên
    tắc đã dùng cho database ở db.py.
    """
    if not JWT_SECRET:
        return (
            "Thiếu biến môi trường JWT_SECRET. Sinh một chuỗi ngẫu nhiên dài "
            '(vd: python -c "import secrets; print(secrets.token_urlsafe(48))") '
            "rồi đặt vào JWT_SECRET."
        )
    if len(JWT_SECRET) < 32:
        return f"JWT_SECRET quá ngắn ({len(JWT_SECRET)} ký tự) — cần ít nhất 32."
    return None


# ============================================================
# Mật khẩu
# ============================================================
def bam_mat_khau(mat_khau: str) -> str:
    thoi = mat_khau.encode("utf-8")
    if len(thoi) > GIOI_HAN_BYTE_MAT_KHAU:
        raise ValueError(
            f"Mật khẩu quá dài (tối đa {GIOI_HAN_BYTE_MAT_KHAU} byte). "
            "Tiếng Việt có dấu tốn 2-3 byte mỗi ký tự."
        )
    return bcrypt.hashpw(thoi, bcrypt.gensalt()).decode("utf-8")


def kiem_mat_khau(mat_khau: str, chuoi_bam: str) -> bool:
    thoi = mat_khau.encode("utf-8")
    if len(thoi) > GIOI_HAN_BYTE_MAT_KHAU:
        return False
    try:
        return bcrypt.checkpw(thoi, chuoi_bam.encode("utf-8"))
    except (ValueError, TypeError):
        # Chuỗi băm trong database hỏng/sai định dạng -> coi như sai mật khẩu.
        return False


# ============================================================
# Vé JWT
# ============================================================
def tao_ve(ten_dang_nhap: str, vai_tro: str = VAI_QUAN_TRI) -> tuple[str, int]:
    """Trả về (vé, số giây còn hiệu lực).

    Vai trò nằm TRONG vé và vé có chữ ký, nên client không tự nâng quyền cho
    mình được: sửa một ký tự trong vé là chữ ký sai, máy chủ từ chối ngay.
    """
    het_han = datetime.now(timezone.utc) + timedelta(hours=SO_GIO_HAN_VE)
    ve = jwt.encode(
        {"sub": ten_dang_nhap, "vai": vai_tro, "exp": het_han},
        JWT_SECRET,
        algorithm=JWT_ALG,
    )
    return ve, SO_GIO_HAN_VE * 3600


_bearer = HTTPBearer(auto_error=False)


def _giai_ve(thong_tin: HTTPAuthorizationCredentials | None) -> tuple[str, str]:
    """Mở vé, trả về (tên đăng nhập, vai trò). Vé hỏng thì ném 401."""
    loi = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Bạn cần đăng nhập lại.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if thong_tin is None:
        raise loi
    try:
        noi_dung = jwt.decode(thong_tin.credentials, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.PyJWTError:
        # Gộp chung mọi lỗi (hết hạn, chữ ký sai, vé rác) vào một câu trả lời —
        # không tiết lộ cho kẻ dò biết vé sai ở điểm nào.
        raise loi
    ten = noi_dung.get("sub")
    if not ten:
        raise loi
    # Vé phát TRƯỚC khi có hệ vai trò thì không mang khóa "vai". Coi là quản trị
    # để người đang đăng nhập dở không bị đá ra giữa chừng lúc deploy bản mới.
    # Vé chỉ sống 8 tiếng nên diện này tự hết sau một ngày làm việc.
    return ten, noi_dung.get("vai") or VAI_QUAN_TRI


def yeu_cau_dang_nhap(
    thong_tin: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> str:
    """Dependency của FastAPI: gắn vào endpoint nào thì endpoint đó cần vé hợp lệ.

    Trả về tên đăng nhập để endpoint biết ai đang sửa (ghi vào cột nguoi_sua).
    Nhận CẢ HAI vai trò — dùng cho những việc tài khoản thử cũng được làm.
    """
    return _giai_ve(thong_tin)[0]


def chi_quan_tri(ly_do: str = "Tài khoản dùng thử không được làm việc này."):
    """Sinh ra một dependency CHỈ nhận tài khoản quản trị thật.

    Nhận `ly_do` để mỗi đường dẫn nói đúng chuyện của mình. Bản đầu dùng chung
    một câu "không xem được thông tin khách hàng" cho mọi chỗ, nên lúc tài khoản
    thử bấm xóa ảnh lại nhận được câu nói về khách hàng — người đọc tưởng mình
    bấm nhầm nút.

    Trả 403 chứ KHÔNG phải 401: 401 nghĩa là "chưa/hết đăng nhập" và trang admin
    sẽ đá người ta về màn hình đăng nhập, trong khi họ vẫn đang đăng nhập bình
    thường, chỉ là không đủ quyền cho đúng việc này.
    """

    def kiem(
        thong_tin: HTTPAuthorizationCredentials | None = Depends(_bearer),
    ) -> str:
        ten, vai = _giai_ve(thong_tin)
        if vai != VAI_QUAN_TRI:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail=ly_do
            )
        return ten

    return kiem


# Dùng cho nơi không cần câu riêng.
yeu_cau_quan_tri = chi_quan_tri()


# ============================================================
# Chặn dò mật khẩu (brute force)
# ============================================================
# Đếm số lần sai theo IP. Lưu trong bộ nhớ nên khởi động lại là mất — chấp nhận
# được với một trang admin nhỏ. Muốn chắc hơn thì chuyển sang lưu trong database.
SO_LAN_SAI_TOI_DA = 5
SO_GIAY_KHOA = 15 * 60

_dem_sai: dict[str, tuple[int, float]] = {}


def _ip_cua(request: Request) -> str:
    # Render đứng sau proxy nên IP thật nằm ở X-Forwarded-For (phần tử đầu).
    chuyen_tiep = request.headers.get("x-forwarded-for", "")
    if chuyen_tiep:
        return chuyen_tiep.split(",")[0].strip()
    return request.client.host if request.client else "khong-ro"


def kiem_tra_bi_khoa(request: Request) -> None:
    ip = _ip_cua(request)
    so_lan, moc_khoa = _dem_sai.get(ip, (0, 0.0))
    if so_lan >= SO_LAN_SAI_TOI_DA and time.time() < moc_khoa:
        con_lai = int(moc_khoa - time.time())
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Sai quá nhiều lần. Thử lại sau {con_lai // 60 + 1} phút.",
        )


def ghi_nhan_sai(request: Request) -> None:
    ip = _ip_cua(request)
    so_lan, _ = _dem_sai.get(ip, (0, 0.0))
    so_lan += 1
    _dem_sai[ip] = (so_lan, time.time() + SO_GIAY_KHOA)


def xoa_dem_sai(request: Request) -> None:
    _dem_sai.pop(_ip_cua(request), None)
