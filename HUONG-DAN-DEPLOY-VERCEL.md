# Hướng dẫn đưa website iMob lên Vercel

Tài liệu này viết cho người **chưa deploy bao giờ**. Làm lần lượt từ trên xuống,
không bỏ bước. Bước 5 là bước hay quên nhất và cũng là bước làm hỏng nhiều thứ
nhất nếu bỏ qua.

---

## 1. Bức tranh tổng thể — cái gì nằm ở đâu

Dự án có 3 phần. **Vercel chỉ nhận phần 1.**

| # | Phần | Deploy ở đâu | Vì sao |
|---|---|---|---|
| 1 | Website React (Vite) | **Vercel** | File tĩnh, đúng thứ Vercel làm tốt nhất |
| 2 | API Python (chatbot + CMS + nhận liên hệ) | **Vẫn ở Render** | Xem mục 2 |
| 3 | PostgreSQL | **Vẫn ở chỗ cũ** | API đang trỏ vào, không đụng tới |

Nghĩa là bạn **không xoá gì trên Render cả**, chỉ chuyển riêng phần website sang
Vercel rồi bảo API "cho phép tên miền mới này gọi sang".

```
   Trình duyệt của khách
          │
          ├──────────────►  Vercel      : website (HTML, CSS, JS, ảnh)
          │
          └──────────────►  Render      : API Python  ──►  PostgreSQL
                                          (chat, đăng nhập admin,
                                           lưu liên hệ, nội dung CMS)
```

### Website có chết không nếu API chết?

Không. Nội dung công ty / hero / giới thiệu / trang pháp lý đều **có sẵn bản
JSON đóng gói trong bundle**, hiện ra ngay lập tức; API sống thì mới thay bằng
bản bạn sửa trong `/admin`. Chatbot cũng có kho kiến thức chạy thẳng trong trình
duyệt. Xem `src/context/NoiDungContext.jsx`.

Cái **sẽ** hỏng khi API chết: đăng nhập `/admin`, lưu nội dung, và form liên hệ
(form sẽ báo lỗi thật kèm hotline chứ không báo thành công giả).

---

## 2. Vì sao không đưa luôn API Python lên Vercel

Đây là câu hỏi hợp lý, và câu trả lời là **kỹ thuật không cho**, chứ không phải
ngại làm:

- **Quá nặng.** Vercel giới hạn mỗi hàm serverless 250 MB sau khi giải nén.
  Riêng `scikit-learn` + `numpy` + `scipy` đã sát mức đó, chưa tính `psycopg`,
  `bcrypt`, `fastapi`.
- **Serverless không giữ được trạng thái.** API này lúc khởi động thì huấn luyện
  mô hình TF-IDF, mở connection pool tới database, và giữ phiên chat riêng cho
  từng khách trong bộ nhớ. Trên Vercel mỗi request có thể rơi vào một máy khác
  vừa khởi động lại từ đầu — huấn luyện lại mô hình mỗi lần gọi, và mỗi máy lại
  mở thêm 1–4 kết nối database. PostgreSQL gói free giới hạn số kết nối rất
  chặt, sẽ đứt.

Render chạy nó như một tiến trình sống liên tục, đúng với cách nó được viết.
**Giữ nguyên ở đó là lựa chọn đúng, không phải giải pháp tạm.**

Đổi lại: API trên gói free của Render vẫn **ngủ sau 15 phút** không ai dùng.
Chuyển website sang Vercel không sửa được chuyện này. Lần đầu trong ngày bấm
đăng nhập `/admin` hoặc gửi form vẫn phải chờ 30–50 giây.

---

## 3. Một chuyện cần biết trước về gói miễn phí của Vercel

Gói **Hobby** của Vercel theo điều khoản sử dụng là dành cho **dự án cá nhân,
phi thương mại**. Website giới thiệu của một công ty đang kinh doanh thì thuộc
diện thương mại, đúng ra phải dùng gói **Pro** (20 USD/người/tháng).

Trên thực tế Vercel hiếm khi soi, nhưng nếu bị đánh dấu thì họ có quyền tạm
ngưng dự án. Render không có ràng buộc này với static site — gói free của họ
dùng cho web thương mại vẫn hợp lệ.

Nói ra để bạn quyết định, không phải để cản. Nếu chỉ cần chỗ trình diễn thì
Hobby dùng thoải mái.

---

## 4. Chuẩn bị

Code phải nằm trên GitHub thì Vercel mới thấy. Repo đã sẵn:
`https://github.com/Kubosan669dev/Web-iMob`

Cần chuẩn bị sẵn **địa chỉ API trên Render**. Vào Render → mở dịch vụ
`imob-chatbot-api` → copy địa chỉ ở đầu trang, dạng:

```
https://imob-chatbot-api-xxxx.onrender.com
```

