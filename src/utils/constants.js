// ============================================================
// Hằng số toàn site.
//
// Thông tin công ty KHÔNG còn viết ở đây nữa — nó nằm trong
// data/company.json để CHATBOT cũng đọc được cùng một file (bot điền vào
// các chỗ {{cong_ty.*}} trong data/kienThuc.json). Trước đây thông tin bị
// chép ở 2 nơi, sửa một bên quên bên kia là bot nói sai thông tin công ty.
//
// Đổi tên/SĐT/email/địa chỉ → sửa data/company.json, KHÔNG sửa file này.
// ============================================================

import company from "../data/company.json";

// Giữ nguyên tên `SITE` và các khoá cũ để mọi component đang dùng
// không phải sửa gì.
export const SITE = company;

// Menu điều hướng.
//   href "/#id" = mục cuộn tới section của TRANG CHỦ. Dùng "/#..." (kèm dấu /)
//     để bấm từ trang con (vd /zalo-miniapp) vẫn quay về đúng section trang chủ.
//   children[].to = ROUTE thật của trang dịch vụ riêng (React Router <Link>).
// Navbar/MobileMenu/Footer đều đọc từ đây → một nguồn dữ liệu duy nhất.
export const NAV_ITEMS = [
  { id: "home", label: "HOME", href: "/#home" },
  { id: "about", label: "ABOUT", href: "/#about" },
  {
    id: "services",
    label: "SERVICES",
    href: "/#services",
    children: [
      { label: "Phát triển Zalo MiniApp", to: "/zalo-miniapp" },
      { label: "Giải pháp Phần mềm & Phần cứng", to: "/software-hardware" },
      { label: "Đào tạo Chuyển đổi số", to: "/digital-transformation" },
    ],
  },
  { id: "contact", label: "CONTACT", href: "/#contact" },
];

// Mạng xã hội hiển thị ở Footer — id khớp với icon map trong Footer.jsx,
// thay href "#" bằng link thật khi có.
export const SOCIAL_LINKS = [
  { id: "facebook", label: "Facebook", href: "#" },
  { id: "youtube", label: "YouTube", href: "#" },
  { id: "linkedin", label: "LinkedIn", href: "#" },
  { id: "github", label: "GitHub", href: "#" },
];

// Base URL của backend — đặt trong file .env (VITE_API_URL).
// Để trống = gọi tương đối /api/* (đã có proxy trong vite.config.js).
//
// Chatbot chạy TRONG TRÌNH DUYỆT là chính (đọc data/kienThuc.json). Backend
// Python chỉ được gọi khi bật VITE_USE_BACKEND=true — xem services/chatService.js.
// Biến này cũng dành cho form Liên hệ (services/contactService.js).
//
// Vì sao phải "vá" tiền tố https:// ở dưới:
// trên Render, giá trị VITE_API_URL được lấy tự động từ dịch vụ API
// (render.yaml -> fromService/property: host) nên nó là tên miền TRẦN
// "imob-chatbot-api.onrender.com", không kèm https://. Nếu để nguyên thì
// fetch() hiểu nhầm thành đường dẫn tương đối và gọi sai chỗ. Đoạn này cũng
// tha thứ cho việc gõ thiếu https:// hoặc thừa dấu / ở cuối.
const API_URL_THO = (import.meta.env.VITE_API_URL || "").trim();

export const API_BASE_URL = API_URL_THO
  ? (/^https?:\/\//.test(API_URL_THO) ? API_URL_THO : `https://${API_URL_THO}`).replace(
      /\/+$/,
      ""
    )
  : "";
