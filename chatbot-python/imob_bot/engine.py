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


class TimKiem:
    """Đánh chỉ mục một danh sách tài liệu rồi cho phép tra câu gần nhất."""

    def __init__(self, docs):
        self.docs = docs
        # ngram_range=(1,2): xét cả từ đơn lẫn cụm 2 từ ("bao nhieu tien")
        # -> cụm dài, cụ thể sẽ ăn điểm hơn từ đơn chung chung.
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2))
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
