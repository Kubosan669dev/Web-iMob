# Bàn giao: website imob.vn, giai đoạn tiếp theo

Cập nhật 16/11/2026. Đọc kèm [README.md](../README.md) (bản đồ mã nguồn, lệnh thường dùng).

## 1. Bối cảnh

Từ 11/2026 iMob chuyển sang **cho thuê chatbot AI (RAG) cho các địa phương**.
imob.vn được làm lại theo hướng đó, giao diện theo bản công ty đã chốt (4 ảnh mẫu).

Có hai hệ thống, đừng nhầm:

| Hệ thống | Ai lo | Ở đâu |
|---|---|---|
| **Website imob.vn** (repo này) | đội web | React + Vite, API Python `chatbot-python/`, máy chủ CMC `ssh chung` |
| **Nền tảng chatbot** (kho tri thức, AI, khung chat) | anh Thắng | https://chatbot.imob.vn. Website chỉ **chèn** khung chat của nền tảng, không tự trả lời |

## 2. Đã xong và đang chạy trên imob.vn

| Phần | Đường dẫn | File chính |
|---|---|---|
| Trang chủ = Hỏi đáp AI | `/` | `pages/HomePage.jsx`, `sections/hoi-dap/` |
| Trang chat cả màn hình | `/hoi-dap/yen-tu`, `/dong-trieu`, `/quang-tan`, thêm `?hoi=câu hỏi` | `pages/HoiDapPage.jsx`, `sections/hoi-dap/KhungChatCaTrang.jsx` |
| Tin tức (tin công ty + câu chuyện khách hàng) | `/tin-tuc`, `/cau-chuyen` | `pages/TinTucPage.jsx`, `BaiVietPage.jsx` |
| Về chúng tôi (trang chủ cũ) | `/ve-chung-toi` | `pages/VeChungToiPage.jsx` |
| Form đăng ký cho địa phương | `/#dang-ky` → `POST /api/dang-ky-dia-phuong` | `sections/hoi-dap/DangKyDiaPhuong.jsx`, `chatbot-python/api_lien_he.py` |
| Dữ liệu 3 địa phương | | `src/data/diaPhuong.json` |

Lịch sử: commit `0cf5924` (giai đoạn 1), `bd936da` (giai đoạn 2), `3eaf5c3` (Tin tức), `a8dd6e6` (sửa lỗi `[object Object]`).

### Ba nguyên tắc đã áp dụng, phải giữ

1. **Không đưa số liệu bịa lên trang.** Ảnh mẫu có "1,420+ tri thức", "Zero-Hallucination", số công văn
   "CV-249/UBND…", "mật độ khách", giá vé… Tất cả đã bỏ hoặc thay bằng số có nguồn.
   Mỗi con số trong `diaPhuong.json` có trường `_nguon` ghi đếm ở đâu, ngày nào.
2. **Không gọi thẳng API của nền tảng chatbot khi chưa có tài liệu từ anh Thắng.**
   Trang chat cả màn hình hiện chỉ đặt **chính khung chat của nền tảng** vào giữa trang (đổi CSS),
   điều khiển nó như người thật bấm: điền `#imob-chat-input`, bấm `#imob-send-btn`
   (`components/chatbot/botNenTang.js` → `guiCauHoi`, `moKhungChat`).
3. **Tên hành chính dùng tên sau 01/07/2025** (đã bỏ cấp huyện, cả nước 34 tỉnh).

## 3. Việc của giai đoạn tiếp theo

Thứ tự gợi ý: làm **A** trước (không phụ thuộc ai); **B** cần anh Thắng; **C** sau cùng.

### A. Làm được ngay (phần còn lại của giai đoạn 2)

- [ ] **A1. Mã QR tại điểm du lịch.** Trang in được (khổ A5/A6) cho mỗi địa phương: mã QR trỏ tới
  `https://imob.vn/hoi-dap/<khoa>`, tên địa phương, một dòng hướng dẫn "Quét để hỏi trợ lý AI".
  Dùng lại `components/ui/MaQR.jsx` (sinh QR ngay trong trình duyệt).
  *Xong khi:* in thử ra giấy, quét bằng Zalo và camera điện thoại đều mở đúng trang.
- [ ] **A2. Trang câu hỏi thường gặp** cho từng địa phương. Bấm câu nào thì sang `/hoi-dap/<khoa>?hoi=<câu>`.
  Nguồn câu hỏi: `cauHoi` trong `diaPhuong.json`, mở rộng thêm.
  *Xong khi:* mỗi địa phương có ít nhất 10 câu, chia theo vai trò (du khách / hộ kinh doanh / cư dân).
