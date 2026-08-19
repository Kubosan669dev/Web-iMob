"""ChatBot — ghép mọi thứ, xử lý MỘT lượt chat qua hàm tra_loi().

Thứ tự xử lý mỗi lượt (quan trọng — đúng thứ tự này mới an toàn):

  0. Đang thu thập lead?      -> đưa câu cho phiên lead xử lý tiếp.
  1. Prompt injection?        -> từ chối lịch sự, KHÔNG đổi vai.
  2. Câu hỏi về giá?          -> giải thích báo giá riêng (không đưa số) + mời để lại liên hệ.
  3. Khớp FAQ / smalltalk?    -> trả lời biên tập sẵn; nếu action=collect_lead thì mở phiên lead.
  4. Khớp kho kiến thức dài?  -> trả lời bằng đoạn kiến thức.
  5. Vẫn không khớp?          -> nhờ Gemini, kèm vài đoạn kiến thức gần nhất làm căn cứ
                                 (chỉ chạy khi đã đặt GEMINI_API_KEY — xem gemini.py).
  6. Không có Gemini nữa      -> câu fallback; trượt 2 lần liên tiếp thì mời gặp người thật.

Cuối cùng: rà lại câu trả lời, nếu lỡ chứa số tiền thì thay bằng câu chuẩn.
"""

from . import gemini
from . import guardrails as gr
from .engine import TimKiem
from .knowledge import KienThuc
from .lead import ThuThapLead

# Ngưỡng cosine: khớp phải "giống" tối thiểu bao nhiêu mới nhận.
#
# CÓ HAI BỘ, chọn theo việc có Gemini đỡ phía sau hay không — vì câu hỏi
# "nhận hay bỏ" phụ thuộc vào thứ đang chờ ở phía sau:
#
#   • KHÔNG có Gemini: phía sau chỉ là câu "em chưa hiểu". Lúc đó một câu trả
#     lời hơi lệch vẫn hơn là không có gì, nên để ngưỡng thấp. Đây là bộ số
#     dùng suốt từ đầu dự án.
#
#   • CÓ Gemini: phía sau là một câu trả lời có căn cứ (Gemini được đưa kèm
#     đúng mấy đoạn kiến thức gần nhất). Lúc đó nhận bừa lại thành có hại.
#
# Số đo thật ngày 19/08/2026 cho thấy ngưỡng cũ dễ dãi tới mức nào — điểm FAQ:
#     cảm ơn bạn                      0,822   đúng
#     đào tạo chuyển đổi số gồm gì    0,620   đúng
#     xin chào                        0,469   đúng
#     bảo hành bao lâu                0,426   đúng
#     địa chỉ công ty ở đâu           0,391   đúng
#     ------------------------------- 0,35 <- ngưỡng mới
#     app có chạy trên iOS không      0,328   LẠC ĐỀ
#     ai là giám đốc công ty          0,305   LẠC ĐỀ
#     số tài khoản ngân hàng          0,287   LẠC ĐỀ
#     bên bạn làm app giao đồ ăn      0,248   LẠC ĐỀ
#     cho tôi công thức nấu phở       0,226   LẠC ĐỀ
#     hôm nay trời mưa không          0,220   LẠC ĐỀ
#     ------------------------------- 0,18 <- ngưỡng cũ
# Tức là "cho tôi công thức nấu phở" vẫn được bot nhận và trả lời.
#
# Nhớ thêm: ở web thật, tầng này CHỈ nhận những câu mà kho kiến thức trong
# trình duyệt đã bó tay (xem src/services/chatService.js). Câu dễ không bao
# giờ tới đây, nên khắt khe ở đây không làm mất câu trả lời tốt nào.
NGUONG_FAQ = 0.18
NGUONG_CHUNK = 0.12
NGUONG_FAQ_CO_AI = 0.35
NGUONG_CHUNK_CO_AI = 0.20

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

        co_ai = gemini.dang_bat()
        nguong_faq = NGUONG_FAQ_CO_AI if co_ai else NGUONG_FAQ
        nguong_chunk = NGUONG_CHUNK_CO_AI if co_ai else NGUONG_CHUNK

        doc, diem = self.tim_faq.tra(text)
        khop_faq = doc is not None and diem >= nguong_faq

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
        if doc_c is not None and diem_c >= nguong_chunk:
            self.so_lan_truot = 0
            return doc_c["answer"]

        # 5. Kho kiến thức trong máy chịu thua -> nhờ Gemini (nếu đã đặt khoá)
        #
        # Đặt ở ĐÂY chứ không phải đầu luồng là có chủ ý: mọi câu mà bot trong
        # máy trả lời được thì vẫn do bot trong máy trả lời — nhanh hơn, miễn
        # phí, và quan trọng nhất là câu chữ đã được người duyệt. Gemini chỉ
        # nhận phần đuôi mà trước đây khách chỉ nhận được câu "em chưa hiểu".
        #
        # Các bước 1–4 ở trên đã lọc trước những thứ tuyệt đối không giao cho
        # AI: prompt injection và câu hỏi giá. Câu Gemini trả về vẫn còn phải
        # qua guardrails.chua_so_gia() ở tra_loi().
        cau_ai = gemini.hoi(text, self.kt, self._boi_canh(text))
        if cau_ai:
            self.so_lan_truot = 0
            return cau_ai

        # 6. Không khớp gì và cũng không có Gemini
        self.so_lan_truot += 1
        if self.so_lan_truot >= 2:
            self.so_lan_truot = 0
            return self.kt.fallback("repeated_failure")
        return self.kt.fallback("low_confidence")

    def _boi_canh(self, text: str):
        """Vài đoạn kiến thức gần chủ đề nhất, làm căn cứ cho Gemini.

        Gộp cả FAQ lẫn đoạn kiến thức dài vì hai bộ này chứa những thứ khác
        nhau: FAQ là câu hỏi thường gặp đã biên tập, chunk là nội dung lấy từ
        các trang dịch vụ.
        """
        cap = self.tim_chunk.tra_nhieu(text, gemini.SO_DOAN_BOI_CANH)
        cap += self.tim_faq.tra_nhieu(text, 2)
        cap.sort(key=lambda x: x[1], reverse=True)

        ra, da_co = [], set()
        for doc, _ in cap[: gemini.SO_DOAN_BOI_CANH]:
            noi_dung = (doc.get("answer") or "").strip()
            if noi_dung and noi_dung not in da_co:
                da_co.add(noi_dung)
                ra.append(noi_dung)
        return ra

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
