
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
//
// 17/11/2026 — đổi theo giao diện mới (ảnh mẫu trang Trợ lý AI địa phương):
// nhãn là chữ nhỏ viết hoa giãn chữ (không còn viên thuốc), tiêu đề chữ có
// chân Playfair, phần `highlight` in nghiêng thay vì tô màu. Đổi ở đây là mọi
// trang cũ dùng SectionTitle (Về chúng tôi, trang dịch vụ…) đồng bộ theo.
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
      {badge && (
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">{badge}</p>
      )}

      {/* Cỡ chữ co theo bề rộng màn hình. `tieu-de-lon` siết khoảng cách chữ
          cái lại — xem ghi chú của utility đó trong styles/index.css. */}
      <h2 className="text-pretty font-display text-[clamp(1.875rem,4vw,2.75rem)] font-semibold leading-[1.15] text-brand-deep">
        {title}
        {highlight && (
          <>
            {" "}
            <em>{highlight}</em>
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
