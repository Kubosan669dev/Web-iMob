# ============================================================
# BÀI 3 — MINI-PROJECT: "CHATBOT NGỐC" PHIÊN BẢN CONSOLE 🤖
# Chạy:  python hoc-python/tuan-01/bai-03-du-an.py
#
# Đây là bài TỔNG HỢP tuần 1 — không có khung sẵn, bạn tự xây từ đầu
# bằng kiến thức bài 1 + 2 + file ví dụ bài 3.
# Xong nhắn "xong bài 3" — tôi sẽ CHẤM KHÓ hơn 2 bài trước đấy 😄
# ============================================================
#
# YÊU CẦU (làm đúng thứ tự, xong mục nào chạy thử mục đó):
#
# 1. KHỞI ĐỘNG
#    - Tạo biến ten_bot (tự đặt tên bot của bạn)
#    - In lời chào giới thiệu bot + gợi ý khách có thể hỏi gì
#      (dùng f-string, ít nhất 2 dòng print cho đẹp)
#
# 2. VÒNG CHAT
#    - while True + input("Bạn: ")
#
# 3. ⭐ XỬ LÝ CHỮ HOA/THƯỜNG — món nợ câu 2 bài 2:
#    - Hạ tin nhắn về chữ thường NGAY sau khi nhận (trong code, không sửa dữ liệu!)
#    - BÀI KIỂM TRA BẮT BUỘC trước khi nộp: gõ "BÁO GIÁ" (toàn chữ hoa)
#      → bot vẫn phải nhận ra. Gõ "Tạm Biệt" → bot vẫn phải chào về.
#
# 4. BỘ NÃO — tối thiểu 4 nhánh + 1 fallback:
#    - hỏi giá  ("giá", "bao nhiêu")        → trả lời báo giá
#    - chào hỏi ("chào", "hello", "hi")     → chào lại
#    - liên hệ  ("liên hệ", "sđt", "gọi")   → cho số điện thoại
#    - dịch vụ  ("dịch vụ", "làm gì")       → kể tên 3 dịch vụ
#    - không hiểu                            → câu fallback lịch sự
#    (nội dung câu trả lời tự sáng tác — lần này khuyến khích sáng tạo!)
#
# 5. TẠM BIỆT
#    - gặp "bye" hoặc "tạm biệt" → chào tạm biệt + break
#      ⚠️ để nhánh này KIỂM TRA ĐẦU TIÊN trong chuỗi if/elif — thử nghĩ xem vì sao?
#
# 6. BONUS (không bắt buộc — làm được là vượt chuẩn):
#    - Đếm số câu bot đã trả lời (biến đếm += 1 trong vòng lặp)
#    - Khi tạm biệt in:  Hôm nay tôi đã trả lời X câu. Hẹn gặp lại!
#
# GỢI Ý CẤU TRÚC (chỉ là khung suy nghĩ, không phải code):
#   in lời chào
#   while True:
#       nhận tin nhắn, hạ chữ thường
#       if tạm biệt   -> chào + break
#       elif hỏi giá  -> ...
#       elif chào hỏi -> ...
#       ...
#       else          -> fallback
# ============================================================

# TODO: viết chatbot của bạn từ đây ↓
