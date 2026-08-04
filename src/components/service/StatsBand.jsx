import Container from "../ui/Container.jsx";
import Reveal from "../ui/Reveal.jsx";

// StatsBand: dải số liệu nổi bật (3 con số lớn). Số liệu lấy từ dữ liệu THẬT
// của dự án (about.json / projects.json), truyền qua data — không bịa.
export default function StatsBand({ items = [] }) {
  return (
    <section className="relative overflow-hidden py-16 lg:py-20">
      {/* Vệt sáng tím mờ phía sau cho dải số liệu nổi lên */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-600/10 blur-3xl"
      />
      <Container className="relative">
        <div className="glass grid gap-8 rounded-3xl px-8 py-10 sm:grid-cols-3">
          {items.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.1} className="text-center">
              <p className="text-4xl font-black text-gradient sm:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm uppercase tracking-wider text-gray-400">
                {stat.label}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
