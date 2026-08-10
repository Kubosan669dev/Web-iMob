# Hướng dẫn đưa dự án iMob lên Render.com

Tài liệu này viết cho người **chưa deploy bao giờ**. Làm lần lượt từ trên xuống,
không bỏ bước.

---

## 1. Bức tranh tổng thể

Dự án có **2 phần chạy độc lập**, Render sẽ dựng thành 2 dịch vụ riêng:

| # | Dịch vụ trên Render | Là gì | Nguồn | Giá |
|---|---|---|---|---|
| 1 | `imob-web` | Website React (Vite build ra file tĩnh) | thư mục gốc | Miễn phí, **không bao giờ ngủ** |
| 2 | `imob-chatbot-api` | API chatbot Python (FastAPI + TF-IDF) | `chatbot-python/` | Miễn phí, **ngủ sau 15 phút** |

Website gọi sang API. Cả hai được khai báo sẵn trong [`render.yaml`](render.yaml)
nên bạn **không phải điền tay** từng ô trên trang Render.

### Chatbot trả lời theo 3 tầng

Khách hỏi → website thử lần lượt:

1. **Kho kiến thức trong trình duyệt** (`src/data/kienThuc.json`) — nhanh nhất, 0 đồng.
2. **API Python** (TF-IDF, `chatbot-python/`) — nếu bước 1 không khớp *và* bật `VITE_USE_BACKEND=true`.
3. **Google Gemini** — nếu bước 2 cũng không xong *và* có `VITE_GEMINI_API_KEY`.
4. Vẫn không được thì trả câu mặc định "mời liên hệ hotline".

Nghĩa là **website vẫn chạy tốt kể cả khi API Python chết hoặc đang ngủ**. Đây là
điều tốt: không có điểm chết duy nhất.

---

## 2. Chuẩn bị (làm 1 lần)

1. Có tài khoản GitHub — repo đã sẵn: `https://github.com/Kubosan669dev/Web-iMob`
2. Tạo tài khoản Render tại <https://render.com> → chọn **Sign up with GitHub**
   (đăng nhập bằng GitHub luôn cho tiện, Render sẽ tự thấy repo).
3. Đẩy toàn bộ thay đổi mới nhất lên GitHub:

```bash
git add -A
git commit -m "Chuan bi deploy len Render: render.yaml, CORS, phien rieng cho tung khach"
git push origin main
```

> Render chỉ đọc code **trên GitHub**, không đọc code ở máy bạn. Chưa push thì
> Render không thấy gì cả.

---

## 3. Deploy bằng Blueprint (cách nhanh nhất)

1. Vào <https://dashboard.render.com> → bấm **New +** (góc trên phải) → **Blueprint**.
2. Chọn repo **Web-iMob**. Render tự tìm thấy file `render.yaml`.
3. Render hiện danh sách 2 dịch vụ nó sắp tạo. Nó sẽ **hỏi giá trị** cho biến
   `VITE_GEMINI_API_KEY`:
   - Có khóa Gemini → dán vào.
   - Chưa có → **để trống cũng được**, chatbot vẫn chạy bằng kho kiến thức.
4. Bấm **Apply**.

Lần đầu build mất khoảng **5–10 phút** (phần Python phải cài `scikit-learn`, khá
nặng). Các lần sau nhanh hơn nhiều.

Xong bạn sẽ có 2 địa chỉ, dạng:

- Website: `https://imob-web.onrender.com`
- API: `https://imob-chatbot-api.onrender.com`

---

## 4. Kiểm tra sau khi deploy

Làm đủ 4 bước, đừng bỏ bước nào:

1. **API còn sống?** Mở `https://imob-chatbot-api.onrender.com/health`
   → phải thấy `{"status":"ok","so_phien":0}`.
   (Lần đầu có thể chờ ~40 giây vì service đang ngủ — bình thường.)

2. **Thử API trực tiếp?** Mở `https://imob-chatbot-api.onrender.com/docs`
   → trang thử API tự sinh, bấm `POST /api/chat` → **Try it out** → gõ câu hỏi.

3. **Website lên chưa?** Mở `https://imob-web.onrender.com`.

4. **React Router có chạy không?** — bước hay bị quên nhất.
   Gõ **thẳng** vào thanh địa chỉ: `https://imob-web.onrender.com/zalo-miniapp`
   → phải ra trang Zalo MiniApp, **không được ra 404**.
   Nếu ra 404, xem mục Xử lý sự cố bên dưới.

5. **Chatbot có gọi được API không?** Mở website → bấm biểu tượng chat → nhấn
   `F12` mở tab **Network** → gõ một câu hỏi lạ (không có trong kho kiến thức),
   xem có request tới `/api/chat` và trả về mã `200` không.

