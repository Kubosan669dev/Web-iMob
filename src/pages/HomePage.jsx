import Hero from "../sections/Hero.jsx";

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
      <PlaceholderSection id="about" title="About" note="Sẽ xây ở Bước 4" />
      <PlaceholderSection id="services" title="Services" note="Sẽ xây ở Bước 4" />
      <PlaceholderSection id="projects" title="Projects" note="Sẽ xây ở Bước 5" />
      <PlaceholderSection id="chatbot" title="AI Chatbot" note="Sẽ xây ở Bước 6" />
      <PlaceholderSection id="contact" title="Contact" note="Sẽ xây ở Bước 5" />
    </>
  );
}
