# ============================================================
# BÀI 3 (phần lý thuyết) — VÒNG LẶP WHILE
# Chạy:  python hoc-python/tuan-01/bai-03-vi-du.py
#
# Mảnh ghép cuối cùng để làm chatbot: chat là một VÒNG LẶP
# (nghe → trả lời → nghe → trả lời...) cho tới khi khách chào tạm biệt.
# ============================================================


# ---------- 1. WHILE: lặp khi điều kiện còn đúng ----------
dem = 1

while dem <= 3:
    print(f"Bot đang khởi động... lần {dem}")
    dem += 1          # ⚠️ quên dòng này = lặp VÔ TẬN (Ctrl+C để thoát!)

print("Khởi động xong!\n")


# ---------- 2. WHILE TRUE + BREAK: vòng lặp "chạy mãi cho tới khi..." ----------
# Đây là khung xương của MỌI chatbot console:
#   while True:  lặp vô hạn có chủ đích
#   break:       thoát ngay khỏi vòng lặp

so_lan = 0
while True:
    so_lan += 1
    print(f"Vòng thứ {so_lan}")
    if so_lan == 3:
        print("Đủ 3 vòng, thoát!")
        break         # nhảy ra khỏi while ngay lập tức

print("Đã ở ngoài vòng lặp\n")


# ---------- 3. GHÉP VỚI INPUT: mẫu chatbot tối giản ----------
# Chạy thử đoạn này: gõ vài câu bất kỳ, gõ "bye" để kết thúc.

print("Bot: Xin chào! (gõ 'bye' để kết thúc)")

while True:
    cau_hoi = input("Bạn: ").lower()      # .lower() NGAY khi nhận — thói quen tốt

    if "bye" in cau_hoi:
        print("Bot: Tạm biệt, hẹn gặp lại!")
        break
    else:
        print("Bot: Tôi nghe đây, bạn nói tiếp đi...")

# ============================================================
# THỬ THÁCH NHỎ:
#   - Phần 1: đổi điều kiện thành dem <= 5 xem chạy mấy lần
#   - Phần 3: thêm 1 nhánh elif bắt chữ "tên" → bot tự giới thiệu tên
# ============================================================
