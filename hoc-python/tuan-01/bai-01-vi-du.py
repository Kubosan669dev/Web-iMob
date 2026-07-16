# ============================================================
# BÀI 1 — BIẾN & KIỂU DỮ LIỆU
# Cách dùng file này:
#   1. Đọc từng khối, đoán xem nó in ra gì
#   2. Chạy:  python hoc-python/tuan-01/bai-01-vi-du.py
#   3. SỬA THỬ vài giá trị rồi chạy lại — cách học nhanh nhất!
# ============================================================


# ---------- 1. BIẾN: cái hộp có tên, đựng một giá trị ----------
# Tạo biến = đặt tên + dấu = + giá trị. Không cần khai báo kiểu.

bot_name = "iMob Assistant"     # str  : chuỗi ký tự (luôn trong ngoặc kép)
year = 2026                     # int  : số nguyên
price = 19.5                    # float: số thực (dấu chấm, không phải phẩy)
is_online = True                # bool : chỉ có True hoặc False (viết hoa chữ đầu)

print(bot_name)                 # print() = in ra màn hình
print(year)


# ---------- 2. XEM KIỂU DỮ LIỆU BẰNG type() ----------
# Chatbot nhận tin nhắn là str, tính tiền token bằng int/float —
# nhầm kiểu là lỗi phổ biến số 1 của người mới.

print(type(bot_name))           # <class 'str'>
print(type(year))               # <class 'int'>
print(type(price))              # <class 'float'>
print(type(is_online))          # <class 'bool'>


# ---------- 3. F-STRING: ghép biến vào chuỗi ----------
# Viết chữ f trước ngoặc kép, nhét biến trong {ngoặc nhọn}.
# Đây là thứ bạn sẽ dùng NHIỀU NHẤT khi viết system prompt sau này.

greeting = f"Xin chào! Tôi là {bot_name}, trợ lý ảo năm {year}."
print(greeting)

# Trong {} tính toán được luôn:
print(f"Giá dịch vụ: {price} triệu — khuyến mãi còn {price * 0.8:.1f} triệu")
#                                                              ^^^^ :.1f = làm tròn 1 số lẻ


# ---------- 4. PHÉP TOÁN CƠ BẢN ----------
a = 10
b = 3
print(a + b)    # 13   cộng
print(a - b)    # 7    trừ
print(a * b)    # 30   nhân
print(a / b)    # 3.33... chia (LUÔN ra float)
print(a // b)   # 3    chia lấy phần nguyên
print(a % b)    # 1    chia lấy dư


# ---------- 5. CHUỖI CŨNG "CỘNG" VÀ ĐO ĐƯỢC ----------
user_message = "Cho mình hỏi giá làm Zalo MiniApp"

so_ky_tu = len(user_message)            # len() = đếm độ dài
so_tu = len(user_message.split())       # .split() = tách chuỗi thành list các từ

print(f"Tin nhắn: {user_message}")
print(f"Dài {so_ky_tu} ký tự, khoảng {so_tu} từ")

# Ước lượng token kiểu LLM (nhớ bài giảng: ~1 token ≈ 3/4 từ):
uoc_luong_token = so_tu / 0.75
print(f"Ước lượng ~{uoc_luong_token:.0f} token")


# ---------- 6. BIẾN THAY ĐỔI ĐƯỢC (vì thế gọi là 'biến') ----------
credit = 100
print(f"Credit ban đầu: {credit}")

credit = credit - 30            # lấy giá trị cũ trừ đi 30, gán ngược lại
print(f"Sau khi gọi API 1 lần: {credit}")

credit -= 30                    # viết tắt của dòng trên
print(f"Sau lần gọi nữa: {credit}")

# ============================================================
# THỬ THÁCH NHỎ TRƯỚC KHI LÀM BÀI TẬP:
#   - Đổi bot_name thành tên bạn thích, chạy lại
#   - Đoán xem  print(a ** b)  in ra gì, rồi thêm vào chạy thử (** là lũy thừa)
#   - Cố tình viết  print(Year)  (chữ Y hoa) — đọc thông báo lỗi, hiểu vì sao
# ============================================================
