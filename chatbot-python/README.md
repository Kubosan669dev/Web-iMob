# Chatbot iMob (Python)

Trợ lý tư vấn **iBot** cho iMob, viết bằng Python, **chạy hoàn toàn trong máy** —
không cần internet, không cần API, không tốn phí. Hiểu câu hỏi bằng **TF-IDF**
(thư viện scikit-learn) và trả lời dựa trên file dữ liệu JSON.

Bot làm được:
- Trả lời về 3 dịch vụ: Đào tạo chuyển đổi số, Zalo MiniApp, Phần mềm & phần cứng.
- **Không bao giờ đưa con số giá** — giải thích mô hình báo giá riêng rồi mời để lại liên hệ.
- **Thu thập liên hệ** (họ tên → SĐT → email) qua nhiều lượt, có kiểm tra định dạng.
- **Chống prompt injection** (khách dán lệnh hòng đổi vai / đòi lộ hướng dẫn).
- Hiểu cả khi khách **gõ không dấu** ("lam mini app gia bao nhieu").

---

## 1. Cài đặt (làm 1 lần)

Cần **Python 3.10+**. Mở PowerShell tại thư mục này rồi chạy:

```powershell
python -m pip install -r requirements.txt
```

## 2. Chạy bot

```powershell
python chatbot.py
```

Gõ câu hỏi để chat. Gõ `/thoat` (hoặc bấm Ctrl+C) để dừng.

## 3. Chạy bộ kiểm tra

```powershell
python run_tests.py
```

Bot sẽ chạy các câu trong `test_cases` và tự kiểm các lằn ranh quan trọng
(không lộ số giá, chống injection, trả đúng bảo hành/địa chỉ...).

---

## 4. Dùng dữ liệu thật đầy đủ

Bot ưu tiên đọc **`data/imob_chatbot_data.json`**. Nếu chưa có, nó dùng tạm
**`data/sample_data.json`** (bản mẫu nhỏ, chỉ để chạy thử) và báo trên màn hình.

👉 Chỉ cần copy file gốc `imob_chatbot_data.json` của bạn vào thư mục **`data/`**
là bot dùng đầy đủ 61 FAQ + 8 chào hỏi + 37 đoạn kiến thức. **Không phải sửa code.**

> Lưu file bằng mã hoá **UTF-8** để không lỗi tiếng Việt.

---

## 5. Cấu trúc thư mục

```
chatbot-python/
  chatbot.py            ← chạy bot trong terminal
  run_tests.py          ← chạy bộ kiểm tra
  requirements.txt      ← thư viện cần cài
  data/
    sample_data.json    ← dữ liệu mẫu (tự thay bằng file thật)
    imob_chatbot_data.json   ← (bạn bỏ file thật vào đây)
  imob_bot/             ← phần lõi
    text_utils.py       ← chuẩn hoá tiếng Việt (bỏ dấu)
    guardrails.py       ← chặn số giá, chống prompt injection
    knowledge.py        ← nạp JSON thành tài liệu tìm kiếm
    engine.py           ← TF-IDF + độ tương đồng cosine
    lead.py             ← thu thập họ tên / SĐT / email
    bot.py              ← ghép mọi thứ, xử lý một lượt chat
```

---

## 6. Dạy thêm cho bot

Mở file dữ liệu JSON, thêm một mục vào `faqs`:

```json
{
  "id": "F062",
  "service": "zalo_miniapp",
  "intent": "miniapp_ngonngu",
  "questions": ["mini app có đa ngôn ngữ không", "hỗ trợ tiếng Anh không"],
  "answer": "Dạ MiniApp hỗ trợ đa ngôn ngữ tuỳ theo yêu cầu của đơn vị ạ..."
}
```

- `questions` = các cách khách có thể hỏi (càng nhiều cách càng dễ khớp).
- Thêm `"action": "collect_lead"` nếu muốn bot xin liên hệ sau khi trả lời.
- Chạy lại `python run_tests.py` để kiểm tra.

## 7. Chỉnh độ "khó tính" khi khớp câu

Trong `imob_bot/bot.py` có 2 con số:

```python
NGUONG_FAQ = 0.18     # tăng nếu bot hay nhận nhầm; giảm nếu bot hay bỏ sót
NGUONG_CHUNK = 0.12
```

---

## 8. Sau này muốn gắn lên website / Zalo?

