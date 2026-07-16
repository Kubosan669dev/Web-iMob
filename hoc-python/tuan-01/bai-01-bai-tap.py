# ============================================================
# BÀI 1 — BÀI TẬP (tự gõ, không copy từ file ví dụ)
# Chạy thử:  python hoc-python/tuan-01/bai-01-bai-tap.py
# Làm tới đâu chạy tới đó — thấy kết quả ngay sẽ ham hơn.
# Xong thì nhắn: "xong bài 1" để được chữa bài.
# ============================================================


# ---------- CÂU 1 ----------
# Tạo 4 biến giới thiệu bản thân:
#   ho_ten      (chuỗi)
#   tuoi        (số nguyên)
#   thanh_pho   (chuỗi)
#   dang_di_hoc (True/False)
# rồi in ra CHÍNH XÁC theo mẫu (dùng f-string, 1 lệnh print duy nhất):
#   Mình là <ho_ten>, <tuoi> tuổi, sống ở <thanh_pho>.

# TODO: viết code câu 1 ở đây


# ---------- CÂU 2 ----------
# Bạn thuê LLM với giá 0.5 đồng / 1000 token.
# Tháng này dùng hết 2_350_000 token (Python cho phép viết _ cho dễ đọc).
# Tạo biến, tính tiền phải trả và in ra:
#   Dùng 2350000 token, phải trả 1175.0 đồng
# Gợi ý: tiền = so_token / 1000 * don_gia

# TODO: viết code câu 2 ở đây


# ---------- CÂU 3 ----------
# Cho tin nhắn sau (giữ nguyên dòng này):
tin_nhan = "Bên bạn có làm app quản lý bán hàng cho shop nhỏ không?"

# a) In số ký tự của tin nhắn
# b) In số từ của tin nhắn
# c) In tin nhắn viết HOA toàn bộ — tự tìm hiểu: thử gõ  tin_nhan.  rồi xem
#    VSCode gợi ý những hàm nào (mẹo: tên hàm cần tìm là 'upper')

# TODO: viết code câu 3 ở đây


# ---------- CÂU 4 — SỬA LỖI (kỹ năng quan trọng nhất!) ----------
# Đoạn code dưới đây có 3 LỖI. Bỏ dấu # ở 3 dòng code, chạy, đọc thông báo lỗi,
# sửa từng lỗi một cho tới khi in ra:  Bot Alpha đã trả lời 15 câu hỏi

# ten_bot = Bot Alpha
# so_cau = "15"
# print(f"{ten_bot} đã trả lời {so_cau + 5 - 5} câu hỏi")

# (Gợi ý: chuỗi phải có ngoặc kép; "15" đang là chuỗi chứ không phải số —
#  không cộng trừ được với số. Nghĩ xem nên khai báo lại thế nào.)
