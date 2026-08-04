"""Guardrails — các "lằn ranh" bắt buộc của chatbot.

Ba việc chính:
  1. Phát hiện khách cố chèn lệnh đổi vai / đòi lộ hướng dẫn (prompt injection).
  2. Phát hiện câu hỏi về GIÁ để bot trả lời theo mô hình "báo giá riêng"
     thay vì đưa con số.
  3. Rà câu trả lời cuối, chặn nếu lỡ chứa con số giá tiền.

Tất cả so khớp trên bản KHÔNG DẤU để bắt được cả khi khách gõ không dấu.
"""

import re

from .text_utils import bo_dau

# --- 1. Prompt injection: khách dán lệnh hòng đổi vai hoặc moi hướng dẫn ---
CUM_TAN_CONG = [
    "bo qua moi", "bo qua chi dan", "bo qua huong dan", "quen het",
    "quen di huong dan", "quen moi thu", "system prompt", "he thong prompt",
    "prompt he thong", "dong vai", "gia vo la", "gia dinh la", "ban khong con la",
    "ignore previous", "ignore all", "bang gia noi bo", "gia noi bo",
    "lo prompt", "tiet lo huong dan", "chi dan cua ban la gi",
]

# --- 2. Cụm cho thấy khách đang hỏi GIÁ (chọn cụm rõ ràng để tránh nhầm) ---
# Cố ý KHÔNG dùng riêng chữ "gia" vì "danh gia", "gia tri", "giam gia" sẽ dính oan.
CUM_HOI_GIA = [
    "bao nhieu tien", "het bao nhieu", "gia bao nhieu", "bao gia",
    "bang gia", "chi phi", "hoc phi", "ngan sach", "ton bao nhieu",
    "don gia", "doan dai gia", "budget", "quote", "bao nhieu chi phi",
]

# --- 3. Chặn số tiền trong câu trả lời (số + đơn vị tiền tệ) ---
# Đòi phải có đơn vị tiền (trieu/ty/nghin/k/d/vnd/usd/$) nên '2 nam', '99,9%',
# '24/7' hay số điện thoại KHÔNG bị chặn nhầm.
REGEX_SO_GIA = re.compile(
    r"\d+([.,]\d+)?\s*(trieu|ty|nghin|ngan|vnd|usd)\b|\d+([.,]\d+)?\s*[k\$]|\$\s*\d",
    re.IGNORECASE,
)


def la_prompt_injection(text: str) -> bool:
    t = bo_dau(text.lower())
    return any(cum in t for cum in CUM_TAN_CONG)


def la_cau_hoi_gia(text: str) -> bool:
    t = bo_dau(text.lower())
    return any(cum in t for cum in CUM_HOI_GIA)


def chua_so_gia(text: str) -> bool:
    return bool(REGEX_SO_GIA.search(bo_dau(text.lower())))
