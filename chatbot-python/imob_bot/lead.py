"""Thu thập thông tin liên hệ (lead) qua nhiều lượt chat.

Khi khách quan tâm/hỏi giá, bot mời để lại liên hệ rồi hỏi lần lượt:
họ tên -> số điện thoại -> email, cuối cùng đọc lại để xác nhận.

Chỉ hỏi những trường trong file JSON (lead_capture.required_fields).
Không bao giờ hỏi CCCD, số thẻ, mật khẩu, OTP (theo do_not_collect).
"""

import re

from .text_utils import bo_dau

# Khách muốn dừng giữa chừng
CUM_HUY = ["thoi", "huy", "bo qua", "de sau", "khong can", "khong muon", "stop"]

REGEX_EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class ThuThapLead:
    """Một phiên thu thập thông tin. Mỗi lượt chat gọi .nhan(text)."""

    def __init__(self, kien_thuc, service_id=None):
        self.kt = kien_thuc
        self.service_id = service_id
        self.truong = kien_thuc.data.get("lead_capture", {}).get("required_fields", [])
        self.buoc = 0
        self.da_thu = {}

    def nhan(self, text: str):
        """Nhận câu trả lời của khách cho bước hiện tại.

        Trả về (tin_nhan_bot, ket_thuc). ket_thuc=True nghĩa là phiên đã xong
        (hoàn tất hoặc bị hủy) -> bot xóa phiên này.
        """
        t = bo_dau(text.lower()).strip()
        if any(c in t for c in CUM_HUY):
            return (f"Dạ không sao ạ. Khi nào cần anh/chị cứ nhắn em, "
                    f"hoặc gọi hotline {self.kt.hotline()} nhé!", True)

        if not self.truong:                      # dữ liệu thiếu cấu hình lead
            return (f"Anh/chị gọi hotline {self.kt.hotline()} giúp em nhé!", True)

        truong = self.truong[self.buoc]
        gia_tri = text.strip()

        # Kiểm tra hợp lệ theo loại trường
        loi = self._kiem_tra(truong, gia_tri)
        if loi:
            return (loi, False)                  # hỏi lại, chưa sang bước sau

        self.da_thu[truong["key"]] = gia_tri
        self.buoc += 1

        if self.buoc < len(self.truong):
            return (self.truong[self.buoc].get("prompt", "Anh/chị cho em xin thông tin tiếp theo ạ?"), False)

        return (self._xac_nhan(), True)          # đã đủ -> đọc lại + kết thúc

    # ---------- phụ trợ ----------
    def _kiem_tra(self, truong, gia_tri):
        if not gia_tri:
            return truong.get("prompt", "Anh/chị nhập giúp em thông tin này ạ?")

        if truong.get("type") == "phone":
            so = re.sub(r"[\s.\-()]", "", gia_tri)         # bỏ khoảng trắng, dấu chấm...
            mau = truong.get("validate", r"^(0|\+84)[0-9]{9,10}$")
            if not re.match(mau, so):
                return "Dạ số điện thoại chưa đúng định dạng. Anh/chị nhập lại giúp em (VD: 0936982256) ạ?"

        if truong.get("type") == "email":
            if not REGEX_EMAIL.match(gia_tri):
                return "Dạ email chưa hợp lệ. Anh/chị nhập lại giúp em (VD: ten@congty.vn) ạ?"

        return None

    def _xac_nhan(self):
        mau = (self.kt.data.get("lead_capture", {}).get("confirmation_message")
               or "Dạ em đã ghi nhận thông tin của anh/chị: {ho_ten} – {so_dien_thoai} – {email}. "
                  "Bên em sẽ liên hệ lại sớm nhất ạ!")
        ten_dv = self.kt.ten_dich_vu(self.service_id) if self.service_id else "iMob"
        return (mau
                .replace("{ho_ten}", self.da_thu.get("ho_ten", ""))
                .replace("{so_dien_thoai}", self.da_thu.get("so_dien_thoai", ""))
                .replace("{email}", self.da_thu.get("email", ""))
                .replace("{service_name}", ten_dv))