- [ ] **A3. Thêm địa phương mới** chỉ bằng dữ liệu: thêm một phần tử vào `diaPhuong.json`
  (ảnh thật vào `public/anh/dia-phuong/`, toạ độ tra OpenStreetMap, số liệu có `_nguon`).
  Mã không phải sửa. Viết hướng dẫn ngắn cho người không lập trình.

### B. Cần anh Thắng (nền tảng chatbot)

- [ ] **B1. Nạp tài liệu cho kho tri thức.** Đây là việc **quan trọng nhất**: thử ngày 13–16/11/2026, bot trả lời
  "kho dữ liệu chưa cập nhật" cho cả *đường lên chùa Đồng*, *lộ trình 1 ngày ở Yên Tử*, *thác Bạch Vân*.
  Giao diện đẹp mà bot không trả lời được thì khách bỏ đi.
  Danh sách câu cần trả lời được = toàn bộ `cauHoi` trong `diaPhuong.json`.
- [ ] **B2. Tài liệu API chat** (gửi câu, nhận câu trả lời, nguồn trích dẫn, đánh giá 👍/👎).
  Có rồi thì thay `KhungChatCaTrang.jsx` bằng khung chat tự vẽ, làm nốt phần ảnh mẫu thứ 4:
  lộ trình đánh số, ảnh gợi ý kèm nút 360° ngay trong câu trả lời. Cột phải và phần còn lại của trang giữ nguyên.
- [ ] **B3. Mỗi địa phương một kho riêng** và cho phép tên miền `imob.vn`. Hiện cả 3 nơi dùng chung kho "iMob";
  website ghép tên vùng vào đầu câu hỏi ("Yên Tử: …", xem `utils/hoiDap.js` → `ghepVung`). Có kho riêng thì bỏ bước ghép.

### C. Giai đoạn 3 theo bản đề xuất: giá trị cho khách thuê

- [ ] **C1. Báo cáo câu hỏi hằng tháng** cho từng địa phương (câu hỏi nhiều nhất, câu bot chưa trả lời được).
  Cần dữ liệu hội thoại từ nền tảng (B2).
- [ ] **C2. Tiếng Anh** cho khách nước ngoài: cả giao diện lẫn kho tri thức.
- [ ] **C3. Hỏi bằng giọng nói** cho người lớn tuổi.

## 4. Việc vận hành còn treo (không phải lập trình)

| Việc | Ai | Cách làm |
|---|---|---|
| Bảng màu web vẫn tím | người có tài khoản `/admin` | imob.vn/admin → Giao diện → chọn **"Bản địa"** → Lưu. Sửa luôn lời chào bot (đang là câu cũ về Zalo Mini App) |
| Nạp lại nginx để trang HTML không bị lưu đệm cũ | quản trị máy chủ | `ssh chung "nginx -t && systemctl reload nginx"` (cấu hình đã sửa sẵn, đã kiểm tra cú pháp; bản cũ: `/root/nginx-imob.bak-20261116`) |

## 5. Cách làm việc

### Chạy ở máy

```bash
npm install
npm run dev                                   # web: http://localhost:5173
cd chatbot-python && python -m uvicorn main:app --reload --port 8000   # API, cửa sổ riêng
```

`/admin` ở máy báo **"Máy chủ báo lỗi 502"** nghĩa là chưa bật API ở cổng 8000.

### Thử khung chat của nền tảng ở máy

Khung chat **không hiện trên localhost** (nền tảng chỉ cho tên miền `imob.vn`). Muốn thử thật:
build (`npm run build`), phục vụ `dist/` qua HTTPS với chứng chỉ tự ký, rồi mở Chrome với
`--host-resolver-rules="MAP imob.vn 127.0.0.1:<cổng>" --ignore-certificate-errors`.

### Trước khi gộp vào `main`

```bash
npm run lint && npm run build          # build tự kiểm tra bảng chuyển hướng
npm run test:congty && npm run test:doitac
cd chatbot-python && python run_tests.py
```

- Mỗi việc một nhánh + một Pull Request, không đẩy thẳng lên `main`.
- **Không** đưa `.env`, khoá Gemini, mật khẩu lên git: repo này công khai.
  Khoá `imob_live_…` trong `botNenTang.js` vốn công khai, không sao.
- **Không** ghi tên miền trong `proxy_pass` của nginx: ngày 04/11/2026 việc đó làm sập toàn bộ
  các trang trên máy chủ (xem README).

### Đưa lên imob.vn (sau khi PR đã gộp vào `main`)

```bash
git push
ssh chung "bash /var/www/imob/trien-khai.sh"   # tự kiểm thử, build, hỏng thì tự quay về bản cũ
```

Kịch bản triển khai **không** chép cấu hình nginx. Sửa `trien-khai/nginx-*.conf` thì phải chép tay
lên máy chủ, `nginx -t`, rồi mới `systemctl reload nginx`.
