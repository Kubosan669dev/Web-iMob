// Button: nút dùng chung toàn site.
//   variant : "primary" (chàm tím đặc) | "outline" (xám nhạt) | "ghost" (chữ)
//   size    : "sm" | "md" | "lg"
//   href    : nếu truyền → render thẻ <a> (dùng cho anchor #section)
//
// Kiểu nút theo apple.com:
// • Viên thuốc bo tròn hoàn toàn (rounded-full), KHÔNG viền, KHÔNG bóng.
// • Nút phụ là một viên xám nhạt, không phải nút viền rỗng — viền rỗng tạo
//   thêm một đường kẻ nữa trên trang, mà cả hệ thiết kế này đang cố giảm số
//   đường kẻ xuống ít nhất có thể.
// • Hover chỉ đổi màu nền, không nhấc lên không đổ bóng. Chuyển động thừa làm
//   giao diện trông rẻ tiền.
// • Chữ thường, không IN HOA: tiếng Việt viết hoa toàn bộ bị chồng dấu.
const VARIANTS = {
  primary: "bg-brand text-tren-brand hover:bg-brand-deep",
  outline: "bg-mist text-ink hover:bg-line",
  ghost: "text-brand hover:underline underline-offset-4",
};

const SIZES = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-[0.9375rem]",
  lg: "px-7 py-3.5 text-[1.0625rem]",
};

export default function Button({
  variant = "primary",
  size = "md",
  href,
  className = "",
  children,
  ...props
}) {
  const Tag = href ? "a" : "button";
  return (
    <Tag
      href={href}
      className={
        "inline-flex cursor-pointer select-none items-center justify-center gap-2 " +
        "rounded-full font-medium transition-colors duration-200 " +
        `${VARIANTS[variant]} ${SIZES[size]} ${className}`
      }
      {...props}
    >
      {children}
    </Tag>
  );
}
