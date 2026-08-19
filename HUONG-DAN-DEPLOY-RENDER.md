# Hướng dẫn đưa dự án iMob lên Render.com

Tài liệu này viết cho người **chưa deploy bao giờ**. Làm lần lượt từ trên xuống,
không bỏ bước.

> **Nếu bạn đưa website sang Vercel** thì đọc
> [HUONG-DAN-DEPLOY-VERCEL.md](HUONG-DAN-DEPLOY-VERCEL.md) thay cho tài liệu này.
> Khi đó Render chỉ còn giữ **API Python + database** — phần đó vẫn theo đúng
> tài liệu này, chỉ bỏ qua dịch vụ `imob-web`.

---

## 1. Bức tranh tổng thể

Dự án có **3 phần**, Render sẽ dựng cả 3:

| # | Dịch vụ trên Render | Là gì | Nguồn | Giá |
|---|---|---|---|---|
| 1 | `imob-web` | Website React (Vite build ra file tĩnh) | thư mục gốc | Miễn phí, **không bao giờ ngủ** |
| 2 | `imob-chatbot-api` | API Python: chatbot + CMS + nhận liên hệ | `chatbot-python/` | Miễn phí, **ngủ sau 15 phút** |
| 3 | `imob-db` | PostgreSQL: nội dung CMS + khách để lại liên hệ | — | Miễn phí, **có thời hạn** |

Website gọi sang API. Cả ba được khai báo sẵn trong [`render.yaml`](render.yaml)
nên bạn **không phải điền tay** từng ô trên trang Render.

### Nội dung website lấy từ đâu?

Trang `/admin` cho bạn sửa **thông tin công ty** và **trang pháp lý** mà không
cần đụng vào code. Nội dung lưu trong database, nhưng website **không phụ thuộc
hoàn toàn** vào đó:

```
company.json trong bundle  ──►  hiện NGAY (luôn có, kể cả khi API chết)
                                        │
                          API sống? ────┴──►  thay bằng bản bạn sửa trong /admin
```

Nghĩa là **database chết hay backend ngủ thì website vẫn hiện đủ nội dung**, chỉ
là bản trong bundle (lần build gần nhất). Đây là điều quan trọng nhất của thiết
kế này — xem `src/context/NoiDungContext.jsx`.

### Chatbot trả lời theo 3 tầng

Khách hỏi → thử lần lượt:

1. **Kho kiến thức trong trình duyệt** (`src/data/kienThuc.json`) — 0ms, 0 đồng,
   không cần mạng. Đại đa số câu hỏi dừng ở đây.
2. **API Python** (TF-IDF, `chatbot-python/`) — nếu bước 1 không khớp *và* bật
   `VITE_USE_BACKEND=true`.
3. **Google Gemini** — nằm **BÊN TRONG** bước 2, do backend gọi, nếu TF-IDF cũng
   không đủ tự tin. Chỉ chạy khi đã đặt `GEMINI_API_KEY` trên Render.
4. Vẫn không được thì trả câu mặc định "mời liên hệ hotline".

Nghĩa là **website vẫn chạy tốt kể cả khi API Python chết hoặc đang ngủ**. Đây là
điều tốt: không có điểm chết duy nhất.

> ⚠️ **Khoá Gemini đặt ở Render, KHÔNG đặt ở Vercel** (đổi 19/08/2026).
> Trước đây website gọi thẳng Gemini bằng `VITE_GEMINI_API_KEY`. Mọi biến
> `VITE_*` bị nhét **thẳng vào file JavaScript công khai** — ai mở F12 cũng copy
> được khoá rồi tiêu quota của công ty. Mã gọi Gemini phía trình duyệt đã bị gỡ
> hẳn, nên đặt lại biến đó cũng không có tác dụng gì.
>
> **Cách bật:** Render → `imob-chatbot-api` → **Environment** → thêm
> `GEMINI_API_KEY` = khoá lấy ở <https://aistudio.google.com/> → **Save**.
> Service tự khởi động lại (~1 phút), **không cần build lại**.
>
> **Cách kiểm:** mở `https://imob-chatbot-api.onrender.com/health`, xem trường
> `"gemini"` là `"bat"` hay `"tat"`.
>
> Chạy ở máy thì đặt cùng tên biến đó trong `chatbot-python/.env`.

