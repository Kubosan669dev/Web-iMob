# ============================================================
# BÀI 5 — DICT: DỮ LIỆU CÓ TÊN (quan trọng nhất lộ trình!)
# Chạy:  python hoc-python/tuan-02/bai-05-vi-du.py
#
# Vì sao quan trọng: JSON của website, request/response API,
# messages gửi cho LLM — TẤT CẢ đều có dạng dict.
# ============================================================


# ---------- 1. DICT LÀ GÌ: tra bằng TÊN thay vì số thứ tự ----------
# List: hỏi "phần tử số 2 là gì?"  →  ds[2]
# Dict: hỏi "giá của nó là gì?"    →  dv["gia"]   ← dễ đọc hơn hẳn!

dich_vu = {
    "ten": "Zalo MiniApp",      # "ten" là KEY (khóa), "Zalo MiniApp" là VALUE
    "gia": 30,
    "thoi_gian": "4 tuần",
}

print(dich_vu["ten"])           # tra theo key → Zalo MiniApp
print(dich_vu["gia"])           # → 30
print(f"Làm {dich_vu['ten']} giá {dich_vu['gia']} triệu, mất {dich_vu['thoi_gian']}")
# ⚠️ trong f-string, key dùng nháy ĐƠN 'ten' vì nháy kép đã bao ngoài


# ---------- 2. THÊM / SỬA / TRA AN TOÀN ----------
dich_vu["giam_gia"] = 10        # thêm key mới: cứ gán là có
dich_vu["gia"] = 25             # sửa: gán đè lên key cũ
print(dich_vu)                  # in cả dict xem ruột nó thế nào

# Tra key KHÔNG tồn tại bằng [] sẽ nổ KeyError:
# print(dich_vu["mau_sac"])     # ← bỏ # chạy thử để biết mặt lỗi này!

# .get() = tra an toàn: không có key thì trả giá trị dự phòng
print(dich_vu.get("mau_sac", "không có thông tin"))


# ---------- 3. DUYỆT DICT BẰNG .items() ----------
# .items() phát ra từng cặp (key, value) — giống enumerate phát (số, phần tử)

print("\nChi tiết dịch vụ:")
for khoa, gia_tri in dich_vu.items():
    print(f"  {khoa}: {gia_tri}")


# ---------- 4. ⭐ LIST CHỨA DICT — chính là services.json của website! ----------
# Mở src/data/services.json của bạn mà xem: y hệt cấu trúc này.

ds_dich_vu = [
    {"ten": "Zalo MiniApp", "gia": 30},
    {"ten": "Phần mềm quản lý", "gia": 50},
    {"ten": "Đào tạo chuyển đổi số", "gia": 15},
]

print("\nBảng giá:")
for dv in ds_dich_vu:               # dv lần lượt là TỪNG dict
    print(f"  {dv['ten']} — {dv['gia']} triệu")


# ---------- 5. ⭐⭐ BỘ NÃO BOT BẰNG DICT: hết thời if/elif dài ----------
# Tuần trước: mỗi chủ đề 1 nhánh elif → thêm chủ đề phải sửa code.
# Giờ: não = dict {từ khóa: câu trả lời} → thêm chủ đề = thêm 1 DÒNG DỮ LIỆU.
# (Đây chính là cách chatResponses.json của website sẽ hoạt động!)

bo_nao = {
    "giá": "Bạn để lại SĐT, mình gửi báo giá chi tiết ạ!",
    "chào": "Xin chào! Mình giúp gì được cho bạn?",
    "dịch vụ": "Bên mình làm MiniApp, phần mềm và đào tạo chuyển đổi số.",
    "liên hệ": "Gọi 0900 000 000 gặp mình nhé!",
}

cau_khach = "cho hỏi bên bạn có những dịch vụ gì vậy"

tra_loi_duoc = False                          # mẫu 3 nhịp quen thuộc: giả định...
for tu_khoa, cau_tra_loi in bo_nao.items():   # ...quét từng cặp (từ khóa, trả lời)
    if tu_khoa in cau_khach:
        print(f"\nBot: {cau_tra_loi}")
        tra_loi_duoc = True
        break
if not tra_loi_duoc:                          # ...kết luận
    print("\nBot: Bạn mô tả rõ hơn giúp mình nha.")

# ============================================================
# THỬ THÁCH NHỎ:
#   - Phần 2: bỏ # dòng KeyError, chạy, đọc lỗi, che lại
#   - Phần 5: thêm chủ đề "bảo hành" vào bo_nao (CHỈ thêm dữ liệu,
#     không sửa vòng lặp!) rồi đổi cau_khach để thử
#   - Nghĩ: vì sao thêm chủ đề mới ở bài 3 phải viết thêm elif,
#     còn ở đây chỉ thêm 1 dòng trong dict? (gợi ý: tách DỮ LIỆU khỏi LOGIC)
# ============================================================
