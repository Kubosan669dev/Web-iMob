# ============================================================
# BÀI 4 — LIST & VÒNG LẶP FOR  (Tuần 2 bắt đầu!)
# Chạy:  python hoc-python/tuan-02/bai-04-vi-du.py
#
# Bài này giải quyết 2 cái "ngứa" của bot Kubo tuần trước:
#   - chuỗi  or ... or ... or  dài dằng dặc  → list từ khóa
#   - bot nói xong quên luôn                 → list lịch sử chat
# ============================================================


# ---------- 1. LIST: hộp đựng NHIỀU giá trị, có thứ tự ----------
ds_dich_vu = ["Zalo MiniApp", "Phần mềm & Phần cứng", "Đào tạo Chuyển đổi số"]

print(ds_dich_vu[0])    # Zalo MiniApp    ← đếm từ 0, không phải 1!
print(ds_dich_vu[2])    # Đào tạo...      ← phần tử thứ 3 có chỉ số 2
print(ds_dich_vu[-1])   # Đào tạo...      ← -1 = phần tử CUỐI (đếm ngược)
print(len(ds_dich_vu))  # 3               ← len đếm được cả list (bài 1 dùng cho chuỗi)


# ---------- 2. FOR: làm việc với TỪNG phần tử ----------
# "với mỗi dv trong ds_dich_vu, làm những dòng thụt lề bên dưới"

print("\nDịch vụ bên mình:")
for dv in ds_dich_vu:
    print(f"- {dv}")


# ---------- 3. ĐÁNH SỐ THỨ TỰ: enumerate ----------
# enumerate phát cho mỗi phần tử một số thứ tự (start=1 để đếm từ 1)

print("\nMenu:")
for i, dv in enumerate(ds_dich_vu, start=1):
    print(f"{i}. {dv}")


# ---------- 4. THÊM / XÓA ----------
ds_dich_vu.append("Chatbot AI")     # thêm vào CUỐI list
print(f"\nSau khi thêm: {len(ds_dich_vu)} dịch vụ")

ds_dich_vu.remove("Chatbot AI")     # xóa theo giá trị
print(f"Sau khi xóa: {len(ds_dich_vu)} dịch vụ")


# ---------- 5. ⭐ NÂNG CẤP BOT: list từ khóa thay cho or dài ----------
# Tuần trước:  if "giá" in cau_hoi or "bao nhiêu" in cau_hoi or "chi phí"...
# Tuần này: gom từ khóa vào list, quét bằng for — thêm từ khóa mới chỉ 1 chỗ!

cau_hoi = "làm cái app này chi phí hết nhiêu vậy shop"
tu_khoa_gia = ["giá", "bao nhiêu", "chi phí", "nhiêu"]

hoi_gia = False                 # cờ (flag): mặc định là chưa
for tk in tu_khoa_gia:
    if tk in cau_hoi:
        hoi_gia = True          # tìm thấy → bật cờ
        break                   # break dùng được cả trong for: thấy rồi khỏi xét tiếp

if hoi_gia:
    print("\nBot: Bạn để lại SĐT, mình gửi báo giá chi tiết ạ!")
else:
    print("\nBot: Bạn cần hỏi gì nữa không?")


# ---------- 6. ⭐ TRÍ NHỚ CỦA BOT: lịch sử chat ----------
# Bắt đầu bằng list RỖNG, mỗi tin nhắn append vào — nhớ phần giải thích
# về chatbot: LLM không có trí nhớ, "trí nhớ" = ta tự lưu list này!

lich_su = []
lich_su.append("Khách: chào shop")
lich_su.append("Bot: chào bạn!")
lich_su.append("Khách: làm web bao nhiêu?")

print(f"\nĐã có {len(lich_su)} tin nhắn. Xem lại:")
for tin in lich_su:
    print(f"  {tin}")

# ============================================================
# THỬ THÁCH NHỎ:
#   - Phần 1: thử print(ds_dich_vu[5]) → đọc lỗi IndexError cho biết mặt
#   - Phần 5: thêm từ khóa "tốn" vào list rồi đổi câu hỏi thử
#   - Phần 6: append thêm 2 tin rồi in số tin của RIÊNG khách
#     (gợi ý: if tin.startswith("Khách") — tự tra xem startswith làm gì)
# ============================================================