**Đặt khoá vào còn làm bot khắt khe hơn.** Ngưỡng nhận của TF-IDF tự siết lại
(0,18 → 0,35) khi có Gemini đỡ phía sau: câu nào TF-IDF chỉ khớp lờ mờ thì thà
đưa cho Gemini trả lời có căn cứ, còn hơn nhận bừa. Đo thật ngày 19/08/2026 cho
thấy với ngưỡng cũ, câu *"cho tôi công thức nấu phở"* đạt 0,226 và **vẫn được bot
nhận rồi trả lời**. Chi tiết trong `chatbot-python/imob_bot/bot.py`.

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
3. Render hiện danh sách dịch vụ nó sắp tạo, và **hỏi giá trị** cho mấy biến sau:

   | Biến | Điền gì |
   |---|---|
   | `ADMIN_USER` | Tên đăng nhập trang quản trị, ví dụ `admin` |
   | `ADMIN_PASSWORD` | Mật khẩu, **tối thiểu 8 ký tự**. Đặt mật khẩu mạnh — đây là chìa khoá sửa nội dung website |
   | `VITE_GEMINI_API_KEY` | Có khóa Gemini thì dán vào; chưa có thì **để trống cũng được**, chatbot vẫn chạy bằng kho kiến thức |

   `JWT_SECRET` thì Render **tự sinh**, bạn không phải làm gì.

4. Bấm **Apply**.

---

## 3b. ⚠️ BẮT BUỘC: nối hai dịch vụ lại với nhau

**Đừng bỏ qua bước này.** Deploy xong mà không làm thì trang chủ vẫn hiện bình
thường (nhờ nội dung có sẵn trong bundle) nhưng **`/admin` sẽ báo lỗi**, form
liên hệ không gửi được, và chatbot không gọi được backend.

Lý do: Render cấp tên miền **có hậu tố ngẫu nhiên** khi tên đã bị người khác
dùng — `imob-web` có thể thành `imob-web-fqhq`. Không đoán trước được lúc viết
`render.yaml`, nên phải nối tay một lần.

**Bước 1 — lấy 2 địa chỉ.** Trên dashboard, bấm vào từng dịch vụ, copy địa chỉ
ở đầu trang:

- Website: `https://imob-web-____.onrender.com`
- API: `https://imob-chatbot-api-____.onrender.com`

**Bước 2 — cho API biết website nào được phép gọi.**
Render → dịch vụ **API** → **Environment** → `ALLOWED_ORIGINS` = địa chỉ
**website**. Lưu xong service tự khởi động lại, không cần build lại.

**Bước 3 — cho website biết API ở đâu.**
Render → dịch vụ **website** → **Environment** → `VITE_API_URL` = địa chỉ
**API**.

**Bước 4 — build lại website.** Bắt buộc, vì mọi biến `VITE_*` được nhúng vào
file JavaScript **lúc build**, sửa xong mà không build lại thì không ăn:

Render → dịch vụ website → **Manual Deploy** → **Clear build cache & deploy**

**Bước 5 — kiểm tra.** Mở `https://<địa-chỉ-API>/health`, phải thấy
`{"status":"ok", ... "database":"ok"}`. Rồi mở `/admin` của website và đăng nhập.

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

6. **Database đã kết nối chưa?** Mở `https://imob-chatbot-api.onrender.com/health`
   → trường `database` phải là `"ok"`.
   - `"loi"` = có đặt `DATABASE_URL` nhưng kết nối hỏng → xem tab **Logs**.
   - `"tat"` = chưa đặt `DATABASE_URL`.

7. **Trang quản trị chạy chưa?** Mở `https://imob-web.onrender.com/admin`
   → đăng nhập bằng `ADMIN_USER` / `ADMIN_PASSWORD` vừa đặt → thử đổi số điện
   thoại → bấm **Lưu** → mở lại trang chủ, số ở Navbar/Footer/Liên hệ phải đổi
   theo.

