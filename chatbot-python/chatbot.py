"""Chạy chatbot iMob trong cửa sổ dòng lệnh.

    python chatbot.py

- Ưu tiên đọc data/imob_chatbot_data.json (file thật của bạn).
- Nếu chưa có, dùng tạm data/sample_data.json và báo rõ.
Gõ '/thoat' hoặc bấm Ctrl+C để dừng.
"""

import sys
from pathlib import Path

from imob_bot import ChatBot, KienThuc

# Windows: ép cửa sổ in ra UTF-8 để không lỗi tiếng Việt.
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stdin.reconfigure(encoding="utf-8")
except Exception:
    pass

THU_MUC = Path(__file__).resolve().parent
FILE_THAT = THU_MUC / "data" / "imob_chatbot_data.json"
FILE_MAU = THU_MUC / "data" / "sample_data.json"


def nap_du_lieu():
    if FILE_THAT.exists():
        return KienThuc.tu_file(FILE_THAT), False
    return KienThuc.tu_file(FILE_MAU), True


def cau_chao(kt: KienThuc) -> str:
    for st in kt.data.get("smalltalk", []):
        if st.get("intent") == "greeting":
            return st.get("answer", "")
    return "Dạ em chào anh/chị! Em là trợ lý tư vấn của iMob. Em có thể giúp gì cho anh/chị ạ?"


def main():
    kt, dung_mau = nap_du_lieu()
    bot = ChatBot(kt)

    print("=" * 62)
    print("  iBot — trợ lý tư vấn iMob  (gõ '/thoat' để dừng)")
    if dung_mau:
        print("  [!] Đang dùng DỮ LIỆU MẪU nhỏ.")
        print("      Bỏ file thật vào: data/imob_chatbot_data.json để dùng đầy đủ.")
    print("=" * 62)
    print("iBot > " + cau_chao(kt))

    while True:
        try:
            cau = input("\nBạn  > ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\niBot > Dạ em cảm ơn anh/chị, hẹn gặp lại ạ!")
            break

        if cau.lower() in ("/thoat", "/quit", "/exit"):
            print("iBot > Dạ em cảm ơn anh/chị, hẹn gặp lại ạ!")
            break
        if not cau:
            continue

        print("iBot > " + bot.tra_loi(cau))


if __name__ == "__main__":
    main()
