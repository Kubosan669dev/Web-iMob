// Card: khối glassmorphism dùng chung (nền kính mờ + viền xanh nhạt).
//   hover=true → nhấc nhẹ + viền tím + glow khi di chuột (dùng cho card dịch vụ/dự án)
export default function Card({ hover = false, className = "", children, ...props }) {
  return (
    <div
      className={
        "glass rounded-2xl p-6 transition-all duration-300 " +
        (hover
          ? "hover:-translate-y-1.5 hover:border-purple-500/50 hover:shadow-glow-purple "
          : "") +
        className
      }
      {...props}
    >
      {children}
    </div>
  );
}