8. **Form liên hệ có lưu không?** Gửi thử một tin ở phần Liên hệ trang chủ, rồi
   vào `/admin` → tab **Liên hệ** xem có thấy không.

---

## 4b. Dùng trang quản trị

Vào `https://imob-web.onrender.com/admin` (không có trong menu — phải gõ thẳng).

| Tab | Sửa được gì |
|---|---|
| **Thông tin công ty** | Tên, khẩu hiệu, SĐT, email, địa chỉ, giờ làm việc. Chatbot **cũng dùng chung** các thông tin này |
| **Trang pháp lý** | Chính sách bảo mật & Điều khoản dịch vụ: tiêu đề, mở đầu, và từng mục |
| **Liên hệ** | Xem khách để lại thông tin (từ form **và** từ chatbot), tick khi đã gọi lại |

Vài điều nên biết:

- Sửa xong bấm **Lưu** là ăn ngay, **không cần build lại, không cần push GitHub**.
  Khách đang mở sẵn trang phải tải lại (F5) mới thấy.
- Nút **Xuất JSON** tải toàn bộ nội dung về máy. **Nên bấm định kỳ** — gói
  database miễn phí có thời hạn, mất database mà có file này thì chép đè vào
  `src/data/` là khôi phục được ngay.
- Ở tab Trang pháp lý, ô "Gạch đầu dòng" và "Đoạn văn" là **mỗi dòng một ý**.
  Gõ thừa dòng trống không sao, lúc lưu tự bỏ.
- Đăng nhập hết hạn sau 8 giờ, và đóng tab là mất phiên.

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

**Kiểm tra `ALLOWED_ORIGINS` ngay sau khi deploy.** `render.yaml` đặt sẵn
`https://imob-web.onrender.com`. Nếu Render cấp tên miền khác (vd tên đã bị
người khác dùng nên thành `imob-web-a1b2`), phải sửa cho khớp, không thì trình
duyệt chặn hết và chatbot/form liên hệ/trang admin đều không chạy:

Render → dịch vụ `imob-chatbot-api` → **Environment** → `ALLOWED_ORIGINS`:

```
https://ten-mien-that-cua-ban.onrender.com,https://imob.vn
```

**Về trang quản trị:**

- Mật khẩu lưu dạng **băm bcrypt**, database bị lộ cũng không suy ngược ra được.
- Sai mật khẩu **5 lần** là khoá IP đó **15 phút** — chặn dò mật khẩu tự động.
- `ADMIN_PASSWORD` chỉ dùng để **tạo** tài khoản lần đầu. Sửa biến đó sau này
  **không đổi được mật khẩu** (code cố ý không ghi đè). Muốn đổi mật khẩu thì
  xoá dòng trong bảng `nguoi_dung` rồi khởi động lại service.
- `/admin` bị `robots.txt` chặn, nhưng **giấu đường dẫn không phải bảo mật** —
  thứ bảo vệ thật là đăng nhập. Đừng đặt mật khẩu yếu vì nghĩ "không ai biết
  đường dẫn".
