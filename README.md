# Website iMob (imob.vn)

Bản đồ dự án: cái gì nằm ở đâu, sửa việc gì thì mở file nào. Cập nhật 12/11/2026.

Website chạy thật tại **https://imob.vn** trên một máy chủ CMC. Gồm ba phần:

| Phần | Thư mục | Là gì |
|---|---|---|
| Website | `src/`, `public/`, `index.html` | React + Vite + Tailwind. Build ra thư mục `dist/` |
| API | `chatbot-python/` | Python (FastAPI) + PostgreSQL: trang quản trị, bài viết, tài khoản, form liên hệ, bot cũ |
| Triển khai | `trien-khai/` | Cấu hình nginx, script đưa bản mới lên máy chủ |

Khung chat trên website **không** nằm trong dự án này: đó là khung chat của nền
tảng iMob CMS (https://chatbot.imob.vn), website chỉ chèn vào.

## Thư mục gốc

```
src/              mã website (xem bảng bên dưới)
public/           ảnh, logo, robots.txt — chép nguyên sang dist/ khi build
chatbot-python/   API Python (có README riêng)
trien-khai/       nginx + script triển khai (có README riêng)
trang-demo/       trang tĩnh https://demo.imob.vn (bot Demo + VR360 bảo tàng)
scripts/          script kiểm tra, chạy bằng npm (xem "Lệnh thường dùng")
```

`New folder/` (tài liệu gốc của công ty) bị `.gitignore` chặn, **không bao giờ**
được đẩy lên GitHub. Nên để hẳn ra ngoài thư mục dự án.

## Sửa trang nào thì mở file nào

| Trang | Đường dẫn | File chính | Dữ liệu |
|---|---|---|---|
| Trang chủ | `/` | `pages/HomePage.jsx` + các khối trong `sections/` | `data/hero.json`, `about.json`, `doiTac.json`, `services.json` |
| Trang dịch vụ | `/zalo-miniapp`, `/software-hardware`, `/digital-transformation`, `/robot`, `/vr360` | `pages/*Page.jsx` + `components/service/` | `data/servicePages.json` |
| Tour VR360 | `/tour-360` | `pages/TourVr360Page.jsx` | `data/tourVr360.json` |
| Tin tức, câu chuyện | `/tin-tuc`, `/cau-chuyen` | `pages/DanhSachBaiVietPage.jsx`, `BaiVietPage.jsx` | từ API (`services/baiVietService.js`) |
| Tài khoản | `/dang-nhap`, `/dang-ky`, `/tai-khoan` | `pages/DangNhapPage.jsx`…, `components/taikhoan/` | từ API (`services/taiKhoanService.js`) |
| Quản trị nội dung | `/admin` | `pages/AdminPage.jsx` + `components/admin/` | từ API (`services/adminService.js`) |
| Pháp lý | `/privacy-policy`, `/terms-of-service` | `pages/LegalPage.jsx` | `data/legalPages.json` |
| Bảng mẫu giao diện (nội bộ) | `/ui-kit` | `pages/UiKitPage.jsx` | |

Dùng chung cho mọi trang:

| Việc | File |
|---|---|
| Khai báo các trang (router) | `src/App.jsx` |
| Thanh menu, chân trang | `components/layout/`, mục menu trong `utils/constants.js` |
| Khung chat nền tảng (khoá bot, công tắc) | `components/chatbot/botNenTang.js`, `ChatbotNenTang.jsx` |
| Bot cũ của website (đang ẩn, để dự phòng) | `components/chatbot/ChatWidget.jsx`…, `services/chatBrain.js`, `data/kienThuc.json` |
| Nút, thẻ, logo… dùng lại | `components/ui/` |
| Màu sắc | `styles/index.css`, `styles/bangMau.css`, `data/bangMau.js` (tự sinh) |
| Chuyển hướng link cũ | `data/chuyenHuong.json` (xem bên dưới) |
| Thông tin công ty (tên, điện thoại…) | `data/company.json`, sửa được trong `/admin` |

## Lệnh thường dùng

```bash
npm run dev            # chạy website ở máy, http://localhost:5173
npm run build          # build ra dist/ (tự kiểm tra bảng chuyển hướng trước)
npm run lint           # soát lỗi mã

npm run chuyenhuong    # sinh lại file nginx từ data/chuyenHuong.json
npm run bangmau        # kiểm tra tương phản rồi sinh lại data/bangMau.js
npm run test:chat      # thử bot cũ với bộ câu hỏi data/chatTestQuestions.json
npm run test:chat:flow # thử bot cũ theo hội thoại nhiều lượt
npm run test:congty    # bot cũ có đọc đúng thông tin công ty không
npm run test:doitac    # biểu tượng đối tác ở trang chủ và /admin có khớp không
```

## Đưa bản mới lên imob.vn

```bash
git push
ssh chung "bash /var/www/imob/trien-khai.sh"
```

Script tự chạy kiểm tra, build, đổi sang bản mới; hỏng bước nào thì tự quay về
bản cũ. Chi tiết: `trien-khai/README.md`.

## Chuyển hướng link cũ

Website đang gọn lại còn hai mục (Hỏi đáp AI, Về chúng tôi). Link của các trang
sẽ bỏ được chuyển sang trang mới theo **một bảng duy nhất**:
`src/data/chuyenHuong.json`. Đang **tắt** (`"bat": false`) cho tới khi trang mới
lên. Cách bật ghi ở đầu `trien-khai/nginx-chuyen-huong.conf`.

## Những điều không được làm

- **Không** đưa khoá Gemini, mật khẩu hay file `.env` vào git: kho mã này công khai.
  (Khoá bot `imob_live_…` trong `botNenTang.js` thì vốn công khai, không sao.)
- **Không** sửa thẳng file trên máy chủ: lần triển khai sau sẽ ghi đè mất.
- Trong cấu hình nginx, **không** `include` một file có thể vắng mặt mà thiếu dấu
  `*`, và **không** ghi tên miền trong `proxy_pass`: nginx không khởi động được
  là sập mọi trang trên máy chủ (đã xảy ra 04/11/2026).
