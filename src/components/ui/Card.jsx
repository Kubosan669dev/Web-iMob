// Card: mặt card dùng chung.
//
// Kiểu Apple: bo góc LỚN, nền xám rất nhạt, KHÔNG viền, KHÔNG bóng.
// Thứ tách card khỏi nền là chênh lệch sắc độ giữa xám nhạt và trắng — chỉ
// vậy thôi. Bản trước dùng viền + bóng + nền kính mờ, ba lớp cùng làm một
// việc; bỏ cả ba, trang nhẹ hẳn.
//
// ⚠️ Card này phải đặt trên nền TRẮNG mới thấy. Ở section nền xám (bg-mist)
// thì dùng `className="bg-panel"` để đảo ngược lại.
//
//   hover=true → nền đậm thêm một bậc khi di chuột. Không phóng to, không
//                nhấc lên: chuyển động thừa làm giao diện trông rẻ tiền.
export default function Card({ hover = false, className = "", children, ...props }) {
  return (
    <div
      className={
        "rounded-block bg-mist p-7 transition-colors duration-200 sm:p-8 " +
        (hover ? "hover:bg-line/70 " : "") +
        className
      }
      {...props}
    >
      {children}
    </div>
  );
}
