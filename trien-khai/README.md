# Triển khai website iMob lên máy chủ thuê

Bộ này đưa dự án từ Render (bản demo, ngủ sau 15 phút) sang một máy chủ thuê
chạy thật.

## Sơ đồ

```
Internet
   │
   ├─ 80/443 ──► nginx ─┬─ /            ──► /var/www/imob/dist   (web tĩnh)
   │                    ├─ /api/*       ──► 127.0.0.1:8001       (uvicorn)
   │                    └─ /health      ──► 127.0.0.1:8001
   │
   └─ 22 ─────► SSH (chỉ bằng khoá, không mật khẩu)

Trong máy, KHÔNG ra internet:
   uvicorn 127.0.0.1:8001  ·  PostgreSQL 127.0.0.1:5432
```

Chỉ 3 cổng mở ra ngoài. API và cơ sở dữ liệu **không** lộ ra internet — mọi
lời gọi đều phải đi qua nginx, nơi có nhật ký truy cập và giới hạn tần suất.

## Điểm được lợi lớn nhất khi bỏ Render

Trên Render, web và API là **hai tên miền khác nhau**, nên phải khai báo
`ALLOWED_ORIGINS` và `VITE_API_URL` khớp nhau — sai một chữ là chatbot, form
liên hệ và trang `/admin` chết cùng lúc. `render.yaml` phải ghi hẳn hai đoạn
cảnh báo dài về cái bẫy này.

Trên một máy chủ, web và API **chung một tên miền**. Nên:

- `VITE_API_URL` để **trống** → mã nguồn tự gọi `/api/*` (`src/utils/constants.js:83`)
- **Không còn CORS** — cả lớp lỗi đó biến mất
- Đổi tên miền không phải build lại

## Các bước

### 1. Chuẩn bị máy chủ

Ubuntu 22.04 hoặc 24.04, tối thiểu 2 GB RAM (scikit-learn ngốn bộ nhớ lúc nạp).

Đưa khoá SSH của anh lên máy chủ:

