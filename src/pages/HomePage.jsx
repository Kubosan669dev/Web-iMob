import Hero from "../sections/Hero.jsx";
import Projects from "../sections/Projects.jsx";
import Services from "../sections/Services.jsx";
import About from "../sections/About.jsx";
import Contact from "../sections/Contact.jsx";
import ChonBangMau from "../components/ui/ChonBangMau.jsx";

// ============================================================
// HomePage — NĂM khối, không hơn (dựng lại 18/08/2026).
//
// Góp ý của công ty: trang chủ phải là một bộ slide CHÀO HÀNG LẦN ĐẦU, không
// phải hồ sơ năng lực. "Chi tiết về một sản phẩm để bán thì slide 20 trang
// không vấn đề gì, nhưng chào hàng lần đầu thì 4 đến 5 trang là tối đa."
//
//   1. Hero      — MỤC LỤC. Ai dừng ở đây vẫn biết đủ: làm gì, cho ai, đã chạy
//                  ở đâu, gọi số nào. Ai quan tâm mục nào thì bấm đi tiếp.
//   2. Sản phẩm  — bằng chứng. Khách lớn nhất của iMob là cơ quan nhà nước, và
//                  với nhóm đó câu hỏi đầu tiên luôn là "đã làm cho ai chưa".
//   3. Dịch vụ   — ba mảng, mỗi mảng có trang riêng cho ai muốn đọc kỹ.
//   4. Về iMob   — gộp Giới thiệu + Trợ lý AI (xem lý do trong About.jsx).
//   5. Liên hệ.
//
// Bản trước có SÁU khối và cuộn khoảng mười màn hình, trong đó riêng khối Giới
// thiệu đã tự nó là bốn slide.
//
// Nền các khối xen kẽ TRẮNG / XÁM NHẠT (paper ↔ mist) để chia trang thành từng
// dải — cách phân tách của apple.com, không dùng đường kẻ ngang. Hero giờ mở
// đầu bằng dải màu thương hiệu nên nhịp là: brand · trắng · xám · trắng · xám ·
// trắng. Chèn hay đổi chỗ khối thì nhớ kiểm lại nhịp này, hai dải cùng màu nằm
// cạnh nhau là mất ranh giới.
// ============================================================
export default function HomePage() {
  return (
    <>
      <Hero />
      <Projects />
      <Services />
      <About />
      <Contact />

      {/* Nút đổi bảng màu, góc dưới bên trái. CỐ Ý chỉ đặt ở trang chủ: đây là
          chỗ để xem thử thiết kế, không phải một tính năng của website. Bảng
          màu đã chọn lưu trong máy nên đi sang trang khác vẫn giữ nguyên. */}
      <ChonBangMau />
    </>
  );
}
