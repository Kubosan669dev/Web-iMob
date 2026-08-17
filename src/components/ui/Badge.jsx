// Badge: dòng chữ nhỏ màu thương hiệu đặt NGAY TRÊN tiêu đề section
// (vd: "Sản phẩm", "Về chúng tôi").
//
// Trước đây đây là một viên thuốc có viền, có nền, có icon, chữ IN HOA giãn
// rộng. Bỏ hết: kiểu Apple thì dòng này chỉ là một câu ngắn tô màu thương hiệu,
// cùng cỡ với chữ thường. Nó dẫn vào tiêu đề chứ không tranh chỗ với tiêu đề.
// Bớt một viền, một mảng nền và một icon trên mỗi section — cộng lại là khác
// biệt lớn về độ sạch của cả trang.
//
// Bỏ luôn prop `icon`. Nơi gọi đừng truyền nữa.
export default function Badge({ children, className = "" }) {
  return (
    <p
      className={`text-[1.0625rem] font-semibold leading-tight text-brand ${className}`}
    >
      {children}
    </p>
  );
}
