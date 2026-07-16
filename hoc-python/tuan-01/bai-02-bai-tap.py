# ============================================================
# BÀI 2 — BÀI TẬP
# Chạy:  python hoc-python/tuan-01/bai-02-bai-tap.py
# Nhớ: sau if/elif/else có dấu HAI CHẤM, dòng dưới THỤT LỀ 4 dấu cách.
# Xong nhắn "xong bài 2" để chữa.
# ============================================================


# ---------- CÂU 1 — LỜI CHÀO THEO GIỜ ----------
# Cho biến gio (cứ đổi giá trị để thử các nhánh):
gio = 9

# Viết if/elif/else in ra:
#   gio từ 5 đến trước 11  -> Chào buổi sáng!
#   gio từ 11 đến trước 13 -> Đến giờ ăn trưa rồi!
#   gio từ 13 đến trước 18 -> Chào buổi chiều!
#   còn lại                -> Chào buổi tối!
# Gợi ý: "từ 5 đến trước 11" viết là  gio >= 5 and gio < 11
#        (các nhánh sau không cần lặp lại vế >= vì elif xét từ trên xuống)

# TODO: viết code câu 1 ở đây


# ---------- CÂU 2 — BỘ NÃO BOT SƠ KHAI ----------
# Cho tin nhắn (đổi nội dung để thử từng nhánh):
tin_nhan = "Shop ơi cho mình xin BÁO GIÁ làm app"

# Viết bot phân loại tin nhắn theo từ khóa (nhớ hạ về chữ thường trước):
#   có "giá" hoặc "bao nhiêu"      -> Bot: Bạn để lại SĐT, bên mình gửi báo giá ngay ạ!
#   có "chào" hoặc "hello"         -> Bot: Xin chào! Mình giúp gì được cho bạn?
#   có "địa chỉ" hoặc "ở đâu"      -> Bot: Bên mình ở Hạ Long, Quảng Ninh nhé!
#   không khớp gì                  -> Bot: Bạn mô tả rõ hơn nhu cầu giúp mình nha.
# Thử ít nhất 3 tin nhắn khác nhau trước khi nộp bài!

# TODO: viết code câu 2 ở đây


# ---------- CÂU 3 — HỎI ĐÁP VỚI NGƯỜI DÙNG (input) ----------
# Viết chương trình:
#   1. Hỏi "Bạn cần làm app hay web? "  và lưu câu trả lời
#   2. Hỏi "Ngân sách của bạn (triệu)? " — nhớ ép kiểu số!
#   3. In tư vấn:
#      - trả lời có chữ "app" và ngân sách >= 50 -> Đủ ngân sách làm app xịn luôn!
#      - trả lời có chữ "app" và ngân sách <  50 -> Nên bắt đầu bằng Zalo MiniApp cho tiết kiệm.
#      - còn lại                                 -> Làm web trước là hợp lý nhất!
# Gợi ý: kết hợp kiến thức câu 4 bài 1 (int vs str) + phần 6 file ví dụ.

# TODO: viết code câu 3 ở đây


# ---------- CÂU 4 — SỬA LỖI (3 lỗi) ----------
# Bỏ dấu # ở 4 dòng dưới, chạy, đọc lỗi và sửa cho tới khi:
#   với diem = 8 in ra:  Khách đánh giá tốt!
# (Gợi ý 3 lỗi: một dấu bị dùng sai chỗ, một dòng thiếu ký tự cuối, một dòng quên thụt lề)

# diem = 8
# if diem = 5:
#     print("Khách đánh giá trung bình")
# elif diem >= 7
# print("Khách đánh giá tốt!")
