import { Link } from "react-router-dom";
import { ShieldCheck, ChevronLeft } from "lucide-react";
import Container from "../components/ui/Container.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import { useCongTy, useTrangPhapLy } from "../context/NoiDungContext.jsx";

// LegalPage: trang văn bản pháp lý (Chính sách bảo mật / Điều khoản dịch vụ).
// Một component dùng chung, chọn nội dung theo `slug` — dữ liệu ở legalPages.json.
// prose-style tự viết (không dùng plugin) cho hợp nền tối của site.
export default function LegalPage({ slug }) {
  const congTy = useCongTy();
  const legalPages = useTrangPhapLy();
  const page = legalPages[slug];
  useDocumentTitle(page ? `${page.title} — ${congTy.name}` : congTy.name);

  // Slug lạ (không có trong dữ liệu) — hiếm khi xảy ra, nhưng chặn cho chắc.
  if (!page) {
    return (
      <section className="py-32">
        <Container>
          <p className="text-center text-gray-400">Không tìm thấy nội dung.</p>
        </Container>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden py-28 lg:py-32">
      {/* Glow nhẹ phía trên cho đỡ trơ, đồng bộ các trang khác */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-purple-600/10 blur-3xl"
      />

      <Container className="relative max-w-3xl">
        {/* ---------- Tiêu đề ---------- */}
        <header className="mb-12 border-b border-white/10 pb-8">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-300">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {page.eyebrow}
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            {page.title}
          </h1>
          <p className="mt-1 text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
            {page.subtitle}
          </p>
          <p className="mt-4 text-xs text-gray-500">{page.effective}</p>
        </header>

        {/* ---------- Mở đầu ---------- */}
        {page.intro && (
          <p className="mb-10 text-base leading-relaxed text-gray-300">
            {page.intro}
          </p>
        )}

        {/* ---------- Các mục ---------- */}
        <div className="space-y-10">
          {page.sections.map((sec, i) => (
            <div key={sec.heading}>
              <h2 className="mb-3 flex items-baseline gap-3 text-lg font-bold text-white">
                <span className="font-mono text-sm text-purple-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {sec.heading}
              </h2>

              {sec.intro && (
                <p className="mb-3 text-sm leading-relaxed text-gray-400">
                  {sec.intro}
                </p>
              )}

              {sec.items && (
                <ul className="space-y-2.5">
                  {sec.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-sm leading-relaxed text-gray-300"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {sec.paragraphs &&
                sec.paragraphs.map((p) => (
                  <p key={p} className="mb-3 text-sm leading-relaxed text-gray-300">
                    {p}
                  </p>
                ))}

              {sec.note && (
                <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-gray-400">
                  {sec.note}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* ---------- Quay lại ---------- */}
        <div className="mt-14 border-t border-white/10 pt-8">
          <Link
            to="/#home"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300 transition-colors hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Về trang chủ
          </Link>
        </div>
      </Container>
    </section>
  );
}