- Danh sách **Liên hệ là dữ liệu cá nhân** của khách (Nghị định 13/2023). Chỉ
  dùng để liên hệ lại, đừng chia sẻ ra ngoài, và xoá khi không còn cần.

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
| `/admin` báo **"Không kết nối được tới máy chủ"** | API ngủ, hoặc sai `VITE_API_URL`, hoặc CORS chặn | Chờ 1 phút thử lại; vẫn hỏng thì mở `/health` của API xem sống không, và kiểm tra `ALLOWED_ORIGINS` |
| `/health` báo `"database":"loi"` | Sai `DATABASE_URL` hoặc database chưa sẵn sàng | Render → tab **Logs** của API xem lỗi thật. Kiểm tra database `imob-db` còn sống không (gói free có hạn) |
| Đăng nhập báo **"Sai quá nhiều lần"** | Đã sai 5 lần | Chờ 15 phút, hoặc vào Render bấm **Manual Deploy** để khởi động lại (bộ đếm nằm trong bộ nhớ nên restart là xoá) |
| Mở API ra thấy **502 Bad Gateway** | Service chết hẳn hoặc đang khởi động | 502 = ứng dụng KHÔNG chạy, nên không đọc được lỗi qua HTTP. **Bắt buộc xem Render → dịch vụ → tab Logs** — dòng đỏ cuối cùng nói lý do. Hay gặp: build hỏng (thiếu thư viện, sai `PYTHON_VERSION`), hoặc service vừa deploy chưa xong (chờ 1–2 phút) |
| Log nói `CMS bị TẮT do cấu hình sai` | `JWT_SECRET` thiếu hoặc ngắn hơn 32 ký tự | Render → API → **Environment** → đặt `JWT_SECRET` bằng chuỗi ngẫu nhiên **từ 32 ký tự**. Lưu ý: đây **không** làm sập API — chatbot vẫn chạy, chỉ trang quản trị là tắt |
| Sửa trong `/admin` xong mà **web không đổi** | Trang đang mở dùng bản cũ | Nhấn **F5** tải lại. Vẫn không đổi thì mở `/api/noi-dung` của API xem đã lưu chưa |
| **Mất hết nội dung** đã sửa | Database free hết hạn, bị Render xoá | Website vẫn chạy bằng bản trong bundle. Khôi phục: lấy file đã **Xuất JSON**, chép nội dung vào `src/data/company.json` và `legalPages.json`, commit, push |

**Xem log để biết lỗi thật:** Render → chọn dịch vụ → tab **Logs**. Đây là nơi
đầu tiên cần nhìn khi có sự cố, đừng đoán mò.

---

## 9. Chạy thử ở máy trước khi deploy

Nên làm để chắc chắn mọi thứ ổn.

**Bước 1 — cấu hình backend.** File `chatbot-python/.env` đã được tạo sẵn (không
lên GitHub). Kiểm tra `DATABASE_URL` trỏ đúng database ở máy bạn:

```
DATABASE_URL=postgresql://postgres:<mật khẩu>@localhost:5432/imob_cms
```

> ⚠️ Ở máy này dùng database **`imob_cms`**, KHÔNG phải `imob`. Database `imob`
> đã có sẵn một hệ backend Java/Spring cũ (Flyway, 15/07/2026) — đã bỏ không
> dùng nhưng dữ liệu còn nguyên nên để riêng cho khỏi lẫn.

Chưa có database thì tạo:

```bash
"/c/Program Files/PostgreSQL/16/bin/psql" -U postgres -c "CREATE DATABASE imob_cms"
```

Bảng và dữ liệu ban đầu **tự tạo** lúc backend khởi động, không phải chạy script.

**Bước 2 — chạy:**

```bash
# Cửa sổ 1 — API Python
cd chatbot-python
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000

# Cửa sổ 2 — website
npm install
npm run dev
```

Ở máy **không cần** `VITE_API_URL`: `vite.config.js` đã chuyển tiếp `/api/*`
sang cổng 8000 giúp rồi. Muốn chatbot dùng cả backend Python thì thêm
`VITE_USE_BACKEND=true` vào file `.env` ở thư mục gốc.

**Bước 3 — thử:**

- <http://localhost:5173> — trang chủ, thử chat và gửi form liên hệ
- <http://localhost:5173/admin> — đăng nhập bằng `ADMIN_USER` / `ADMIN_PASSWORD`
  trong `chatbot-python/.env`
- <http://localhost:8000/docs> — trang thử API tự sinh

**Phép thử quan trọng nhất:** tắt backend (Ctrl+C ở cửa sổ 1) rồi tải lại trang
chủ. Website **vẫn phải hiện đầy đủ** nội dung (lấy từ bundle). Nếu trang trống
thì cơ chế dự phòng đã hỏng.

Kiểm tra bản build thật (giống hệt bản chạy trên Render):

```bash
npm run build
npm run preview
```

Kiểm tra bản build thật (giống hệt bản chạy trên Render):

```bash
npm run build
npm run preview
```
