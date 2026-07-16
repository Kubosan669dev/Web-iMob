# ============================================================
# BÀI 2 — IF/ELSE: DẠY BOT BIẾT "CHỌN"
# Chạy:  python hoc-python/tuan-01/bai-02-vi-du.py
# (cuối file có phần nhập từ bàn phím — cứ gõ trả lời rồi Enter)
#
# Bài này quan trọng: chatbot giả lập trên website của bạn
# hoạt động CHÍNH XÁC bằng cơ chế trong phần 5 dưới đây.
# ============================================================


# ---------- 1. PHÉP SO SÁNH → kết quả là True/False ----------
tuoi = 20

print(tuoi == 20)   # True   == là "có bằng nhau không?" (KHÁC dấu = gán!)
print(tuoi != 18)   # True   != là "khác nhau không?"
print(tuoi > 30)    # False  lớn hơn
print(tuoi <= 20)   # True   nhỏ hơn hoặc bằng


# ---------- 2. IF / ELSE: rẽ nhánh đầu tiên ----------
# Cấu trúc:  if <điều kiện>:   ← có dấu HAI CHẤM
#                <việc cần làm>  ← THỤT LỀ 4 dấu cách (Python bắt buộc!)

credit = 40

if credit > 0:
    print("Bot còn credit, sẵn sàng trả lời")
else:
    print("Hết credit rồi, nạp thêm nhé")


# ---------- 3. ELIF: nhiều hơn 2 nhánh ----------
# Python xét TỪ TRÊN XUỐNG, gặp nhánh đúng đầu tiên là dừng.

gio = 14

if gio < 12:
    print("Chào buổi sáng!")
elif gio < 18:
    print("Chào buổi chiều!")   # gio = 14 rơi vào đây
else:
    print("Chào buổi tối!")


# ---------- 4. GHÉP ĐIỀU KIỆN: and / or / not ----------
la_khach_vip = True
so_du = 5

if la_khach_vip and so_du > 0:      # and: cả hai cùng đúng
    print("Ưu tiên trả lời khách VIP")

if so_du <= 0 or not la_khach_vip:  # or: một trong hai đúng / not: đảo ngược
    print("Xếp hàng chờ nhé")
else:
    print("Được phục vụ ngay")


# ---------- 5. ⭐ TRÁI TIM CỦA CHATBOT: `in` + .lower() ----------
# Toán tử `in` kiểm tra chuỗi con có nằm trong chuỗi lớn không.
# .lower() hạ hết về chữ thường — để "GIÁ", "Giá", "giá" đều bắt được.

tin_nhan = "Cho mình hỏi GIÁ làm miniapp với"
tin_nhan_thuong = tin_nhan.lower()

print("giá" in tin_nhan_thuong)     # True  ← nhờ .lower()
print("xin chào" in tin_nhan_thuong) # False

# Ghép lại thành bộ não bot sơ khai — Bước 6 của website làm y hệt:
if "giá" in tin_nhan_thuong or "báo giá" in tin_nhan_thuong:
    print("Bot: Bạn quan tâm dịch vụ nào để mình gửi báo giá chi tiết ạ?")
elif "chào" in tin_nhan_thuong or "hello" in tin_nhan_thuong:
    print("Bot: Xin chào! Mình có thể giúp gì cho bạn?")
else:
    print("Bot: Mình chưa hiểu ý bạn, bạn nói rõ hơn được không?")


# ---------- 6. input(): nhận tin nhắn thật từ bàn phím ----------
# input() DỪNG chương trình chờ bạn gõ + Enter, trả về CHUỖI (luôn là str!)

ten = input("Bạn tên gì? ")
print(f"Chào {ten}, rất vui được gặp bạn!")

# ⚠️ Bẫy kinh điển: input() luôn trả CHUỖI, muốn tính toán phải ép kiểu int()
tuoi_nhap = int(input("Bạn bao nhiêu tuổi? "))   # int() đổi chuỗi thành số

if tuoi_nhap >= 18:
    print("Bạn đủ tuổi ký hợp đồng dịch vụ rồi đó!")
else:
    print(f"Còn {18 - tuoi_nhap} năm nữa nhé :)")

# ============================================================
# THỬ THÁCH NHỎ:
#   - Đổi gio = 23 xem lời chào thay đổi thế nào
#   - Phần 5: thêm nhánh elif bắt từ khóa "liên hệ" → in số điện thoại
#   - Cố tình gõ chữ ("hai mươi") khi được hỏi tuổi → đọc lỗi ValueError
# ============================================================
