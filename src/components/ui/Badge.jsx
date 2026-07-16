// Badge: nhãn nhỏ đầu section / hero (vd: ⚡ GIẢI PHÁP SỐ THẾ HỆ MỚI).
//   icon: component icon của lucide-react
export default function Badge({ icon: Icon, children, className = "" }) {
  return (
    <span
      className={
        "inline-flex items-center gap-2 rounded-full border border-purple-500/40 " +
        "bg-purple-500/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] " +
        `text-purple-300 ${className}`
      }
    >
      {Icon && <Icon className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />}
      {children}
    </span>
  );
}
