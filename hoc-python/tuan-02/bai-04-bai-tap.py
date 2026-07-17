# ============================================================
# BÀI 4 — BÀI TẬP
# Chạy:  python hoc-python/tuan-02/bai-04-bai-tap.py
# Xong nhắn "xong bài 4".
# ============================================================


# ---------- CÂU 1 — MENU DỊCH VỤ ----------
# a) Tạo list ds_dich_vu gồm 4 dịch vụ (3 dịch vụ quen thuộc + tự nghĩ thêm 1)
# b) In tiêu đề "MENU DỊCH VỤ:" rồi in từng dịch vụ CÓ ĐÁNH SỐ từ 1:
#      MENU DỊCH VỤ:
#      1. Zalo MiniApp
#      2. ...
# c) In thêm dòng:  Tổng cộng: 4 dịch vụ   (dùng len, đừng gõ số 4 cứng!)

# TODO: viết code câu 1 ở đây


# ---------- CÂU 2 — QUÉT TỪ KHÓA BẰNG LIST ----------
# Cho (giữ nguyên 2 dòng):
cau_hoi = "shop ơi làm cái web bán hàng tốn kém lắm không"
tu_khoa_gia = ["giá", "bao nhiêu", "chi phí", "tốn"]

# Viết vòng for + cờ (flag) như phần 5 file ví dụ:
#   nếu cau_hoi chứa 1 trong các từ khóa → in  Phát hiện khách hỏi giá!
#   không chứa từ nào                    → in  Khách không hỏi giá.
# Thử đổi cau_hoi thành câu khác để chắc cả 2 nhánh đều chạy.

# TODO: viết code câu 2 ở đây


# ---------- CÂU 3 — BOT KUBO CÓ TRÍ NHỚ ----------
# Nâng cấp chatbot bài 3 (chép phần code bot của bạn sang đây rồi sửa):
#   1. Trước vòng while: tạo  lich_su = []
#   2. Ngay sau khi nhận tin nhắn: append tin nhắn của khách vào lich_su
#   3. Giữ nguyên các nhánh trả lời (nhớ để nhánh tạm biệt LÊN ĐẦU —
#      đúng như bạn đã hứa sửa ở bài 3 😄)
#   4. Khi khách tạm biệt, trước khi break:
#        - in  === Lịch sử hội thoại ===
#        - in từng tin nhắn trong lich_su có đánh số 1. 2. 3...
# Test: chat 3-4 câu rồi bye, lịch sử phải đủ và đúng thứ tự.

# TODO: viết code câu 3 ở đây


# ---------- CÂU 4 — SỬA LỖI (3 lỗi) ----------
# Bỏ dấu # ở 4 dòng dưới, chạy, đọc lỗi, sửa cho tới khi in ra:
#   web / app / AI  (mỗi thứ một dòng)  rồi dòng cuối:  Món cuối: AI
# (Gợi ý: một chỉ số vượt quá phạm vi, một dòng thiếu ký tự cuối, một dòng quên thụt lề)

# mon = ["web", "app", "AI"]
# for m in mon
# print(m)
# print(f"Món cuối: {mon[3]}")
