import Hero from "../sections/Hero.jsx";
import About from "../sections/About.jsx";
import Services from "../sections/Services.jsx";
import ChatbotIntro from "../sections/ChatbotIntro.jsx";
import Contact from "../sections/Contact.jsx";

// HomePage: ghép các section theo đúng thứ tự kế hoạch (KE-HOACH.md).
export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <ChatbotIntro />
      <Contact />
    </>
  );
}
