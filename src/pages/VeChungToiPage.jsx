import Hero from "../sections/Hero.jsx";
import DoiTac from "../sections/DoiTac.jsx";
import Services from "../sections/Services.jsx";
import About from "../sections/About.jsx";
import Contact from "../sections/Contact.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";

// ============================================================
// VeChungToiPage — trang "Về chúng tôi" (/ve-chung-toi), từ 13/11/2026.
//
// ĐÂY LÀ TRANG CHỦ CŨ, chuyển nguyên sang. imob.vn đổi hướng thành trang Hỏi
// đáp AI cho địa phương (pages/HomePage.jsx mới) và gom mọi phần giới thiệu
// công ty vào đây, đúng như bản đề xuất đã duyệt. Các trang con (dịch vụ, tin
// tức, tour 360°) vẫn đi tới được từ các khối bên dưới.
//
// Link cũ dạng imob.vn/#about, /#contact… tự chuyển về đúng khối trên trang
// này (data/chuyenHuong.json → "neo").
//
// Phần ghi chú lịch sử bên dưới viết khi đây còn là trang chủ:
//
// HomePage cũ — NĂM khối, không hơn (dựng lại 18/08/2026).
//
// Góp ý của công ty: trang chủ phải là một bộ slide CHÀO HÀNG LẦN ĐẦU, không
// phải hồ sơ năng lực. "Chi tiết về một sản phẩm để bán thì slide 20 trang
// không vấn đề gì, nhưng chào hàng lần đầu thì 4 đến 5 trang là tối đa."
//
//   1. Hero      — MỤC LỤC. Ai dừng ở đây vẫn biết đủ: làm gì, cho ai, đã chạy
//                  ở đâu, gọi số nào. Ai quan tâm mục nào thì bấm đi tiếp.
//                  (Khối Sản phẩm cũ đã gộp vào đây — xem ghi chú bên dưới.)
//   2. Đối tác   — MỘT DÒNG chạy ngang, không phải một khối. Thêm 22/08/2026.
//                  Nó trả lời câu hỏi bật ra ngay sau khi xem xong dự án —
//                  "làm cho những ai" — nên không tính là một slide mới.
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
export default function VeChungToiPage() {
  useDocumentTitle("Về chúng tôi | iMob — Công nghệ và Giải pháp");
  return (
    <>
      <Hero />
      {/* ĐÃ BỎ <Projects /> ngày 20/08/2026. Công ty: "xóa hết cả sản phẩm đi
          e / bên trên có dự án nổi bật tự chuyển động rồi / để to chình ình
          luôn."

          Đúng: khối Hero đã có băng chuyền chạy qua từng dự án kèm ảnh, mô tả,
          nút mở thử và mã QR. Khối Sản phẩm bên dưới vẽ LẠI đúng sáu dự án đó
          một lần nữa, chỉ khác cách bày — tức là bắt khách cuộn qua một màn
          hình để đọc lại thứ vừa xem xong.

          Dữ liệu KHÔNG mất: cả hai chỗ cùng đọc khoá `projects` trong CMS, nên
          sửa trong /admin → Sản phẩm vẫn hiện ra ở băng chuyền như cũ.
          File src/sections/Projects.jsx đã xoá 12/11/2026 khi dọn dự án; cần
          lại thì lấy từ lịch sử git. */}

      {/* Dải tên đối tác chạy ngang — thêm 22/08/2026, đúng chỗ công ty dặn:
          "ở trên phần dịch vụ mình để chạy 1 dòng các đối tác và đơn vị đã
          triển khai dự án cùng mình nhé".

          Đặt giữa Hero và Công nghệ có lý của nó, không chỉ là làm theo lời:
          khách vừa xem xong sáu dự án ở khối trên, câu hỏi tiếp theo trong đầu
          họ là "làm cho những ai" — dải này trả lời đúng câu đó, rồi mới tới
          phần chào hàng dịch vụ. Đặt sau phần dịch vụ thì thành lời khoe muộn.

          Nhịp nền vẫn đúng: khối này nền XÁM, Hero phía trên và Công nghệ phía
          dưới đều nền TRẮNG. */}
      <DoiTac />
      <Services />
      <About />
      <Contact />

      {/* Nút đổi bảng màu (ChonBangMau) đã bỏ khỏi trang này 13/11/2026: giao
          diện mới đã chốt một bảng màu. Đổi bảng màu ở /admin → Giao diện. */}
    </>
  );
}