Kiểm tra nó còn sống: mở `https://…onrender.com/health` trên trình duyệt. Phải
thấy JSON, và trường `database` phải là `ok`. (Lần đầu có thể chờ 30–50 giây vì
API đang ngủ.)

---

## 5. Tạo project trên Vercel

1. Vào <https://vercel.com> → **Sign Up** → chọn **Continue with GitHub**.
2. Ở màn hình chính bấm **Add New…** → **Project**.
3. Tìm repo `Web-iMob` → bấm **Import**.
   Lần đầu Vercel sẽ xin quyền đọc repo, bấm đồng ý.
4. Màn hình cấu hình hiện ra. **Không cần sửa gì** ở phần Build — repo đã có sẵn
   file [`vercel.json`](vercel.json) khai báo đủ:

   | Mục | Giá trị | Ai điền |
   |---|---|---|
   | Framework Preset | Vite | `vercel.json` |
   | Build Command | `npm run build` | `vercel.json` |
   | Output Directory | `dist` | `vercel.json` |
   | SPA rewrite | mọi đường dẫn → `index.html` | `vercel.json` |

   > **SPA rewrite để làm gì:** website chỉ có đúng một file `index.html`. Khách
   > gõ thẳng `/admin` thì máy chủ đi tìm file tên "admin", không có → 404. Luật
   > rewrite bảo Vercel: đường dẫn nào không phải file thật thì cứ trả
   > `index.html`, để React Router tự chọn trang. **Thiếu nó thì mọi trang con
   > đều 404 khi bấm F5** — kể cả `/admin`.

---

## 6. Điền biến môi trường

Vẫn ở màn hình import, mở mục **Environment Variables**. Điền 2 biến bắt buộc:

| Tên biến | Giá trị | Bắt buộc |
|---|---|---|
| `VITE_API_URL` | `https://imob-chatbot-api-xxxx.onrender.com` (địa chỉ bạn copy ở bước 4) | ✅ |
| `VITE_USE_BACKEND` | `true` | ✅ |
| `VITE_GEMINI_API_KEY` | Khoá Gemini, lấy ở <https://aistudio.google.com> | Không |
| `VITE_DEMO_LOGIN` | Xem cảnh báo dưới | Không |

Mỗi biến nhớ tích đủ cả 3 môi trường **Production / Preview / Development**.

> ⚠️ **`VITE_DEMO_LOGIN` — chỉ điền khi đây là bản trình diễn.** Biến này in
> thẳng tên đăng nhập và mật khẩu lên màn hình `/admin`, ai vào cũng đọc được và
> đăng nhập sửa nội dung được. Website thật thì **để trống** — dòng gợi ý tự
> biến mất.

> ⚠️ **Mọi biến `VITE_*` bị nhúng thẳng vào file JavaScript lúc build.** Ai mở
> mã nguồn trang web cũng đọc được. Tuyệt đối không để chuỗi kết nối database,
> `JWT_SECRET`, hay mật khẩu admin ở đây. Những thứ đó chỉ được nằm bên Render.

Xong bấm **Deploy**. Chờ khoảng 1–2 phút.

---

## 7. ⚠️ Bước quan trọng nhất: mở CORS trên Render

Deploy xong Vercel cho bạn một địa chỉ, dạng:

```
https://web-imob.vercel.app
```

**Ngay lúc này website đã hiện ra bình thường, nhưng chatbot, form liên hệ và
trang `/admin` đều KHÔNG chạy.** Lý do: trình duyệt chặn việc trang ở tên miền A
gọi API ở tên miền B, trừ khi API tự khai báo cho phép. API đang chỉ cho phép
tên miền Render cũ.

Sửa như sau:

1. Copy địa chỉ Vercel ở trên.
2. Vào Render → dịch vụ **`imob-chatbot-api`** → tab **Environment**.
3. Tìm biến `ALLOWED_ORIGINS` → sửa giá trị thành địa chỉ Vercel:

   ```
   https://web-imob.vercel.app
   ```

   Muốn giữ luôn cả website cũ trên Render thì ngăn cách bằng dấu phẩy, **không
   có khoảng trắng thừa**:

   ```
   https://web-imob.vercel.app,https://imob-web-xxxx.onrender.com
   ```

4. Bấm **Save Changes**. Render tự khởi động lại dịch vụ (khoảng 1 phút),
   **không phải build lại**.

> **Đừng đặt `ALLOWED_ORIGINS=*`.** Để `*` là cho phép mọi trang web trên đời
> gọi API của bạn, kể cả trang giả mạo dựng giao diện đăng nhập giống hệt
> `/admin`. Backend có ghi log cảnh báo nếu phát hiện `*` khi CMS đang bật.

