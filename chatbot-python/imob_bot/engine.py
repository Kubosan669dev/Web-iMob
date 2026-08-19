"""Bộ tìm kiếm TF-IDF.

Ý tưởng TF-IDF (giải thích ngắn cho người mới):
  - Mỗi tài liệu (các cách hỏi mẫu của một FAQ) được biến thành một VECTƠ SỐ,
    trong đó từ càng đặc trưng cho tài liệu đó thì trọng số càng cao.
  - Câu hỏi của khách cũng biến thành một vectơ theo cùng cách.
  - Đo "độ giống nhau" giữa 2 vectơ bằng COSINE (0 = không giống, 1 = trùng khớp).
  - Tài liệu có cosine cao nhất chính là câu trả lời phù hợp nhất.

Nhờ đã bỏ dấu ở text_utils, bot khớp được cả khi khách gõ không dấu.
"""

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from .text_utils import chuan_hoa

# Từ DỪNG (đã bỏ dấu): các từ chức năng / nghi vấn không mang chủ đề. Bỏ chúng
# đi trước khi tính TF-IDF để từ khóa NỘI DUNG ("bao hanh", "dao tao"...) không
# bị "co / khong / the / nao" lấn át khi khách hỏi câu NGẮN.
#   Trước: "Có bảo hành không?" -> "co bao hanh khong" khớp nhầm sang đào tạo.
#   Sau:   còn "bao hanh" -> khớp đúng chính sách bảo hành.
# CỐ Ý GIỮ LẠI các từ có nghĩa trong ngành: "bao","nhieu" (hỏi giá),
# "may" (câu "người hay máy"), "gia","nam" (bảo hành mấy năm). Từ 1 ký tự không
# cần liệt kê vì bộ tách từ mặc định đã bỏ (chỉ nhận token >= 2 ký tự).
TU_DUNG = [
    "co", "khong", "la", "va", "cua", "cho", "voi", "duoc", "thi", "nhe",
    "minh", "toi", "ban", "cac", "nhung", "mot", "nay", "do", "roi", "vay",
    "ma", "de", "den", "ra", "vao", "khi", "se", "da", "dang", "cung",
    "rat", "chi", "nao", "the", "sao", "gi", "muon", "can", "xin", "giup",
]


class TimKiem:
    """Đánh chỉ mục một danh sách tài liệu rồi cho phép tra câu gần nhất."""

    def __init__(self, docs):
        self.docs = docs
        # ngram_range=(1,2): xét cả từ đơn lẫn cụm 2 từ ("bao nhieu tien")
        # -> cụm dài, cụ thể sẽ ăn điểm hơn từ đơn chung chung.
        # stop_words=TU_DUNG: loại từ chức năng để câu ngắn khớp đúng chủ đề.
        # sublinear_tf: một từ lặp nhiều lần không làm điểm phồng quá mức.
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2), stop_words=TU_DUNG, sublinear_tf=True
        )
        corpus = [chuan_hoa(d["text"]) for d in docs]
        # Nếu không có tài liệu nào thì để rỗng, tra luôn trả None.
        self.matrix = self.vectorizer.fit_transform(corpus) if corpus else None

    def tra(self, cau_hoi: str):
        """Trả về (tài_liệu_khớp_nhất, điểm_cosine). Không khớp -> (None, 0.0)."""
        if self.matrix is None:
            return None, 0.0
        q = chuan_hoa(cau_hoi)
        if not q:
            return None, 0.0
        vec = self.vectorizer.transform([q])
        diem = cosine_similarity(vec, self.matrix)[0]
        i = int(diem.argmax())
        return self.docs[i], float(diem[i])

    def tra_nhieu(self, cau_hoi: str, k: int = 4):
        """Trả về k tài liệu gần nhất, sắp từ giống nhất xuống.

        Khác `tra()` ở chỗ KHÔNG lọc theo ngưỡng: dùng để gom bối cảnh gửi cho
        Gemini ở những câu mà bot trong máy đã chịu thua. Điểm thấp không có
        nghĩa là vô dụng — nó vẫn là phần kho kiến thức gần chủ đề nhất, và đưa
        cho model đọc vẫn tốt hơn nhiều so với để model tự nghĩ ra.
        """
        if self.matrix is None:
            return []
        q = chuan_hoa(cau_hoi)
        if not q:
            return []
        vec = self.vectorizer.transform([q])
        diem = cosine_similarity(vec, self.matrix)[0]
        # argsort tăng dần -> lấy k phần tử cuối rồi đảo lại cho giảm dần
        thu_tu = diem.argsort()[-k:][::-1]
        return [(self.docs[int(i)], float(diem[int(i)])) for i in thu_tu if diem[int(i)] > 0]
