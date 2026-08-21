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
# Đòi phải có đơn vị tiền (trieu/ty/nghin/vnd/usd/k/$) nên '2 nam', '99,9%',
# '24/7' hay số điện thoại KHÔNG bị chặn nhầm.
#
# ⚠️ SỬA 21/08/2026 — NHÁNH "k" TRƯỚC ĐÂY BẮT OAN GẦN HẾT THÔNG SỐ KỸ THUẬT.
#
# Bản cũ viết `\d+([.,]\d+)?\s*[k\$]`, tức là "một con số rồi tới chữ k" là chặn,
# KHÔNG kiểm sau chữ k là gì. Hậu quả:
#       "30 km một lần sạc"  ->  đọc thành "30 nghìn"
#       "nặng 19 kg"         ->  đọc thành "19 nghìn"
# Mà chốt chặn này nằm ở tra_loi(): hễ thấy giống số tiền là VỨT nguyên câu trả
# lời, thay bằng câu báo giá chuẩn. Nên mọi câu hỏi về robot đều nhận được câu
# "chi phí phụ thuộc phạm vi..." — trả lời hoàn toàn lạc đề mà không có lỗi nào
# hiện ra. Lỗi này có sẵn từ trước, chỉ chưa lộ vì kho kiến thức chưa có thông
# số kỹ thuật nào dùng đơn vị bắt đầu bằng chữ k.
#
# Bản mới đòi HAI điều kiện cho nhánh "k":
#   · sau chữ k không được có chữ cái hay chữ số — loại km, kg, kW, kHz, kbps
#   · phải có ÍT NHẤT HAI chữ số đứng trước — loại "4K", "8K" (độ phân giải
#     camera), vốn luôn là một chữ số. Tiền viết tắt kiểu này trong thực tế
#     luôn từ hai chữ số trở lên: 50k, 200k, 1.500k.
#
# Nới ra một chút thì có lọt được gì không: chỉ lọt đúng dạng "5k" trở xuống,
# tức dưới mười nghìn đồng — không có dịch vụ nào của công ty ở mức đó, và các
# cách viết giá thật (triệu, tỷ, VNĐ, USD, $) vẫn bị chặn nguyên như cũ.
REGEX_SO_GIA = re.compile(
    r"\d+([.,]\d+)?\s*(trieu|ty|nghin|ngan|vnd|usd)\b"
    r"|\d{2,}([.,]\d+)?\s*k(?![a-z0-9])"
    r"|\d+([.,]\d+)?\s*\$"
    r"|\$\s*\d",
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
