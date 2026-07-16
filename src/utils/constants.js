// ============================================================
// Hằng số toàn site — đổi thương hiệu / thông tin liên hệ TẠI ĐÂY,
// không hardcode các giá trị này bên trong component.
// ============================================================

export const SITE = {
  name: "iMob",
  tagline: "Solution & Technology",
  description: "Đơn vị tiên phong chuyển đổi số trong mọi lĩnh vực",
  email: "hotro@example.com",
  phone: "+84 900 000 000",
  address: "Hạ Long, Quảng Ninh, Việt Nam",
};

// Menu điều hướng — item có `children` sẽ hiển thị dropdown.
// Giai đoạn này dropdown anchor tới section; sau này có thể đổi href
// thành route riêng (/zalo-miniapp...) mà không sửa Navbar.
export const NAV_ITEMS = [
  { id: "home", label: "HOME", href: "#home" },
  { id: "about", label: "ABOUT", href: "#about" },
  {
    id: "services",
    label: "SERVICES",
    href: "#services",
    children: [
      { label: "Phát triển Zalo MiniApp", href: "#services" },
      { label: "Giải pháp Phần mềm & Phần cứng", href: "#services" },
      { label: "Đào tạo Chuyển đổi số", href: "#services" },
    ],
  },
  { id: "contact", label: "CONTACT", href: "#contact" },
];

// Mạng xã hội hiển thị ở Footer — id khớp với icon map trong Footer.jsx,
// thay href "#" bằng link thật khi có.
export const SOCIAL_LINKS = [
  { id: "facebook", label: "Facebook", href: "#" },
  { id: "youtube", label: "YouTube", href: "#" },
  { id: "linkedin", label: "LinkedIn", href: "#" },
  { id: "github", label: "GitHub", href: "#" },
];

// Base URL của backend AI Python — đặt trong file .env (VITE_API_URL).
// Để trống = gọi tương đối /api/* (đã có proxy trong vite.config.js).
export const API_BASE_URL = import.meta.env.VITE_API_URL || "";
