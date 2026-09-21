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
import secrets
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
# VAI TRÒ
#
# quan_tri  — tài khoản của công ty, vào được /admin và làm được mọi thứ.
#             CHỈ CÓ MỘT, đặt bằng biến môi trường ADMIN_USER/ADMIN_PASSWORD.
#             Không có đường nào tự đăng ký ra vai này.
#
# thanh_vien — khách tự đăng ký ngoài website (21/09/2026). Chỉ đụng được vào
#             hồ sơ của chính mình và tư liệu do mình gửi. KHÔNG vào /admin.
#
# Vai 'khach_thu' (tài khoản dùng thử, mật khẩu hiện công khai ở màn hình đăng
# nhập) đã BỎ HẲN ngày 21/09/2026 theo yêu cầu. Mọi tài khoản mang vai đó bị
# xoá khi máy chủ khởi động (xem db.py).
#
# ⚠️ HAI VAI DÙNG CHUNG MỘT LÒ PHÁT VÉ. Vé của thành viên và vé của quản trị
# khác nhau ĐÚNG MỘT CHỮ trong phần "vai", còn chữ ký thì cùng một khóa. Nghĩa
# là chi_quan_tri() là thứ DUY NHẤT ngăn một thành viên gọi thẳng vào API quản
# trị bằng vé của chính mình — không có hàng rào thứ hai nào ở dưới. Thêm một
# đường dẫn quản trị mới mà quên gắn nó vào thì ai đăng ký cũng sửa được
# website, và sẽ không có lỗi nào báo cho bạn biết.
# ============================================================
VAI_QUAN_TRI = "quan_tri"
VAI_THANH_VIEN = "thanh_vien"

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
# SỐ VÒNG BCRYPT — con số này quyết định trang đăng nhập nhanh hay chậm.
#
# bcrypt CỐ Ý chạy chậm để kẻ trộm được database không thử được hàng triệu mật
# khẩu mỗi giây. Mỗi vòng cộng thêm gấp đôi công sức: 12 vòng nặng gấp 4 lần
# 10 vòng.
#
# ĐO THẬT 21/08/2026 trên bản đang chạy (Render gói free, CPU bị bóp):
#     POST /api/dang-nhap   1,88 giây
#     mọi đường dẫn khác    0,20 - 0,28 giây
# Tức là gần như TOÀN BỘ thời gian chờ sau khi bấm "Đăng nhập" là nằm ở đây.
# Người dùng phản ánh đúng chỗ này: "bấm Đăng nhập rồi ngồi chờ".
#
# Vì sao chọn 10 chứ không giữ 12:
#   · 12 vòng: ~0,21s ở máy để bàn, nhưng ~1,6s trên CPU yếu của gói free.
#   · 10 vòng: nhanh gấp 4 -> còn khoảng 0,4s. Đây vẫn là mức sàn được khuyến
#     nghị rộng rãi, không phải mức bừa.
#   · Lớp phòng thủ thật ở đây là KHOÁ IP sau 5 lần sai trong 15 phút
#     (kiem_tra_bi_khoa bên dưới). Kẻ dò qua mạng không được hưởng lợi gì từ
#     việc băm nhanh hơn — nó chỉ có ý nghĩa khi database bị đánh cắp.
#
# ĐỔI LẠI: nếu database rò rỉ, kẻ tấn công dò mật khẩu nhanh gấp 4. Muốn quay
# về mức cũ thì đổi số này thành 12, deploy lại là xong — mật khẩu tự được băm
# lại theo mức mới ở mỗi lần khởi động (xem db._dat_tai_khoan_admin).
SO_VONG_BCRYPT = 10


def bam_mat_khau(mat_khau: str) -> str:
    thoi = mat_khau.encode("utf-8")
    if len(thoi) > GIOI_HAN_BYTE_MAT_KHAU:
        raise ValueError(
            f"Mật khẩu quá dài (tối đa {GIOI_HAN_BYTE_MAT_KHAU} byte). "
            "Tiếng Việt có dấu tốn 2-3 byte mỗi ký tự."
        )
    return bcrypt.hashpw(thoi, bcrypt.gensalt(SO_VONG_BCRYPT)).decode("utf-8")


