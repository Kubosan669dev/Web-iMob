"""Chạy bộ test_cases trong file dữ liệu và kiểm tra vài lằn ranh quan trọng.

    python run_tests.py

Với mỗi câu test, in ra câu trả lời của bot và tự kiểm:
  - Câu hỏi giá  -> câu trả lời KHÔNG được chứa số tiền.
  - Câu dụ đổi vai (prompt injection) -> bot phải từ chối, hướng về hotline.
  - Vài câu có nội dung bắt buộc (bảo hành, địa chỉ, số tính năng, source code).
"""

import os
import sys
from pathlib import Path

# TẮT Gemini trong lúc chạy test — phải đặt TRƯỚC khi nạp imob_bot.
#
# Vì sao: bộ test này kiểm những lằn ranh KHÔNG ĐƯỢC PHÉP SAI (không đưa số
# tiền, không đổi vai khi bị dụ). Nếu để Gemini bật, cùng một câu hỏi có thể ra
# kết quả khác nhau giữa hai lần chạy, test hỏng lúc được lúc không thì mất
# sạch giá trị. Ngoài ra test phải chạy được khi không có mạng và không được
# tiêu quota của công ty mỗi lần ai đó gõ `python run_tests.py`.
#
# Muốn thử Gemini thật thì chạy backend rồi gọi /api/chat, đừng bật ở đây.
os.environ["GEMINI_API_KEY"] = ""

from imob_bot import ChatBot, KienThuc  # noqa: E402
from imob_bot import guardrails as gr
from imob_bot.text_utils import bo_dau

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

THU_MUC = Path(__file__).resolve().parent
FILE_THAT = THU_MUC / "data" / "imob_chatbot_data.json"
FILE_MAU = THU_MUC / "data" / "sample_data.json"


def kiem_tra(inp: str, ans: str):
    """Trả về danh sách (tên_kiểm_tra, đạt?) áp dụng cho câu test này."""
    ki = bo_dau(inp.lower())
    ka = bo_dau(ans.lower())
    kq = []

    if gr.la_prompt_injection(inp):
        kq.append(("chong prompt injection (huong ve hotline)",
                   "hotline" in ka or "vai tro" in ka))
    elif gr.la_cau_hoi_gia(inp):
        kq.append(("hoi gia -> khong lo so tien", not gr.chua_so_gia(ans)))

    if "bao hanh" in ki or "hong thi" in ki:
        kq.append(("bao hanh: co '2 nam' va '1 nam'", "2 nam" in ka and "1 nam" in ka))
    if " o dau" in (" " + ki) or "van phong" in ki:
        # Doi 18/08/2026: cong ty xac nhan dia chi la van phong HL68 Building
        # (phuong Ha Long), khong phai To 8 khu 3 Bai Chay nhu ban truoc. Bat
        # theo "hl68" vi day la phan dac trung nhat, khong dinh dau tieng Viet.
        kq.append(("dia chi: co 'hl68'", "hl68" in ka))
    if "bao nhieu tinh nang" in ki:
        kq.append(("tinh nang: co so '7'", "7" in ans))
    if "source code" in ki or "ma nguon" in ki:
        kq.append(("ban giao: co 'source code'/'ma nguon'",
                   "source code" in ka or "ma nguon" in ka))

    kq.append(("co tra loi (khong rong)", bool(ans.strip())))
    return kq


# ============================================================
# BỘ ĐO RIÊNG CHO CHỐT CHẶN GIÁ (thêm 21/08/2026)
#
# Vì sao tách riêng: chua_so_gia() là chốt chặn CUỐI trong bot.tra_loi() — hễ
# nó kêu là cả câu trả lời bị vứt, thay bằng câu báo giá chuẩn. Nên nó sai kiểu
# nào cũng nguy:
#   · bỏ sót  -> bot đọc số tiền ra cho khách, đúng thứ tuyệt đối không được
#   · bắt oan -> bot trả lời lạc đề mà KHÔNG có lỗi nào hiện ra
#
# Vế "bắt oan" đã xảy ra thật và nằm im rất lâu: biểu thức cũ bắt "một con số
# rồi tới chữ k" mà không kiểm sau chữ k là gì, nên "30 km" và "19 kg" bị đọc
# thành "30 nghìn", "19 nghìn". Mọi câu hỏi về robot đều nhận câu báo giá.
# Chỉ lộ ra khi kho kiến thức bắt đầu có thông số kỹ thuật.
#
# Hai danh sách dưới đây khoá cả hai chiều lại.
# ============================================================
PHAI_CHAN = [
    "gia 50 trieu dong",
    "khoang 1,5 ty",
    "chi 200k thoi",
    "2.000.000 vnd",
    "$500",
    "500 $",
    "150 usd",
    "tu 30 nghin",
    "1.500k mot goi",
]

KHONG_DUOC_CHAN = [
    "pin di duoc 30 km mot lan sac",
    "may nang 19 kg",
    "robot nang 90 kg",
    "camera 4K Ultra HD",
    "do phan giai 8K",
    "man hinh 13,3 inch",
    "sac 80% trong khoang 1,5 gio",
    "vuot vat can 150 mm",
    "loi nuoc 130 mm",
    "nhiet do 10-50 do C",
    "uptime 99,9%",
    "ho tro 24/7",
    "kich thuoc 460 x 460 x 1200 mm",
    "toc do duoi 8 km/h",
]


def kiem_chot_chan_gia():
    """Trả về danh sách (tên_kiểm_tra, đạt?)."""
    kq = []
    for c in PHAI_CHAN:
        kq.append(("chan dung so tien: %r" % c, gr.chua_so_gia(c)))
    for c in KHONG_DUOC_CHAN:
        kq.append(("khong bat oan thong so: %r" % c, not gr.chua_so_gia(c)))
    return kq


def main():
    kt = KienThuc.tu_file(FILE_THAT if FILE_THAT.exists() else FILE_MAU)
    tests = kt.data.get("test_cases", [])
    if not tests:
        print("Không có test_cases trong dữ liệu.")
        return

    tong = dat = 0
    for t in tests:
        inp = t.get("input", "")
        bot = ChatBot(kt)                    # bot mới mỗi test -> không dính trạng thái cũ
        ans = bot.tra_loi(inp)

        print(f"\n[{t.get('id', '?')}] {inp}")
        print(f"   -> {ans[:150]}{'...' if len(ans) > 150 else ''}")
        if t.get("expect"):
            print(f"   (mong đợi: {t['expect']})")
        for ten, ok in kiem_tra(inp, ans):
            tong += 1
            dat += 1 if ok else 0
            print(f"      {'PASS' if ok else 'FAIL'} — {ten}")

    print("\n[chot-chan-gia] Do rieng bieu thuc nhan dien so tien")
    for ten, ok in kiem_chot_chan_gia():
        tong += 1
        dat += 1 if ok else 0
        if not ok:
            print(f"      FAIL — {ten}")
    print(f"      {len(PHAI_CHAN)} cau phai chan · "
          f"{len(KHONG_DUOC_CHAN)} cau khong duoc bat oan")

    print("\n" + "=" * 55)
    print(f"KẾT QUẢ: {dat}/{tong} kiểm tra ĐẠT.")
    sys.exit(0 if dat == tong else 1)


if __name__ == "__main__":
    main()
