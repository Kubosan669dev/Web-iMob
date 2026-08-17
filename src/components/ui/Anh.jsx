import { useState } from "react";

/* ================= Anh =================
   Thẻ ảnh TỰ BIẾN MẤT khi không tải được file.

   Vì sao cần: ảnh của dự án nằm trong public/ và được điền đường dẫn qua file
   dữ liệu JSON. Nếu ai đó gõ sai tên file, hoặc điền đường dẫn trước khi kịp
   bỏ file vào, thẻ <img> thường sẽ hiện biểu tượng "ảnh vỡ" — xấu hơn hẳn so
   với việc không có ảnh nào. Component này bắt sự kiện onError rồi trả về null,
   nên bố cục tự thu lại đúng như lúc chưa có ảnh.

   `boc` là class của thẻ bọc ngoài (khung, bo góc, nền chờ...). Đặt thẻ bọc
   BÊN TRONG component chứ không phải bên ngoài là có lý do: ảnh hỏng thì cả
   khung bọc cũng biến mất, không để lại một ô trống lơ lửng giữa trang.

   Ảnh trang trí thì truyền alt="" (chuỗi rỗng) để trình đọc màn hình bỏ qua.
*/
export default function Anh({ src, alt = "", boc = "", className = "", onXong, ...props }) {
  const [loi, setLoi] = useState(false);

  if (!src || loi) return null;

  const img = (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setLoi(true)}
      onLoad={onXong}
      className={className}
      {...props}
    />
  );

  return boc ? <div className={boc}>{img}</div> : img;
}
