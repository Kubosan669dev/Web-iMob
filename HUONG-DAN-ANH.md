# Thêm ảnh và mã QR vào website

Toàn bộ phần code đã dựng xong. Bạn chỉ cần **bỏ file vào đúng thư mục** và
**điền một dòng đường dẫn** — không phải sửa code.

Trong lúc chưa có file thì mọi khối ảnh **tự ẩn**, trang vẫn hiển thị bình
thường. Gõ nhầm tên file cũng không sao: thẻ ảnh tự biến mất thay vì hiện biểu
tượng "ảnh vỡ" (xem `src/components/ui/Anh.jsx`).

---

## Vì sao tôi không tự cắt được ảnh

Ảnh bạn dán vào khung chat chỉ nằm trong cuộc trò chuyện, **không được lưu
xuống ổ đĩa**. Tôi đã tìm trong thư mục tạm, thư mục dự án và Downloads — không
có. Nên phần cắt/xuất file phải do bạn làm.

---

## Bước 1 — Xuất file từ ba ấn phẩm

Mở file thiết kế gốc (Canva / Photoshop / Illustrator) và xuất từng phần:

### Mã QR — quan trọng nhất

Từ tờ **"iMob 2026 — Các sản phẩm nổi bật"**, cắt riêng **5 mã QR**.

| Cắt mã của | Lưu thành |
|---|---|
| Yên Tử Số | `public/qr/yen-tu-so.png` |
| Bảo tàng – Thư viện tỉnh Quảng Ninh | `public/qr/bao-tang-thu-vien-quang-ninh.png` |
| Phường An Sinh Số | `public/qr/phuong-an-sinh-so.png` |
| Bản đồ số Đông Triều | `public/qr/ban-do-so-dong-trieu.png` |
| Website phường Yên Tử | `public/qr/website-phuong-yen-tu.png` |

Yêu cầu: **cắt vuông**, chỉ lấy phần mã, **nền trắng**, tối thiểu **400×400px**.
Đừng cắt kèm chữ tên sản phẩm phía dưới — website tự in tên rồi.

### Ảnh minh hoạ Hero (tuỳ chọn)

Từ tờ **giới thiệu công ty**, cắt phần minh hoạ bên phải (vịnh Hạ Long + khối
lập phương công nghệ), bỏ hết chữ.

Lưu thành `public/anh/hero.png` — ảnh ngang, rộng tối thiểu **1600px**.

### Ảnh chụp màn hình sản phẩm (tuỳ chọn, nhưng đáng làm nhất)

Ba ấn phẩm **không có** ảnh chụp màn hình sản phẩm nào. Đây mới là thứ khiến
phần Sản phẩm thuyết phục: mở từng Mini App / website lên, chụp màn hình.

Lưu vào `public/anh/` theo tên: `yen-tu-so.png`, `bao-tang-thu-vien-quang-ninh.png`,
`phuong-an-sinh-so.png`, `ban-do-so-dong-trieu.png`, `website-phuong-yen-tu.png`.

Yêu cầu: tỉ lệ **16:10** (ví dụ 1200×750px). Ảnh sẽ bị cắt về đúng tỉ lệ này
nên đừng để nội dung quan trọng sát mép.

---

## Bước 2 — Điền đường dẫn

Mở `src/data/projects.json`, với mỗi sản phẩm điền vào ba ô đang để trống:

```json
{
  "id": "yen-tu-so",
  "title": "Yên Tử Số",
  "anh": "/anh/yen-tu-so.png",
  "qr": "/qr/yen-tu-so.png",
  "lienKet": "https://zalo.me/s/..."
}
```

Ảnh Hero điền trong trang `/admin` → tab **Hero** → ô **Ảnh minh hoạ**, gõ
`/anh/hero.png`. Nhớ điền cả ô **Mô tả ảnh** — người khiếm thị và Google đọc ô đó.

> Đường dẫn **bắt đầu bằng dấu `/`** và **không có chữ `public`**.
> File `public/qr/yen-tu-so.png` → viết là `/qr/yen-tu-so.png`.

---

## Bước 3 — Địa chỉ web của 5 sản phẩm

Đây là thứ tôi **không lấy được từ ảnh**: mã QR chứa một đường dẫn, nhưng nhìn
bằng mắt thì không giải mã ra được.

Bạn quét thử 5 mã bằng điện thoại rồi chép địa chỉ hiện ra, gửi cho tôi hoặc tự
điền vào ô `lienKet`. Điền xong thì **cả thẻ sản phẩm bấm được**.

Điều này quan trọng hơn mã QR: khách xem website **bằng điện thoại** không quét
được mã trên màn hình chính máy mình. Với họ chỉ có liên kết bấm được mới dùng
được. Mã QR chỉ hiện trên **máy tính** (từ 1024px trở lên), là chỗ nó thật sự
hữu ích.

---

## Tóm tắt hành vi

| Bạn điền | Kết quả |
|---|---|
| Không điền gì | Trang y như hiện nay, không có ô trống nào |
| Chỉ `anh` | Thẻ sản phẩm có ảnh minh hoạ |
| Chỉ `qr` | Hiện dải "Quét mã để mở ngay trên điện thoại" ở cuối phần Sản phẩm (chỉ trên máy tính) |
| Chỉ `lienKet` | Cả thẻ bấm được, có mũi tên ↗ |
| Điền hết | Có đủ ba |

Ảnh dùng `loading="lazy"` nên chỉ tải khi khách cuộn tới — thêm ảnh không làm
trang chủ nặng thêm lúc mở.
