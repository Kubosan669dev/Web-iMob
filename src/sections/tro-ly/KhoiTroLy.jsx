import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpenCheck,
  Bot,
  Braces,
  ChartLine,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  Database,
  Download,
  Files,
  Landmark,
  Library,
  Lock,
  MessageCircle,
  MessagesSquare,
  QrCode,
  Quote,
  RefreshCw,
  Rocket,
  Rotate3d,
  SearchX,
  Store,
  Users,
} from "lucide-react";
import Container from "../../components/ui/Container.jsx";

// ============================================================
// Các khối của trang "Trợ lý AI địa phương" (/tro-ly-ai-dia-phuong), dựng
// 16/11/2026 theo 4 ảnh mẫu công ty gửi: Thực trạng → Giải pháp → Đối tượng
// phục vụ → Quy trình 5 bước. Nội dung: servicePages.json → "local-ai".
//
// Câu chữ trong ảnh mẫu đã sửa cho đúng thực tế (xem _ghiChu_16_11 trong file
// dữ liệu). Tính năng chưa có KHÔNG có link, chỉ ghi "Sắp có…".
// ============================================================

const ICON = {
  files: Files,
  "search-x": SearchX,
  store: Store,
  landmark: Landmark,
  "messages-square": MessagesSquare,
  library: Library,
  compass: Compass,
  "qr-code": QrCode,
  "rotate-3d": Rotate3d,
  "chart-line": ChartLine,
  users: Users,
  database: Database,
  "message-circle": MessageCircle,
  "book-open-check": BookOpenCheck,
  "refresh-cw": RefreshCw,
};
const ICON_BUOC = [Download, Braces, Bot, ClipboardCheck, Rocket];

function Icon({ ten, className }) {
  const C = ICON[ten] ?? CheckCircle2;
  return <C className={className} aria-hidden="true" />;
}

function Eyebrow({ children, giua }) {
  return (
    <p
      className={
        "text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-soft " + (giua ? "text-center" : "")
      }
    >
      {children}
    </p>
  );
}

function TieuDeGiua({ badge, title, highlight, description }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <Eyebrow giua>{badge}</Eyebrow>
      <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-brand-deep sm:text-[2.5rem]">
        {title} {highlight && <em>{highlight}</em>}
      </h2>
      {description && <p className="mt-4 leading-relaxed text-ink-soft">{description}</p>}
    </div>
  );
}

const O_ICON = "flex h-10 w-10 items-center justify-center rounded-lg bg-mist text-ink";

