// Container: giới hạn bề rộng nội dung + padding ngang responsive.
// Mọi section đều bọc nội dung trong Container để lề thẳng hàng toàn site.
//
// ...props (thêm 20/08/2026): cho phép truyền thẳng id, aria-*, data-* xuống
// thẻ div. Trước đó chỉ nhận className và children, nên `<Container id="...">`
// bị NUỐT LẶNG LẼ — không lỗi, không cảnh báo, chỉ là cái neo không bao giờ
// tồn tại và menu bấm vào thì không nhảy đi đâu cả. Đúng loại lỗi khó tìm nhất.
export default function Container({ className = "", children, ...props }) {
  return (
    <div
      className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
