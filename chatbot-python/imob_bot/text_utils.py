"""Chuẩn hóa tiếng Việt cho việc so khớp câu hỏi.

Khách Việt hay gõ KHÔNG DẤU ("lam mini app gia bao nhieu"). Nếu so khớp
theo đúng chữ có dấu thì sẽ trượt. Cách xử lý: bỏ dấu cả câu hỏi của khách
LẪN dữ liệu trước khi so — hai bên cùng "không dấu" nên khớp được.
"""

import re
import unicodedata


def bo_dau(text: str) -> str:
    """Bỏ dấu tiếng Việt: 'Đào tạo chuyển đổi số' -> 'Dao tao chuyen doi so'.

    Cách làm: tách mỗi chữ thành (chữ gốc + dấu) bằng NFD rồi xóa phần dấu.
    Riêng 'đ/Đ' không phải là dấu rời nên phải thay tay.
    """
    text = text.replace("đ", "d").replace("Đ", "D")
    tach = unicodedata.normalize("NFD", text)
    khong_dau = "".join(ky_tu for ky_tu in tach
                        if unicodedata.category(ky_tu) != "Mn")
    return unicodedata.normalize("NFC", khong_dau)


def chuan_hoa(text: str) -> str:
    """Đưa câu về dạng chuẩn để TF-IDF xử lý: thường, bỏ dấu, bỏ ký tự lạ.

    'Làm Zalo MiniApp giá bao nhiêu?' -> 'lam zalo miniapp gia bao nhieu'
    """
    text = bo_dau(text.lower())
    text = re.sub(r"[^\w\s]", " ", text)   # thay dấu câu bằng khoảng trắng
    text = re.sub(r"\s+", " ", text)       # gộp nhiều khoảng trắng thành một
    return text.strip()
