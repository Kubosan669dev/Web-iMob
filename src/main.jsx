import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Fonts self-host (không phụ thuộc Google Fonts CDN).
//
// Be Vietnam Pro: phông chữ THIẾT KẾ RIÊNG cho tiếng Việt. Các phông phương Tây
// (kể cả Inter dùng trước đây) vẽ chữ Latin trước rồi mới gắn dấu vào sau, nên
// chữ nhiều dấu như "ườ", "ễ", "ộ" hay bị dấu chệch, chồng lên nhau hoặc chạm
// dòng trên. Be Vietnam Pro tính chỗ đặt dấu ngay từ đầu.
//
// Phông này KHÔNG có bản variable, phải nạp từng độ đậm. Chỉ nạp đúng 4 mức mà
// giao diện thật sự dùng (đếm bằng grep font-*): mỗi mức thừa là thêm một file
// khách phải tải. Mỗi file đã chia sẵn theo unicode-range nên trình duyệt chỉ
// tải phần chữ Việt + Latin, không tải các bảng chữ khác.
import "@fontsource/be-vietnam-pro/400.css"; // chữ thường
import "@fontsource/be-vietnam-pro/500.css"; // font-medium
import "@fontsource/be-vietnam-pro/600.css"; // font-semibold
import "@fontsource/be-vietnam-pro/700.css"; // font-bold
import "@fontsource/be-vietnam-pro/900.css"; // font-black (tiêu đề lớn)

// JetBrains Mono giữ nguyên: dùng cho nhãn, mã, số liệu — kiểu chữ máy tính
// tương phản rõ với phần chữ nội dung.
import "@fontsource-variable/jetbrains-mono";

import "./styles/index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
