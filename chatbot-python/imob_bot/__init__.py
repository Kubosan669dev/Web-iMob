"""iMob chatbot — gói lõi.

Chatbot tư vấn của iMob, chạy hoàn toàn trong máy (offline), khớp câu hỏi
bằng TF-IDF (scikit-learn). Dữ liệu nằm trong file JSON, code không nhúng cứng
nội dung — đổi dữ liệu chỉ cần sửa file JSON rồi chạy lại.

Các phần:
  text_utils  — chuẩn hóa tiếng Việt (bỏ dấu, viết thường)
  guardrails  — chặn đưa số giá, chống prompt injection
  knowledge   — nạp JSON thành danh sách "tài liệu" để tìm kiếm
  engine      — TF-IDF + độ tương đồng cosine
  lead        — thu thập họ tên / SĐT / email
  bot         — ghép mọi thứ, xử lý một lượt chat
"""

from .knowledge import KienThuc
from .bot import ChatBot

__all__ = ["KienThuc", "ChatBot"]
