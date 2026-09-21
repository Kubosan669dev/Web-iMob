// Container: giới hạn bề rộng nội dung + padding ngang responsive.
// Mọi section đều bọc nội dung trong Container để lề thẳng hàng toàn site.
//
// ...props (thêm 20/08/2026): cho phép truyền thẳng id, aria-*, data-* xuống
// thẻ div. Trước đó chỉ nhận className và children, nên `<Container id="...">`
// bị NUỐT LẶNG LẼ — không lỗi, không cảnh báo, chỉ là cái neo không bao giờ
// tồn tại và menu bấm vào thì không nhảy đi đâu cả. Đúng loại lỗi khó tìm nhất.
// `rong` (thêm 21/09/2026): bề rộng tối đa, mặc định giữ nguyên như cũ.
//
// VÌ SAO PHẢI CÓ THAM SỐ RIÊNG chứ không truyền "max-w-3xl" qua className:
// hai class max-w-* cùng nằm trên một thẻ thì class nào ĐỨNG SAU TRONG FILE
// CSS sẽ thắng, chứ không phải class nào viết sau trong thuộc tính class.
// Tailwind sinh max-w-3xl TRƯỚC max-w-7xl, nên max-w-7xl luôn thắng và giá trị
// truyền vào bị bỏ qua — lặng lẽ, không lỗi, chỉ là trang rộng hơn ý muốn.
// Dùng `rong` thì trên thẻ chỉ có đúng MỘT class max-w, khỏi phải tranh nhau.
export default function Container({
  className = "",
  rong = "max-w-7xl",
  children,
  ...props
}) {
  return (
    <div
      className={`mx-auto w-full ${rong} px-4 sm:px-6 lg:px-8 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
