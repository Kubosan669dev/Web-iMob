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
