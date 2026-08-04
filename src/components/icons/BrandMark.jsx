// Logo iMob — nút nguồn ⏻ cách điệu trong lục giác (cùng hình với public/favicon.svg).
// SVG inline, nét theo currentColor để đặt vừa trong ô gradient (hiển thị màu trắng)
// ở Navbar / Footer / MobileMenu — thay cho icon Zap cũ.
// Dùng: <BrandMark className="h-5 w-5 text-white" />
export default function BrandMark({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Vòng lục giác hở ở đỉnh */}
      <path d="M15.1 4.8 19.8 7.5 19.8 16.5 12 21 4.2 16.5 4.2 7.5 8.9 4.8" />
      {/* Thanh dọc của nút nguồn */}
      <path d="M12 2v9" />
    </svg>
  );
}
