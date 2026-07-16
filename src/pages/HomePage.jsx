import Hero from "../sections/Hero.jsx";
import About from "../sections/About.jsx";
import Services from "../sections/Services.jsx";
import Projects from "../sections/Projects.jsx";
import Contact from "../sections/Contact.jsx";

// HomePage: ghép các section theo thứ tự kế hoạch.
// Placeholder còn lại sẽ được thay dần ở Bước 4-6.

function PlaceholderSection({ id, title, note }) {
  return (
    <section
      id={id}
      className="flex min-h-screen items-center justify-center border-b border-white/5"
    >
      <div className="text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-cyan-400">
          #{id}
        </p>
        <h2 className="mt-2 text-3xl font-black text-white">{title}</h2>
        <p className="mt-2 text-sm text-gray-500">{note}</p>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <Projects />
      <PlaceholderSection id="chatbot" title="AI Chatbot" note="Sẽ xây ở Bước 6" />
      <Contact />
    </>
  );
}
