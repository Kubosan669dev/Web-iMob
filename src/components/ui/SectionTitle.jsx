import Badge from "./Badge.jsx";

// SectionTitle: khối tiêu đề chuẩn của mọi section.
//   badge     : dòng chữ nhỏ màu thương hiệu phía trên
//   title     : phần tiêu đề màu mực
//   highlight : phần tiêu đề tô màu thương hiệu (đặt sau title)
//   align     : "center" (mặc định) | "left"
//
// Mặc định CĂN GIỮA — apple.com căn giữa gần như mọi tiêu đề section, và đó là
// một phần lý do trang họ trông cân. Biến thể căn trái chỉ dùng cho bố cục hai
// cột, nơi tiêu đề phải thẳng hàng với đoạn văn bên dưới.
//
// Prop `icon` đã bỏ (xem ghi chú trong Badge.jsx).
export default function SectionTitle({
  badge,
  title,
  highlight,
  description,
  align = "center",
  className = "",
}) {
  const canGiua = align === "center";

  return (
    <div
      className={
        (canGiua ? "mx-auto max-w-3xl text-center " : "text-left ") +
        `flex flex-col gap-4 ${className}`
      }
    >
      {badge && <Badge>{badge}</Badge>}

      {/* Cỡ chữ co theo bề rộng màn hình. `tieu-de-lon` siết khoảng cách chữ
          cái lại — xem ghi chú của utility đó trong styles/index.css. */}
      <h2 className="tieu-de-lon text-pretty text-[clamp(1.875rem,4.2vw,3.25rem)] text-ink">
        {title}
        {highlight && (
          <>
            {" "}
            <span className="text-brand">{highlight}</span>
          </>
        )}
      </h2>

      {description && (
        <p
          className={
            "text-[1.0625rem] leading-relaxed text-ink-soft sm:text-[1.1875rem] " +
            (canGiua ? "mx-auto max-w-2xl" : "max-w-2xl")
          }
        >
          {description}
        </p>
      )}
    </div>
  );
}