/* ---------------- Đầu trang ---------------- */
export function DauTrang({ hero }) {
  return (
    <section className="relative overflow-hidden bg-paper pb-16 pt-28 sm:pt-32">
      <Container rong="max-w-6xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-line bg-panel/70 px-3.5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
          {hero.badge}
        </p>
        <h1 className="mt-6 max-w-3xl font-display text-[2.5rem] font-semibold leading-[1.1] text-brand-deep sm:text-[3.25rem]">
          {hero.title}
          <br />
          <em>{hero.highlight}</em>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">{hero.description}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/hoi-dap"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-tren-brand transition-colors hover:bg-brand-deep"
          >
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Dùng thử trợ lý
          </Link>
          <a
            href="#dang-ky"
            className="inline-flex items-center gap-2 rounded-lg bg-mist px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-line"
          >
            Đăng ký cho địa phương
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
        {hero.highlights?.length > 0 && (
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {hero.highlights.map((h) => (
              <li key={h.label} className="flex items-center gap-3 rounded-xl border border-line bg-panel px-4 py-3 text-sm text-ink">
                <Icon ten={h.icon} className="h-4 w-4 shrink-0 text-brand" />
                {h.label}
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}

/* ---------------- Thực trạng (ảnh 2) ---------------- */
export function ThucTrang({ d }) {
  return (
    <section className="bg-mist py-20 sm:py-24">
      <Container rong="max-w-6xl" className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
        <div>
          <Eyebrow>{d.badge}</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-brand-deep sm:text-[2.5rem]">
            {d.title}
          </h2>
          <p className="mt-4 leading-relaxed text-ink-soft">{d.description}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {d.items.map((it) => (
              <article key={it.title} className="rounded-xl bg-panel p-6 shadow-soft">
                <span className={O_ICON}>
                  <Icon ten={it.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold text-ink">{it.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{it.desc}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <figure className="flex flex-1 flex-col rounded-2xl bg-brand-deep p-8 text-tren-brand shadow-lift">
            <Quote className="h-8 w-8 text-accent-soft" aria-hidden="true" />
            <blockquote className="mt-5 font-display text-[1.75rem] font-semibold italic leading-snug sm:text-3xl">
              “{d.trich}”
            </blockquote>
            <p className="mt-6 text-sm leading-relaxed text-tren-brand/80">{d.trichMoTa}</p>
            <figcaption className="mt-auto flex items-center justify-between border-t border-tren-brand/15 pt-5 text-sm font-semibold">
              {d.trichNguoi}
              <CheckCircle2 className="h-5 w-5 text-accent-soft" aria-hidden="true" />
            </figcaption>
          </figure>
          {d.camKet && (
            <div className="flex items-start gap-4 rounded-xl bg-panel p-5 shadow-soft">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <BookOpenCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold text-ink">{d.camKet.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{d.camKet.desc}</p>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

/* ---------------- Giải pháp (ảnh 3) ---------------- */
export function GiaiPhap({ d }) {
  return (
    <section className="bg-paper py-20 sm:py-24">
      <Container rong="max-w-6xl">
        <TieuDeGiua badge={d.badge} title={d.title} description={d.description} />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {d.items.map((it) => (
            <article key={it.title} className="flex flex-col rounded-xl border border-line bg-panel p-7">
              <span className={O_ICON}>
                <Icon ten={it.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold text-ink">{it.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{it.desc}</p>
              <div className="mt-6 border-t border-line pt-4 text-[0.8125rem]">
                {it.link ? (
                  <Link to={it.link} className="inline-flex items-center gap-1 font-medium text-ink hover:text-brand">
                    {it.nhanLink}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                ) : (
                  <span className="text-ink-faint">{it.nhanLink}</span>
                )}
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------------- Đối tượng phục vụ (ảnh 4) ---------------- */
export function DoiTuong({ d }) {
  return (
    <section className="bg-mist py-20 sm:py-24">
      <Container rong="max-w-6xl">
        <TieuDeGiua badge={d.badge} title={d.title} highlight={d.highlight} description={d.description} />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {d.columns.map((c) => (
            <article key={c.title} className="flex flex-col overflow-hidden rounded-xl bg-panel shadow-soft">
              <div className="flex-1 p-7">
                <div className="flex items-start justify-between gap-3">
                  {c.tag && (
                    <span className="rounded bg-mist px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-ink-soft">
                      {c.tag}
                    </span>
                  )}
                  <Icon ten={c.icon} className="h-5 w-5 text-ink-soft" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-semibold leading-snug text-brand-deep">{c.title}</h3>
                <ul className="mt-5 space-y-3 border-t border-line pt-5">
                  {c.items.map((x) => (
                    <li key={x} className="flex gap-2.5 text-sm leading-relaxed text-ink-soft">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
              {c.quote && (
                <p className="border-t border-line bg-paper px-7 py-5 text-[0.8125rem] italic text-ink-soft">
                  “{c.quote}”
                </p>
              )}
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------------- Quy trình 5 bước (ảnh 5) ---------------- */
export function QuyTrinh({ d }) {
  return (
    <section className="bg-paper py-20 sm:py-24">
      <Container rong="max-w-6xl">
        <TieuDeGiua badge={d.badge} title={d.title} highlight={d.highlight} description={d.description} />
        {/* Đánh số là ĐÚNG ở đây: các bước có thứ tự thật, làm xong bước trước
            mới sang bước sau. */}
        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {d.steps.map((b, i) => {
            const IconBuoc = ICON_BUOC[i] ?? CheckCircle2;
            return (
              <li key={b.title} className="flex flex-col rounded-xl border border-line bg-panel p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-deep font-display text-sm font-semibold text-tren-brand">
                    {i + 1}
                  </span>
                  <IconBuoc className="h-4 w-4 text-ink-soft" aria-hidden="true" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-ink">{b.title}</h3>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-soft">{b.desc}</p>
              </li>
            );
          })}
        </ol>
        {d.duLieu && (
          <div className="mt-8 flex flex-col gap-4 rounded-xl bg-mist p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-3 text-sm leading-relaxed text-ink">
              <Lock className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <span>
                <strong>Dữ liệu của địa phương: </strong>
                {d.duLieu}
              </span>
            </p>
            <Link
              to="/privacy-policy"
              className="shrink-0 text-sm font-medium text-ink underline underline-offset-4 hover:text-brand"
            >
              Chính sách bảo mật →
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}
