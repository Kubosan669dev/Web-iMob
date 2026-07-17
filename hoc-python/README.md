# 🐍 LỚP HỌC PYTHON → CHATBOT AI

> Mục tiêu cuối: tự tay viết backend FastAPI gọi LLM cho website này (Bước 6-7 của KE-HOACH.md sẽ làm sau khi học xong nền tảng).
> Máy đã có sẵn **Python 3.14** — không cần cài gì thêm cho tuần đầu.

---

## CÁCH HỌC (đọc kỹ, quan trọng hơn nội dung)

1. Mỗi bài có 2 file:
   - `bai-XX-vi-du.py` — bài giảng chạy được: **đọc từng dòng → chạy → sửa thử vài chỗ xem điều gì xảy ra**
   - `bai-XX-bai-tap.py` — bài tập có `TODO`: **tự gõ code** (không copy), chạy được là đạt
2. Chạy file: mở Terminal trong VSCode (`` Ctrl+` ``) rồi gõ:
   ```
   python hoc-python/tuan-01/bai-01-vi-du.py
   ```
   ⚠️ Dùng lệnh `python` (đừng dùng `py` — máy này có 2 bản Python, bản của `py` bị lỗi vặt).
   Nếu gặp lỗi `UnicodeEncodeError` khi in tiếng Việt: **đóng terminal mở lại** (đã bật sẵn chế độ UTF-8, terminal mới sẽ nhận).
3. Làm xong (hoặc bí) → nhắn Claude: **"xong bài 1"** hoặc **"bí bài 1 chỗ X"** → tôi chữa bài, giải thích, rồi giao bài tiếp.
4. Nguyên tắc:
   - Gặp lỗi: đọc **dòng cuối** của thông báo lỗi trước, thử tự sửa 10 phút rồi mới hỏi
   - Mỗi ngày 1–2h, đều đặn thắng cấp tốc
   - Gõ lại code, đừng dán — tay nhớ nhanh hơn mắt

---

## LỘ TRÌNH 8 TUẦN

| Tuần | Chủ đề | Đích đến (làm được thì qua tuần mới) |
|---|---|---|
| **1** | Python cơ bản I: biến, kiểu dữ liệu, f-string, if/else | Script chào hỏi + tính toán chạy đúng |
| **2** | Python cơ bản II: list, dict, vòng lặp, hàm, đọc/ghi file JSON | Script đọc `services.json` của website in ra danh sách dịch vụ |
| **3** | HTTP & API: request/response, JSON, POST/GET; pip + virtualenv | Gọi một API công khai bằng thư viện `requests` |
| **4** | **FastAPI**: endpoint, Pydantic, uvicorn | Tự viết `/api/chat` trả lời "echo" — nối vào website chạy thật |
| **5** | **Gọi LLM đầu tiên**: API key (Gemini free tier), system prompt, messages | Chatbot tiếng Việt thật trên website của bạn ✨ |
| **6** | Prompt engineering: vai trò, phạm vi, chống bịa | Bot chỉ nói về dịch vụ iMob, lễ phép từ chối câu ngoài lề |
| **7** | Lịch sử hội thoại + streaming SSE | Bot nhớ ngữ cảnh, chữ chảy ra như ChatGPT |
| **8** | RAG cơ bản + deploy | Bot trả lời đúng bảng giá/dịch vụ từ file dữ liệu; chạy trên server thật |

Ghi chú: tuần 4 trở đi sẽ quay lại làm **Bước 6** của website (giao diện chatbot) — lúc đó bạn đã hiểu rõ hai đầu API nói chuyện với nhau thế nào.

---

## TIẾN ĐỘ

- [x] Tuần 1 — Bài 1: Biến & kiểu dữ liệu — ĐẠT 16/07/2026 (logic 4/4; ghi chú: chú ý khớp định dạng output từng ký tự)
- [x] Tuần 1 — Bài 2: if/else & input — ĐẠT 16/07/2026 (ghi chú: câu 2 sửa dữ liệu thay vì dùng .lower() trong code — trả nợ ở Bài 3 yêu cầu 3)
- [x] Tuần 1 — Bài 3: Mini-project chatbot console — ĐẠT 16/07/2026 🎉 (bot Kubo: while True + .lower() + 4 nhánh + bonus đếm câu; tự sửa: đưa nhánh tạm biệt lên đầu)
- [x] Tuần 2 — Bài 4: List & for — ĐẠT CÓ BẢO LƯU 16/07/2026 (pattern `tk in cau_hoi` + cờ đã sửa đúng; nợ: in lịch sử có đánh số → bắt buộc ở Bài 5 câu 3)
- [ ] Tuần 2 — Bài 5: Dict — não bot bằng dict, tiền đề JSON ← **BẠN Ở ĐÂY**
- [ ] Tuần 2 — Bài 6: Hàm (def) — đóng gói não bot thành hàm
- (các bài sau sẽ được giao dần khi bạn hoàn thành)
