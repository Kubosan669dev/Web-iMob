import Hero from "../sections/Hero.jsx";
import Projects from "../sections/Projects.jsx";
import Services from "../sections/Services.jsx";
import About from "../sections/About.jsx";
import ChatbotIntro from "../sections/ChatbotIntro.jsx";
import Contact from "../sections/Contact.jsx";

// HomePage: ghép các section của trang chủ.
//
// Thứ tự: Hero → SẢN PHẨM → Dịch vụ → Giới thiệu → Trợ lý AI → Liên hệ.
// Sản phẩm đứng ngay sau Hero, trước cả Dịch vụ. Khách hàng lớn nhất của iMob
// là cơ quan nhà nước, và với nhóm khách đó câu hỏi đầu tiên luôn là "đã làm
// cho ai chưa" — Yên Tử, Bảo tàng tỉnh, Đông Triều, An Sinh trả lời được câu
// đó thì mọi lời tự giới thiệu phía sau mới có sức nặng.
//
// Nền các section xen kẽ TRẮNG / XÁM NHẠT (paper ↔ mist) để chia trang thành
// từng dải — đó là cách phân tách của apple.com, không dùng đường kẻ ngang.
// Thứ tự nền: trắng · xám · trắng · xám · trắng · xám · (footer trắng).
// Chèn hay đổi chỗ section thì nhớ kiểm lại nhịp này, hai dải cùng màu nằm
// cạnh nhau là mất ranh giới.
export default function HomePage() {
  return (
    <>
      <Hero />
      <Projects />
      <Services />
      <About />
      <ChatbotIntro />
      <Contact />
    </>
  );
}