> **Bản Preview của Vercel sẽ không gọi được API.** Mỗi lần push lên nhánh khác
> `main`, Vercel dựng một bản xem thử ở địa chỉ ngẫu nhiên
> (`web-imob-git-abc-tenban.vercel.app`). Địa chỉ đó không có trong
> `ALLOWED_ORIGINS` nên chatbot/admin sẽ báo lỗi kết nối. Đây là **hành vi đúng**
> — bản xem thử không nên chọc vào database thật. Cần thử thì thêm tay địa chỉ
> đó vào `ALLOWED_ORIGINS` rồi xoá đi sau.

---

## 8. Nạp lại nội dung từ file gốc

Database đang giữ nội dung **cũ** từ đợt trước, và lớp database phủ đè lên bản
JSON mới trong bundle. Nếu không làm bước này, trang chủ sẽ ra một bản pha trộn:
bố cục mới nhưng chữ cũ.

1. Mở `https://web-imob.vercel.app/admin` → đăng nhập.
   (Lần đầu chờ 30–50 giây cho API thức dậy — màn hình có báo.)
2. Nếu từng sửa gì trong admin muốn giữ thì bấm **Xuất JSON** trước.
3. Bấm **Nạp lại từ file gốc** (góc trên bên phải) → xác nhận.
4. Xem lại — chấm vàng sẽ sáng ở đúng những mục sắp bị thay.
5. Bấm **Lưu thay đổi**.
6. Tải lại trang chủ (F5).

Danh sách tin nhắn khách để lại nằm ở bảng khác, **không bị ảnh hưởng**.

---

## 9. Kiểm tra — 6 việc, làm đủ

| # | Việc | Đạt khi |
|---|---|---|
| 1 | Mở trang chủ | Hiện đủ nội dung, không lỗi |
| 2 | Gõ thẳng `https://…vercel.app/zalo-miniapp` rồi **F5** | Ra đúng trang, **không phải 404** |
| 3 | Mở chatbot, hỏi "báo giá" | Có trả lời |
| 4 | Gửi thử form Liên hệ | Báo gửi thành công |
| 5 | Vào `/admin`, đăng nhập | Vào được, thấy tin nhắn vừa gửi ở mục **Tin nhắn** |
| 6 | Mở `/admin` ở tab ẩn danh | Google không lập chỉ mục (đã chặn ở `robots.txt` + thẻ noindex) |

Việc **2** hỏng ⇒ `vercel.json` chưa được đọc.
Việc **3, 4, 5** hỏng ⇒ gần như chắc chắn là CORS ở bước 7, hoặc `VITE_API_URL`
điền sai. Bấm F12 → tab Console, lỗi CORS hiện rõ chữ `CORS` trong đó.

---

## 10. Những chỗ hay sai

**Sửa biến môi trường xong mà không thấy gì đổi.**
Biến `VITE_*` chỉ có tác dụng **lúc build**, không phải lúc chạy. Sửa xong phải:
Vercel → tab **Deployments** → bấm dấu **⋯** ở bản mới nhất → **Redeploy** →
**bỏ tích** ô *Use existing Build Cache* → **Redeploy**.

**Điền `VITE_API_URL` thiếu `https://`.**
Code đã tự vá giúp (`src/utils/constants.js`), điền tên miền trần vẫn chạy. Nhưng
điền `http://` cho một trang `https://` thì trình duyệt chặn — phải là `https`.

**Điền nhầm địa chỉ nội bộ của Render.**
`imob-chatbot-api` (không có `.onrender.com`) là tên miền **nội bộ**, chỉ dùng
được khi hai dịch vụ trên Render gọi nhau. Trình duyệt của khách không phân giải
được. Phải dùng địa chỉ công khai đầy đủ `…onrender.com`.

**Có hai website cùng sống.**
Sau khi Vercel chạy tốt, nên tắt bản trên Render cho khỏi lẫn: Render → dịch vụ
`imob-web` → **Settings** → **Suspend Web Service**. Đừng xoá — `render.yaml`
vẫn khai báo nó, xoá xong lần Blueprint sync sau nó lại mọc lên.

**API vẫn ngủ.** Vercel không chữa được, API nằm ở Render. Muốn hết ngủ thì nâng
dịch vụ đó lên gói trả phí, hoặc chấp nhận chờ ở lần gọi đầu.

---

## 11. Từ giờ về sau

Đẩy code lên nhánh `main` là **cả hai nơi cùng tự deploy**: Vercel dựng lại
website, Render dựng lại API (chỉ khi thư mục `chatbot-python/` có thay đổi).

Sửa nội dung chữ nghĩa thì **không cần deploy** — vào `/admin` sửa rồi bấm Lưu.
Chỉ khi sửa thẳng file JSON trong mã nguồn mới phải push, và sau đó nhớ vào
`/admin` bấm **Nạp lại từ file gốc** một lần, không thì database vẫn giữ bản cũ.