def kiem_mat_khau(mat_khau: str, chuoi_bam: str) -> bool:
    thoi = mat_khau.encode("utf-8")
    if len(thoi) > GIOI_HAN_BYTE_MAT_KHAU:
        return False
    try:
        return bcrypt.checkpw(thoi, chuoi_bam.encode("utf-8"))
    except (ValueError, TypeError):
        # Chuỗi băm trong database hỏng/sai định dạng -> coi như sai mật khẩu.
        return False


# Chuỗi băm GIẢ, dựng một lần lúc khởi động từ một mật khẩu ngẫu nhiên không ai
# biết. Chỉ dùng cho kiem_mat_khau_gia() ngay bên dưới — không tài khoản nào
# đăng nhập được bằng nó.
_BAM_GIA = bcrypt.hashpw(secrets.token_bytes(32), bcrypt.gensalt(SO_VONG_BCRYPT))


def kiem_mat_khau_gia(mat_khau: str) -> bool:
    """Luôn trả về False, nhưng TỐN ĐÚNG BẰNG một lần kiểm mật khẩu thật.

    ⚠️ ĐÂY LÀ MỘT BẢN VÁ BẢO MẬT, không phải mã thừa. Đừng "tối ưu" bằng cách
    thay bằng `return False`.

    Chuyện đã xảy ra: hàm dang_nhap trong api_auth.py viết

        hop_le = nguoi is not None and kiem_mat_khau(...)

    Python thấy vế trái sai là BỎ QUA luôn vế phải, nên tên đăng nhập không có
    thật thì không tốn một giây băm nào. Ghi chú ngay trên dòng đó lại tự nhận
    là "CỐ Ý kiểm mật khẩu cả khi không tìm thấy tài khoản" — mã làm ngược với
    lời nó tự viết, và không ai phát hiện vì cả hai trường hợp đều trả về cùng
    một câu lỗi.

    Đo được trên bản đang chạy 21/08/2026:
        tên đăng nhập KHÔNG có thật -> 0,28 giây
        tên đăng nhập CÓ thật       -> 1,88 giây
    Chênh gần 7 lần. Chỉ cần bấm giờ là biết tên nào có thật rồi dồn sức dò
    đúng tên đó — đúng thứ mà câu lệnh kia tưởng mình đang chặn.
    """
    bcrypt.checkpw(mat_khau.encode("utf-8")[:GIOI_HAN_BYTE_MAT_KHAU], _BAM_GIA)
    return False