---

## 5. Những điều cần biết về gói miễn phí

**API Python sẽ "ngủ" sau 15 phút không ai dùng.** Khách đầu tiên vào sau đó
phải chờ **30–50 giây** để service thức dậy. Website đã xử lý sẵn: chờ tối đa
20 giây rồi bỏ qua, chuyển sang Gemini hoặc câu trả lời mặc định — khách **không
bao giờ bị treo màn hình**.

Cách khắc phục nếu thấy phiền:

- Nâng API lên gói trả phí (~7 USD/tháng) → không ngủ nữa.
- Hoặc chấp nhận: kho kiến thức trong trình duyệt vốn đã trả lời được đa số câu.

**Website tĩnh (`imob-web`) thì không ngủ** — nó nằm trên CDN, luôn vào được ngay.

---

## 6. Bảo mật — đọc kỹ phần này

**Mọi biến `VITE_*` đều bị nhúng thẳng vào file JavaScript của website.** Bất kỳ
ai bấm F12 xem mã nguồn đều đọc được, kể cả `VITE_GEMINI_API_KEY`.

Việc cần làm với khóa Gemini:

- Vào <https://aistudio.google.com/> → giới hạn khóa chỉ dùng được từ tên miền
  của bạn (HTTP referrer restriction).
- Đặt hạn mức (quota) để nếu bị lạm dụng cũng không phát sinh chi phí lớn.
- Đừng dùng chung khóa này với dự án khác.

**Siết CORS khi đã có tên miền chính thức.** Hiện `ALLOWED_ORIGINS` đang để `*`
(cho mọi trang web gọi API). Khi đã ổn định:

Render → dịch vụ `imob-chatbot-api` → **Environment** → sửa `ALLOWED_ORIGINS`:

```
https://imob-web.onrender.com,https://imob.vn
```

---

## 7. Cập nhật code sau này

Chỉ cần push lên GitHub, Render **tự deploy lại**:

```bash
git add -A
git commit -m "Mo ta thay doi"
git push origin main
```

`render.yaml` đã cấu hình `buildFilter` khôn ngoan:

- Sửa file trong `chatbot-python/` → chỉ build lại API.
- Sửa giao diện web → chỉ build lại website (khỏi chờ cài lại `scikit-learn`).

---

## 8. Xử lý sự cố

| Hiện tượng | Nguyên nhân | Cách sửa |
|---|---|---|
| Vào `/zalo-miniapp` ra **404** | Thiếu luật SPA rewrite | Render → `imob-web` → **Redirects/Rewrites** → thêm: Source `/*`, Destination `/index.html`, Action **Rewrite** |
| Console báo lỗi **CORS** | API chưa cho phép tên miền web | Sửa `ALLOWED_ORIGINS` (mục 6), hoặc tạm để `*` |
| Build Python lỗi **"Python version not found"** | Bản Python đã ghim không có trên Render | Render → `imob-chatbot-api` → **Environment** → sửa `PYTHON_VERSION` sang `3.13.2`, hoặc **xóa hẳn biến này** để Render dùng bản mặc định |
| Build web lỗi ở **`npm ci`** | `package-lock.json` lệch với `package.json` | Chạy ở máy: `npm install` → commit lại `package-lock.json` → push |
| Chatbot **không gọi API**, luôn trả lời mặc định | Chưa bật backend hoặc sai URL | Render → `imob-web` → **Environment**: kiểm tra `VITE_USE_BACKEND=true` và `VITE_API_URL` → sửa xong phải bấm **Manual Deploy → Clear build cache & deploy** (biến `VITE_*` chỉ có tác dụng lúc build) |
| API trả lời **rất chậm lần đầu** | Service đang ngủ (gói free) | Bình thường, xem mục 5 |

**Xem log để biết lỗi thật:** Render → chọn dịch vụ → tab **Logs**. Đây là nơi
đầu tiên cần nhìn khi có sự cố, đừng đoán mò.

---

## 9. Chạy thử ở máy trước khi deploy

Nên làm để chắc chắn mọi thứ ổn:

```bash
# Cửa sổ 1 — API Python
cd chatbot-python
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000

# Cửa sổ 2 — website
npm install
npm run dev
```

Tạo file `.env` ở thư mục gốc (chép từ `.env.example`) với nội dung:

```
VITE_USE_BACKEND=true
```

Mở <http://localhost:5173> và thử chat. Ở máy thì không cần `VITE_API_URL`:
`vite.config.js` đã chuyển tiếp `/api/*` sang cổng 8000 giúp rồi.

Kiểm tra bản build thật (giống hệt bản chạy trên Render):

```bash
npm run build
npm run preview
```