Phần lõi (`imob_bot/`) đã tách khỏi giao diện dòng lệnh, nên có thể bọc lại thành
API (FastAPI) hoặc nối vào Zalo OA sau này mà **không phải viết lại logic**. Khi cần,
cứ nhắn để mình hướng dẫn thêm.

## 9. Backend Python có chức năng gì?

Chạy:

```bash
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

`main.py` cung cấp các đường dẫn:

| Đường dẫn | Công dụng |
|---|---|
| `GET /` | Thông tin dịch vụ — mở bằng trình duyệt để kiểm tra sống/chết |
| `GET /health` | Render gọi định kỳ để biết service còn khỏe |
| `GET /docs` | Trang thử API tự sinh của FastAPI |
| `POST /api/chat` | Nơi website gửi câu hỏi của khách |

**`POST /api/chat`** — body gửi lên:

```json
{
  "message": "báo giá zalo mini app",
  "history": [],
  "session_id": "abc123"
}
```

- `message` — câu hỏi của khách (bắt buộc)
- `history` — lịch sử hội thoại (danh sách `role` + `content`); hiện chưa dùng tới
- `session_id` — mã phiên, **nên gửi**; không gửi thì server tự cấp mã mới

Trả về:

```json
{ "response": "<câu trả lời>", "session_id": "abc123" }
```

### Vì sao cần `session_id`?

`ChatBot` **nhớ trạng thái** giữa các lượt: đang hỏi khách họ tên hay số điện
thoại (`self.lead`), đã trượt mấy câu liên tiếp (`self.so_lan_truot`). Nếu cả
website dùng chung một con bot thì khách A đang để lại SĐT mà khách B nhắn vào,
câu của B sẽ bị nuốt làm "số điện thoại của A".

Nên `main.py` giữ **một bot riêng cho mỗi `session_id`**. Phần nặng (kho kiến
thức + chỉ mục TF-IDF) vẫn dùng chung một bản trong bộ nhớ nhờ sao chép nông
(`copy()`), chỉ phần trạng thái là riêng — tạo phiên mới gần như tức thì.

Server giữ tối đa 500 phiên gần nhất, phiên cũ nhất bị đẩy ra để bộ nhớ không
phình mãi. Website tự sinh `session_id` và lưu trong `sessionStorage` (mỗi tab
một phiên, đóng tab là hết) — xem `src/services/chatService.js`.

Backend dùng lớp `ChatBot` trong `chatbot-python/imob_bot` để trả lời dựa trên
dữ liệu nội bộ (`chatbot-python/data/imob_chatbot_data.json`, thiếu thì dùng
`sample_data.json`).

### Deploy lên Render

Xem [HUONG-DAN-DEPLOY-RENDER.md](../HUONG-DAN-DEPLOY-RENDER.md) ở thư mục gốc.

## Backend Python làm được gì?
Xử lý hội thoại bằng Python, không phải JavaScript trên frontend
Dùng dữ liệu chatbot nội bộ để trả về câu trả lời
Giữ logic chatbot tách biệt khỏi UI
Cho phép mở rộng dễ hơn later:
thêm mô hình trả lời mới
thêm processing history
mở rộng API nếu cần
Khác biệt khi bật / không bật backend Python
Khi bật VITE_USE_BACKEND=true
Frontend sẽ:

Chạy findAnswer(...) bằng local intent matching từ src/data/kienThuc.json
Nếu khớp intent cụ thể → trả câu local ngay
Nếu không khớp (intent là fallback) → gọi backend Python /api/chat
Nếu backend trả được câu → dùng câu đó
Nếu backend không trả được (lỗi / timeout / offline) → tiếp tục fallback Gemini AI nếu có VITE_GEMINI_API_KEY
Nếu Gemini cũng không trả được → trả fallback mặc định
Khi không bật backend
Frontend sẽ:

Chạy local intent matching
Nếu khớp intent → trả ngay
Nếu không khớp → bỏ qua backend, thử trực tiếp với Gemini AI nếu có API key
Nếu không có Gemini hoặc Gemini lỗi → trả fallback mặc định
Nói ngắn gọn
VITE_USE_BACKEND=true -> bật “lớp backend Python” cho fallback chatbot
VITE_USE_BACKEND=false hoặc không cấu hình -> không gọi Python backend
Frontend vẫn hoạt động được mà không cần backend, vì nó đã có local knowledge base
Backend chỉ tham gia khi local matching không đủ và USE_BACKEND được bật