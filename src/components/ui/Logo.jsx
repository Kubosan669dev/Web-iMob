// ============================================================
// Logo chính thức của iMob.
//
// ĐÂY LÀ TÀI SẢN NHẬN DIỆN, KHÔNG PHẢI MÀU TRANG TRÍ.
//
// Bản trước dựng logo bằng cách đặt file logo TRẮNG lên một ô nền `bg-brand`.
// Cách đó có một hậu quả không ai muốn: `bg-brand` đổi theo bảng màu, nên chọn
// bảng "Rose Lotus" là logo công ty thành hồng, chọn "Forest Zen" là thành
// xanh lá. Logo là thứ duy nhất trên trang KHÔNG được phép đổi màu.
//
// Cách làm hiện tại: dùng thẳng bản logo có sẵn ô nền của công ty
// (public/logo-imob-icon.png). Ảnh tự mang màu của nó nên không có biến CSS nào
// chạm tới được — đổi bảng màu bao nhiêu lần logo vẫn nguyên.
//
// Vì sao dùng bản CÓ Ô NỀN chứ không phải logo tím trên nền trong suốt: logo
// tím (#684df4) đặt trên nền của bảng tối chỉ đạt 3,57:1, mờ nhoè. Bản có ô nền
// mang theo nền riêng nên dấu trắng bên trong luôn đạt 5,31:1, ở bảng màu nào
// cũng vậy. Bốn góc ảnh trong suốt sẵn nên không cần bo góc bằng CSS.
//
// ⚠️ Đừng thêm class màu (text-*, bg-*) cho component này.
// ============================================================

/**
 * @param {string} className  Cỡ logo, mặc định 32px. Chỉ truyền cỡ, đừng truyền màu.
 * @param {string} alt        Để "" khi cạnh logo đã có tên công ty bằng chữ —
 *                            không thì trình đọc màn hình đọc tên hai lần.
 */
export default function Logo({ className = "h-8 w-8", alt = "" }) {
  return (
    <img
      src="/logo-imob-icon.png"
      alt={alt}
      width="512"
      height="512"
      className={`shrink-0 object-contain ${className}`}
    />
  );
}
