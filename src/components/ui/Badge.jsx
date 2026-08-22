// Badge: dòng chữ nhỏ màu thương hiệu đặt NGAY TRÊN tiêu đề section
// (vd: "Sản phẩm", "Về chúng tôi").
//
// Trước đây đây là một viên thuốc có viền, có nền, có icon, chữ IN HOA giãn
// rộng. Bỏ hết: kiểu Apple thì dòng này chỉ là một câu ngắn tô màu thương hiệu,
// cùng cỡ với chữ thường. Nó dẫn vào tiêu đề chứ không tranh chỗ với tiêu đề.
// Bớt một viền, một mảng nền và một icon trên mỗi section — cộng lại là khác
// biệt lớn về độ sạch của cả trang.
//
// ĐỔI SANG MÀU NHẤN 22/08/2026. Một dòng sửa, nhưng nó chạy khắp site: mọi
// nhãn nhỏ trên đầu mọi section đều dùng component này. Trước đây nhãn, tiêu
// đề tô màu, đường dẫn và nút đều cùng một sắc chàm — đọc cả trang xuống chỉ
// thấy một màu, đúng lời chê "màu trông đơn điệu quá". Nay nhãn là lam ngọc,
// phần còn lại vẫn chàm: hai màu, và cái nào ra việc của cái đó.
//
// Màu nhấn đã đo đủ 4,5:1 trên CẢ nền trắng lẫn nền xám nhạt ở 10 bảng màu
// (scripts/kiem-tra-bang-mau.mjs) — nhãn này xuất hiện trên cả hai nền.
//
// Bỏ luôn prop `icon`. Nơi gọi đừng truyền nữa.
export default function Badge({ children, className = "" }) {
  return (
    <p
      className={`text-[1.0625rem] font-semibold leading-tight text-accent ${className}`}
    >
      {children}
    </p>
  );
}
