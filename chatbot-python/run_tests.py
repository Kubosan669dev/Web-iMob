"""Chạy bộ test_cases trong file dữ liệu và kiểm tra vài lằn ranh quan trọng.

    python run_tests.py

Với mỗi câu test, in ra câu trả lời của bot và tự kiểm:
  - Câu hỏi giá  -> câu trả lời KHÔNG được chứa số tiền.
  - Câu dụ đổi vai (prompt injection) -> bot phải từ chối, hướng về hotline.
  - Vài câu có nội dung bắt buộc (bảo hành, địa chỉ, số tính năng, source code).
"""

import sys
from pathlib import Path

from imob_bot import ChatBot, KienThuc
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
        kq.append(("dia chi: co 'bai chay'", "bai chay" in ka))
    if "bao nhieu tinh nang" in ki:
        kq.append(("tinh nang: co so '7'", "7" in ans))
    if "source code" in ki or "ma nguon" in ki:
        kq.append(("ban giao: co 'source code'/'ma nguon'",
                   "source code" in ka or "ma nguon" in ka))

    kq.append(("co tra loi (khong rong)", bool(ans.strip())))
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

    print("\n" + "=" * 55)
    print(f"KẾT QUẢ: {dat}/{tong} kiểm tra ĐẠT.")
    sys.exit(0 if dat == tong else 1)


if __name__ == "__main__":
    main()
