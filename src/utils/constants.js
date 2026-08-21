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

// ⚠️ SITE giờ là GIÁ TRỊ MẶC ĐỊNH, không còn là nguồn duy nhất.
//
// Từ khi có trang quản trị /admin, thông tin công ty được lưu trong database và
// website tải về lúc chạy. Component nào hiển thị thông tin công ty phải dùng
// hook `useCongTy()` (src/context/NoiDungContext.jsx) thì mới thấy bản đã sửa.
//
// SITE chỉ còn dùng cho code KHÔNG PHẢI component React (không gọi hook được),
// và làm bản dự phòng khi chưa gọi được API. ĐỪNG dùng SITE trong component —
// sửa trong /admin sẽ không ăn.
export const SITE = company;

// Menu điều hướng.
//   href "/#id" = mục cuộn tới section của TRANG CHỦ. Dùng "/#..." (kèm dấu /)
//     để bấm từ trang con (vd /zalo-miniapp) vẫn quay về đúng section trang chủ.
//   children[].to = ROUTE thật của trang dịch vụ riêng (React Router <Link>).
// Navbar/MobileMenu/Footer đều đọc từ đây → một nguồn dữ liệu duy nhất.
// Nhãn menu đổi từ TIẾNG ANH IN HOA (HOME / ABOUT / SERVICES) sang tiếng Việt
// ngày 17/08/2026. Khách của iMob là chủ doanh nghiệp vừa và nhỏ ở Việt Nam;
// bắt họ đọc menu tiếng Anh là dựng thêm một rào cản chẳng để làm gì.
// Thứ tự cũng đổi cho khớp thứ tự section mới của trang chủ.
// ĐỔI NHÃN 19/08/2026 theo góp ý của công ty: "Sản phẩm" -> "Dự án",
// "Dịch vụ" -> "Công nghệ". Chỉ đổi CHỮ HIỆN RA, giữ nguyên `id` và `href`
// (#projects, #services) — id còn được dùng cho neo cuộn, cho useActiveSection
// và được nhắc trong kho kiến thức chatbot, đổi là hỏng cả ba chỗ.
export const NAV_ITEMS = [
  { id: "home", label: "Trang chủ", href: "/#home" },
  { id: "projects", label: "Dự án", href: "/#projects" },
  {
    id: "services",
    label: "Công nghệ",
    href: "/#services",
    children: [
      { label: "Phát triển Zalo MiniApp", to: "/zalo-miniapp" },
      { label: "Giải pháp Phần mềm & Phần cứng", to: "/software-hardware" },
      { label: "Đào tạo Chuyển đổi số", to: "/digital-transformation" },
      // Hai mục thêm 21/08/2026 cùng lúc với hai trang mới. Menu là đường
      // duy nhất tới /vr360: mảng thực tế ảo không nằm trong bảy mục ở trang
      // chủ (bảy mục đó là danh sách công ty tự chốt, không tự ý thêm bớt),
      // nên không có mục này thì trang VR360 dựng xong cũng không ai tìm ra.
      { label: "Ứng dụng Robot", to: "/robot" },
      { label: "Thực tế ảo 360°", to: "/vr360" },
    ],
  },
  { id: "about", label: "Về chúng tôi", href: "/#about" },
  { id: "contact", label: "Liên hệ", href: "/#contact" },
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