# ============================================================
# Vé JWT
# ============================================================
def tao_ve(ten_dang_nhap: str, vai_tro: str) -> tuple[str, int]:
    """Trả về (vé, số giây còn hiệu lực).

    Vai trò nằm TRONG vé và vé có chữ ký, nên client không tự nâng quyền cho
    mình được: sửa một ký tự trong vé là chữ ký sai, máy chủ từ chối ngay.

    `vai_tro` CỐ Ý không có giá trị mặc định. Trước 21/09/2026 nó mặc định là
    quan_tri, hồi đó vô hại vì chỉ có một vai. Giờ đã có thành viên tự đăng ký,
    một chỗ gọi tao_ve(ten) mà quên vai sẽ lặng lẽ phát vé QUẢN TRỊ cho khách —
    không lỗi, không cảnh báo. Bắt buộc ghi rõ thì chỗ quên sẽ vỡ ngay lúc chạy.
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
    # Vé không mang khóa "vai" -> coi là THÀNH VIÊN, tức quyền thấp nhất.
    #
    # Trước 21/09/2026 chỗ này coi vé thiếu vai là QUẢN TRỊ, để người đang đăng
    # nhập dở không bị đá ra lúc deploy bản có hệ vai trò. Nay phải lật ngược:
    # đoán nhầm về phía quản trị thì một tấm vé dị dạng mở được cả trang quản
    # trị; đoán nhầm về phía thành viên thì cùng lắm admin phải đăng nhập lại.
    # Vé chỉ sống 8 tiếng nên chuyện "đăng nhập lại" cũng chỉ xảy ra một lần.
    return ten, noi_dung.get("vai") or VAI_THANH_VIEN


def yeu_cau_dang_nhap(
    thong_tin: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> str:
    """Dependency của FastAPI: gắn vào endpoint nào thì endpoint đó cần vé hợp lệ.

    Trả về tên đăng nhập để endpoint biết ai đang thao tác.

    ⚠️ Hàm này nhận MỌI vai trò, kể cả thành viên đăng ký ngoài website. Nó chỉ
    dành cho đường dẫn của chính thành viên (hồ sơ, tư liệu họ gửi). Đường dẫn
    quản trị phải dùng chi_quan_tri() — xem ghi chú ở đó. Tính tới 21/09/2026
    không đường dẫn quản trị nào còn dùng hàm này.
    """
    return _giai_ve(thong_tin)[0]


def nguoi_dang_nhap(
    thong_tin: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> tuple[str, str]:
    """Như yeu_cau_dang_nhap nhưng trả về CẢ (tên, vai trò).

    Dùng cho đường dẫn mà nhiều vai cùng vào được, nhưng BÊN TRONG có thao tác
    chỉ một vai mới được làm. Chặn kiểu đó phải nằm trong thân hàm, nên hàm cần
    biết vai trò của người gọi.
    """
    return _giai_ve(thong_tin)


def chi_quan_tri(ly_do: str = "Tài khoản này không được làm việc đó."):
    """Sinh ra một dependency CHỈ nhận tài khoản quản trị thật.

    Nhận `ly_do` để mỗi đường dẫn nói đúng chuyện của mình. Bản đầu dùng chung
    một câu cho mọi chỗ, nên bấm xoá ảnh lại nhận được câu nói về khách hàng —
    người đọc tưởng mình bấm nhầm nút.

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


# ============================================================
# Chặn đăng ký hàng loạt
# ============================================================
# Đăng ký là đường dẫn CÔNG KHAI, ai cũng gọi được, và mỗi lần gọi là một dòng
# mới trong database cộng một lần băm bcrypt. Không chặn thì một script có thể
# bơm hàng nghìn tài khoản rác trong vài phút — vừa phình database vừa làm
# ngập hàng đợi duyệt tư liệu.
#
# Đếm theo IP, lưu trong bộ nhớ (khởi động lại là mất), giống _dem_sai ở trên.
# Đây không phải hàng rào kín: ai đổi IP là đếm lại từ đầu. Nó chỉ để một người
# ngồi bấm hoặc một script viết vội không phá được — đúng mức cần cho một
# website công ty.
SO_LAN_DANG_KY_TOI_DA = 3
SO_GIAY_DEM_DANG_KY = 60 * 60

_dem_dang_ky: dict[str, list[float]] = {}


def kiem_tra_dang_ky_qua_nhieu(request: Request) -> None:
    ip = _ip_cua(request)
    bay_gio = time.time()
    # Bỏ các lần đã quá cũ trước khi đếm, nếu không thì một IP đăng ký 3 lần
    # hồi năm ngoái sẽ bị cấm vĩnh viễn.
    moc = [t for t in _dem_dang_ky.get(ip, []) if bay_gio - t < SO_GIAY_DEM_DANG_KY]
    _dem_dang_ky[ip] = moc
    if len(moc) >= SO_LAN_DANG_KY_TOI_DA:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Bạn vừa tạo khá nhiều tài khoản. Thử lại sau một giờ nhé.",
        )


def ghi_nhan_dang_ky(request: Request) -> None:
    _dem_dang_ky.setdefault(_ip_cua(request), []).append(time.time())
