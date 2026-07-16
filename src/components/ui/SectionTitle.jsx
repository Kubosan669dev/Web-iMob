import Badge from "./Badge.jsx";

// SectionTitle: khối tiêu đề chuẩn của mọi section.
//   badge     : chữ trong nhãn nhỏ phía trên
//   icon      : icon lucide cho badge
//   title     : phần tiêu đề màu trắng
//   highlight : phần tiêu đề tô gradient (đặt sau title)
//   align     : "center" | "left"
export default function SectionTitle({
  badge,
  icon,
  title,
  highlight,
  description,
  align = "center",
  className = "",
}) {
  const alignCls =
    align === "left" ? "items-start text-left" : "items-center text-center";

  return (
    <div className={`flex flex-col gap-4 ${alignCls} ${className}`}>
      {badge && <Badge icon={icon}>{badge}</Badge>}
      <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
        {title}
        {highlight && (
          <>
            {" "}
            <span className="text-gradient">{highlight}</span>
          </>
        )}
      </h2>
      {description && (
        <p className="max-w-2xl text-base leading-relaxed text-gray-400">
          {description}
        </p>
      )}
    </div>
  );
}
