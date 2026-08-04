"""Nạp file JSON và biến nó thành các "tài liệu" (document) để tìm kiếm.

Mỗi tài liệu là một dict gọn gồm:
  id      — mã (F006, S001, C020...)
  loai    — 'faq' | 'smalltalk' | 'chunk'
  intent  — tên ý định (pricing_general, greeting...)
  service — mảng dịch vụ (digital_transformation / zalo_miniapp / ...)
  text    — CHUỖI DÙNG ĐỂ SO KHỚP (các cách hỏi mẫu, hoặc tiêu đề + nội dung)
  answer  — câu trả lời trả cho khách
  action  — 'collect_lead' | 'escalate' | None

Tách 3 nhóm:
  faq_docs / smalltalk_docs — câu hỏi -> câu trả lời được biên tập sẵn (ưu tiên)
  chunk_docs                — kho kiến thức dài (dùng khi FAQ không khớp)
"""

import json
from pathlib import Path


# id dịch vụ -> tên tiếng Việt (dùng khi xác nhận thông tin lead)
TEN_DICH_VU = {
    "digital_transformation": "Đào tạo chuyển đổi số",
    "zalo_miniapp": "Phát triển Zalo MiniApp",
    "software_hardware": "Giải pháp phần mềm & phần cứng",
}


class KienThuc:
    """Bọc toàn bộ dữ liệu JSON, kèm vài hàm lấy thông tin tiện dùng."""

    def __init__(self, data: dict):
        self.data = data
        self.faq_docs = self._dung_faq()
        self.smalltalk_docs = self._dung_smalltalk()
        self.chunk_docs = self._dung_chunk()

    # ---------- nạp từ file ----------
    @classmethod
    def tu_file(cls, duong_dan) -> "KienThuc":
        with open(duong_dan, encoding="utf-8") as f:
            return cls(json.load(f))

    # ---------- dựng danh sách tài liệu ----------
    def _dung_faq(self):
        docs = []
        for faq in self.data.get("faqs", []):
            docs.append({
                "id": faq.get("id", ""),
                "loai": "faq",
                "intent": faq.get("intent", ""),
                "service": faq.get("service", "general"),
                "text": " ".join(faq.get("questions", [])),
                "answer": faq.get("answer", ""),
                "action": faq.get("action"),
            })
        return docs

    def _dung_smalltalk(self):
        docs = []
        for st in self.data.get("smalltalk", []):
            docs.append({
                "id": st.get("id", ""),
                "loai": "smalltalk",
                "intent": st.get("intent", ""),
                "service": "general",
                "text": " ".join(st.get("questions", [])),
                "answer": st.get("answer", ""),
                "action": st.get("action"),
            })
        return docs

    def _dung_chunk(self):
        docs = []
        for c in self.data.get("rag_chunks", []):
            noi_dung = c.get("text", "")
            tim = " ".join([
                c.get("title", ""),
                " ".join(c.get("tags", [])),
                noi_dung,
            ])
            docs.append({
                "id": c.get("id", ""),
                "loai": "chunk",
                "intent": "",
                "service": c.get("service", "general"),
                "text": tim,
                "answer": noi_dung,
                "action": None,
            })
        return docs

    # ---------- lấy nhanh vài thông tin hay dùng ----------
    def fallback(self, khoa: str) -> str:
        mac_dinh = "Dạ em xin phép chuyển anh/chị tới hotline 0936 982 256 để được hỗ trợ chính xác nhất ạ."
        return self.data.get("fallback", {}).get(khoa, mac_dinh)

    def cau_tra_loi_gia_chuan(self) -> str:
        return (self.data.get("pricing_policy", {})
                    .get("bot_rules", {})
                    .get("standard_answer", self.fallback("no_data")))

    def hotline(self) -> str:
        lh = self.data.get("company", {}).get("contacts", {})
        return lh.get("hotline_local_format") or lh.get("hotline", "0936 982 256")

    @staticmethod
    def ten_dich_vu(service_id: str) -> str:
        return TEN_DICH_VU.get(service_id, "iMob")
