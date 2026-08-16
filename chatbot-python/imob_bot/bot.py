"""ChatBot — ghép mọi thứ, xử lý MỘT lượt chat qua hàm tra_loi().

Thứ tự xử lý mỗi lượt (quan trọng — đúng thứ tự này mới an toàn):

  0. Đang thu thập lead?      -> đưa câu cho phiên lead xử lý tiếp.
  1. Prompt injection?        -> từ chối lịch sự, KHÔNG đổi vai.
  2. Câu hỏi về giá?          -> giải thích báo giá riêng (không đưa số) + mời để lại liên hệ.
  3. Khớp FAQ / smalltalk?    -> trả lời biên tập sẵn; nếu action=collect_lead thì mở phiên lead.
  4. Khớp kho kiến thức dài?  -> trả lời bằng đoạn kiến thức.
  5. Không khớp gì            -> câu fallback; trượt 2 lần liên tiếp thì mời gặp người thật.

Cuối cùng: rà lại câu trả lời, nếu lỡ chứa số tiền thì thay bằng câu chuẩn.
"""

from . import guardrails as gr
from .engine import TimKiem
from .knowledge import KienThuc
from .lead import ThuThapLead

# Ngưỡng cosine: khớp phải "giống" tối thiểu bao nhiêu mới nhận.
# Chỉnh 2 số này nếu bot nhận nhầm (tăng lên) hoặc hay bỏ sót (giảm xuống).
NGUONG_FAQ = 0.18
NGUONG_CHUNK = 0.12

DICH_VU_HOP_LE = {"digital_transformation", "zalo_miniapp", "software_hardware"}


class ChatBot:
    def __init__(self, kien_thuc: KienThuc, khi_co_lead=None):
        self.kt = kien_thuc
        # FAQ và smalltalk chung một bộ tìm kiếm (đều là câu hỏi -> trả lời)
        self.tim_faq = TimKiem(kien_thuc.faq_docs + kien_thuc.smalltalk_docs)
        self.tim_chunk = TimKiem(kien_thuc.chunk_docs)
        self.lead = None            # phiên ThuThapLead đang chạy (nếu có)
        self.so_lan_truot = 0       # đếm số lượt liên tiếp không trả lời được
        # khi_co_lead(da_thu, service_id) — gọi khi khách để lại đủ thông tin.
        # main.py truyền vào hàm ghi database. Để None thì thông tin chỉ được
        # đọc lại cho khách nghe rồi bỏ (đúng như hành vi cũ khi chạy dòng lệnh).
        self.khi_co_lead = khi_co_lead

    # ================= API chính =================
    def tra_loi(self, text: str) -> str:
        cau = self._tra_loi_tho(text)
        # Chốt chặn cuối: câu trả lời tuyệt đối không được chứa số tiền.
        if gr.chua_so_gia(cau):
            return self.kt.cau_tra_loi_gia_chuan()
        return cau

    # ================= luồng xử lý =================
    def _tra_loi_tho(self, text: str) -> str:
        if not text or not text.strip():
            return "Dạ anh/chị cần em hỗ trợ gì ạ?"

        # 0. Đang giữa chừng thu thập liên hệ
        if self.lead is not None:
            tin, xong = self.lead.nhan(text)
            if xong:
                self.lead = None
            return tin

        # 1. Chống prompt injection
        if gr.la_prompt_injection(text):
            self.so_lan_truot = 0
            return ("Dạ em xin giữ đúng vai trò trợ lý tư vấn của iMob nên không thể "
                    "bỏ qua hướng dẫn hay chia sẻ thông tin nội bộ ạ. Nếu anh/chị cần "
                    f"báo giá, em xin phép kết nối tới hotline {self.kt.hotline()} để đội "
                    "tư vấn hỗ trợ trực tiếp nhé!")

        doc, diem = self.tim_faq.tra(text)
        khop_faq = doc is not None and diem >= NGUONG_FAQ

        # 2. Câu hỏi về giá — không bao giờ đưa số
        if gr.la_cau_hoi_gia(text):
            # Nếu khớp đúng FAQ về giá thì dùng câu trả lời chi tiết của nó...
            if khop_faq and doc["intent"].startswith("pricing"):
                return self._xu_ly_doc(doc)
            # ...còn lại: câu báo giá chuẩn + mở phiên thu thập liên hệ.
            self.so_lan_truot = 0
            service = self._doan_dich_vu(doc if khop_faq else None)
            self.lead = ThuThapLead(
                self.kt, service_id=service, khi_xong=self.khi_co_lead
            )
            return self.kt.cau_tra_loi_gia_chuan()

        # 3. Khớp FAQ / smalltalk
        if khop_faq:
            return self._xu_ly_doc(doc)

        # 4. Khớp kho kiến thức dài
        doc_c, diem_c = self.tim_chunk.tra(text)
        if doc_c is not None and diem_c >= NGUONG_CHUNK:
            self.so_lan_truot = 0
            return doc_c["answer"]

        # 5. Không khớp gì
        self.so_lan_truot += 1
        if self.so_lan_truot >= 2:
            self.so_lan_truot = 0
            return self.kt.fallback("repeated_failure")
        return self.kt.fallback("low_confidence")

    # ================= phụ trợ =================
    def _xu_ly_doc(self, doc) -> str:
        """Trả câu trả lời của một tài liệu; mở phiên lead nếu cần."""
        self.so_lan_truot = 0
        if doc.get("action") == "collect_lead":
            self.lead = ThuThapLead(
                self.kt,
                service_id=self._doan_dich_vu(doc),
                khi_xong=self.khi_co_lead,
            )
        return doc["answer"]

    def _doan_dich_vu(self, doc):
        if doc and doc.get("service") in DICH_VU_HOP_LE:
            return doc["service"]
        return None
