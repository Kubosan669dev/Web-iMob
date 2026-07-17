# ============================================================
# BÀI 5 — BÀI TẬP
# Chạy:  python hoc-python/tuan-02/bai-05-bai-tap.py
# Lưu ý: bài này tôi chấm CẢ độ chính xác câu chữ output —
# in đúng từng ký tự theo đề (tật cũ từ bài 1 đó 😄)
# ============================================================


# ---------- CÂU 1 — HỒ SƠ DỊCH VỤ ----------
# a) Tạo dict ho_so gồm 3 cặp: ten = "Website bán hàng", gia = 20, thoi_gian = "3 tuần"
# b) In CHÍNH XÁC (1 lệnh print, f-string, nhớ nháy đơn cho key):
#      Website bán hàng: 20 triệu, bàn giao trong 3 tuần.
# c) Thêm key bao_hanh = "12 tháng" rồi in:  Bảo hành: 12 tháng
# d) Dùng .get() tra key "khuyen_mai" (không tồn tại) với dự phòng
#    "chưa có" và in:  Khuyến mãi: chưa có

# TODO: viết code câu 1 ở đây


# ---------- CÂU 2 — BẢNG GIÁ TỪ LIST CHỨA DICT ----------
# Cho (giữ nguyên):
bang_gia = [
    {"ten": "Zalo MiniApp", "gia": 30},
    {"ten": "Website bán hàng", "gia": 20},
    {"ten": "Phần mềm quản lý", "gia": 50},
    {"ten": "Đào tạo chuyển đổi số", "gia": 15},
]

# In danh sách CÓ ĐÁNH SỐ + tổng tiền, CHÍNH XÁC như sau:
#   BẢNG GIÁ DỊCH VỤ:
#   1. Zalo MiniApp - 30 triệu
#   2. Website bán hàng - 20 triệu
#   3. Phần mềm quản lý - 50 triệu
#   4. Đào tạo chuyển đổi số - 15 triệu
#   Tổng gói combo: 115 triệu
# Gợi ý: biến dem cho số thứ tự + biến tong cộng dồn dv["gia"] trong vòng lặp

# TODO: viết code câu 2 ở đây


# ---------- CÂU 3 — BOT KUBO 2.0: NÃO DICT + TRÍ NHỚ ----------
# Bản nâng cấp lớn nhất của Kubo từ trước tới nay. Yêu cầu:
#   1. bo_nao = dict với ÍT NHẤT 5 chủ đề (giá / chào / dịch vụ / liên hệ / bảo hành)
#      — câu trả lời tự sáng tác thoải mái
#   2. lich_su = []  và append mỗi tin nhắn của khách (như bài 4)
#   3. while True: nhận tin, .lower()
#   4. Nhánh thoát ("bye"/"tạm biệt") kiểm tra TRƯỚC TIÊN, khi thoát:
#        - in  === Lịch sử hội thoại ===
#        - in từng tin CÓ ĐÁNH SỐ  (món nợ câu 3 bài 4 — lần này bắt buộc!)
#   5. Không dùng if/elif cho từng chủ đề nữa — quét bo_nao.items()
#      theo mẫu 3 nhịp (giả định → quét → kết luận) như phần 5 ví dụ
#   6. Không khớp chủ đề nào → in câu fallback
# Test trước khi nộp: hỏi "BẢO HÀNH" viết hoa, hỏi 1 câu vu vơ, rồi bye.

# TODO: viết code câu 3 ở đây


# ---------- CÂU 4 — SỬA LỖI (3 lỗi) ----------
# Bỏ dấu # các dòng dưới, chạy, sửa cho tới khi in ra:
#   Kubo hoạt động 24/7, phí duy trì 2 triệu/tháng
# (Gợi ý: một key gõ sai hoa/thường, một chỗ thiếu dấu đóng, một chỗ
#  dùng [] với key không tồn tại — nên đổi sang .get với dự phòng "2")

# thong_tin = {"ten_bot": "Kubo", "gio_hoat_dong": "24/7"
# print(f"{thong_tin['Ten_bot']} hoạt động {thong_tin['gio_hoat_dong']}, "
#       f"phí duy trì {thong_tin['phi_duy_tri']} triệu/tháng")
