// Button: nút dùng chung toàn site.
//   variant : "primary" (gradient tím → xanh) | "outline" | "ghost"
//   size    : "sm" | "md" | "lg"
//   href    : nếu truyền → render thẻ <a> (dùng cho anchor #section)
const VARIANTS = {
  primary:
    "bg-gradient-to-r from-purple-500 to-blue-500 text-white " +
    "hover:shadow-glow-purple hover:scale-[1.04] hover:brightness-110 active:scale-95",
  outline:
    "border border-blue-500/40 bg-blue-500/5 text-blue-300 " +
    "hover:border-cyan-400/60 hover:bg-blue-500/10 hover:text-cyan-300 " +
    "hover:shadow-glow-blue hover:scale-[1.04] active:scale-95",
  ghost: "text-gray-300 hover:bg-white/5 hover:text-white",
};

const SIZES = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
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
        "rounded-full font-semibold uppercase tracking-wider transition-all duration-300 " +
        `${VARIANTS[variant]} ${SIZES[size]} ${className}`
      }
      {...props}
    >
      {children}
    </Tag>
  );
}