```powershell
type $HOME\.ssh\id_ed25519.pub | ssh <tài khoản>@<IP> "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

Thử `ssh <tài khoản>@<IP>` — phải vào thẳng, không hỏi mật khẩu.

> Sai quyền thư mục thì SSH **lặng lẽ** bỏ qua khoá rồi quay lại hỏi mật khẩu,
> không báo lỗi gì. Hai lệnh `chmod` ở trên là bắt buộc.

### 2. Cho máy chủ quyền đọc kho mã

Trên máy chủ:

```bash
ssh-keygen -t ed25519 -C "server-imob" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
```

Dán vào GitHub → repo `Web-iMob` → **Settings → Deploy keys → Add deploy key**.
**KHÔNG tích "Allow write access".**

> Deploy key chỉ đọc được **đúng một** kho mã. Nếu dùng khoá tài khoản cá nhân
> thì máy chủ đó đọc được *toàn bộ* kho mã của công ty — máy bị chiếm là mất
> mã nguồn mọi dự án.

### 3. Cài đặt

```bash
# Trên máy chủ, sửa 2 biến ở đầu file trước khi chạy
nano cai-dat-lan-dau.sh     # KHO_MA và TEN_MIEN
sudo ./cai-dat-lan-dau.sh
```

Script tự làm: cài gói, tạo tài khoản dịch vụ, bật tường lửa, tạo cơ sở dữ
liệu, sinh `.env`, cài dịch vụ và cấu hình nginx.

**Không có mật khẩu nào nằm trong script.** Mật khẩu cơ sở dữ liệu và
`JWT_SECRET` được sinh ngẫu nhiên ngay trên máy chủ, ghi thẳng vào `.env`
quyền 600 — không đi qua máy ai, không nằm trong kho mã.

### 4. Ba việc làm tay

```bash
sudo nano /var/www/imob/.env                      # điền ADMIN_USER, ADMIN_PASSWORD
bash /var/www/imob/trien-khai/trien-khai.sh       # lần triển khai đầu
sudo certbot --nginx -d ten-mien.vn -d www.ten-mien.vn   # bật HTTPS
```

### 5. Từ nay, mỗi lần đẩy code

```powershell
git push
ssh <tài khoản>@<IP> "bash /var/www/imob/trien-khai/trien-khai.sh"
```

## Phân quyền — ba vai, cố ý tách rời

| Tài khoản | Làm được gì | Không làm được gì |
|---|---|---|
| `imob` (dịch vụ) | Chạy API, **đọc** mã nguồn, đọc `.env` | Đăng nhập, sửa mã nguồn |
| Người triển khai | Đẩy mã, dựng lại, khởi động lại dịch vụ | Đọc `.env`, quyền root |
| `root` | Mọi thứ | — (chỉ dùng khi cài đặt) |

Tài khoản chạy dịch vụ **không sửa được mã nguồn của chính nó**. Người triển
khai **không đọc được mật khẩu**. Đây là lý do có tới hai tài khoản thay vì một.

## Trả lời câu "dev gắn những gì lên server"

Hai lệnh:

```bash
ssh <IP> "cd /var/www/imob && git log -1 --oneline"    # đang chạy bản nào
ssh <IP> "cd /var/www/imob && git status --short"      # có gì lạ không
```

Lệnh thứ hai ra **kết quả rỗng** nghĩa là trên máy chủ không có gì ngoài mã
nguồn đã được duyệt. Đó là điều kiểm chứng được, không phụ thuộc vào việc tin
hay không tin ai.

Lý do luôn rỗng: `trien-khai.sh` dùng `git reset --hard` chứ không dùng
`git pull`, nên mọi sửa tay trực tiếp trên máy chủ đều bị xoá ở lần triển khai
kế tiếp.

## Trần tài nguyên

`imob-api.service` đặt `MemoryMax=900M`, `CPUQuota=80%`. Dịch vụ vượt trần thì
**chỉ chính nó** bị dừng và khởi động lại, các dịch vụ khác trên máy vẫn sống.

Đây là câu trả lời cho *"dev thấy server còn thừa bộ nhớ, cài thêm cái khác gây
sập hệ thống"*: không quản bằng cách dặn dò, mà làm cho nó **không sập được**.

Xem thực tế ai đang ăn bao nhiêu:

```bash
systemd-cgtop
```

## Khi có sự cố

```bash
sudo journalctl -u imob-api -n 50 --no-pager   # nhật ký API
sudo journalctl -u imob-api -f                 # theo dõi trực tiếp
sudo tail -f /var/log/nginx/error.log          # lỗi nginx
sudo nginx -t                                  # kiểm tra cú pháp nginx
curl -s localhost/health                       # API còn sống không
systemctl status imob-api
```

`curl localhost/health` trả về **HTML** thay vì JSON nghĩa là nginx đang coi
`/health` là đường dẫn của website — thiếu khối `location = /health`.

## Các bẫy đã tính trước

| Bẫy | Đã xử lý ở đâu |
|---|---|
| Script Windows chạy trên Linux báo `bad interpreter` | `.gitattributes` ép LF |
| uvicorn nghe `0.0.0.0` làm hở cổng 8001 ra internet | `imob-api.service` dùng `127.0.0.1` |
| Khoá IP khi dò mật khẩu thấy mọi khách đều là `127.0.0.1` | nginx gửi `X-Forwarded-For` |
| `git pull` vướng xung đột, để máy chủ nửa vời | `git reset --hard` |
| Tự khoá mình ra ngoài khi tắt mật khẩu SSH | Xem cảnh báo mục 1 |
| `.env` mất khi clone lại | `git clean` chừa `.env` ra |

## Chưa làm — cố ý

- **Sao lưu cơ sở dữ liệu.** Cần làm sớm, nhưng phải quyết định lưu ở đâu
  (máy khác? kho lưu trữ đám mây?) trước khi viết.
- **CI/CD tự triển khai khi push.** Làm sau, khi quy trình tay đã chạy ổn.
- **Chuyển dữ liệu từ Render sang.** Cần `pg_dump` từ Render trước khi gói
  free hết hạn.
