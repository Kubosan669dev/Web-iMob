import { useState } from "react";
import { Link } from "react-router-dom";
import { Zap, ChevronDown, Menu } from "lucide-react";
import Container from "../ui/Container.jsx";
import Button from "../ui/Button.jsx";
import MobileMenu from "./MobileMenu.jsx";
import useScrollPosition from "../../hooks/useScrollPosition.js";
import useActiveSection from "../../hooks/useActiveSection.js";
import { NAV_ITEMS, SITE } from "../../utils/constants.js";

// Mảng id section — khai báo ngoài component để tham chiếu ổn định
// (useActiveSection phụ thuộc vào nó, xem comment trong hook)
const SECTION_IDS = NAV_ITEMS.map((item) => item.id);

// Một item trên menu desktop; item có children sẽ kèm dropdown (mở bằng CSS group-hover)
function NavItem({ item, active }) {
  return (
    <div className="group relative">
      <a
        href={item.href}
        className={
          "flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold tracking-wider transition-all duration-300 " +
          (active
            ? "border-purple-500/50 bg-purple-500/10 text-white"
            : "border-transparent text-gray-300 hover:bg-white/5 hover:text-white")
        }
      >
        {/* Icon tia sét chỉ hiện ở item đang active (theo spec) */}
        {active && <Zap className="h-3 w-3 text-cyan-300" aria-hidden="true" />}
        {item.label}
        {item.children && (
          <ChevronDown
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180"
            aria-hidden="true"
          />
        )}
      </a>

      {/* Dropdown (chỉ item có children). pt-2 tạo "cầu" hover không bị hụt */}
      {item.children && (
        <div className="invisible absolute left-1/2 top-full -translate-x-1/2 translate-y-1 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
          <div className="glass w-64 rounded-xl p-2 shadow-xl shadow-black/40">
            {item.children.map((child) => (
              <Link
                key={child.label}
                to={child.to}
                className="block rounded-lg px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-purple-500/10 hover:text-white"
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const scrolled = useScrollPosition(24);
  const activeId = useActiveSection(SECTION_IDS);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className={
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 " +
        (scrolled
          ? "border-b border-blue-500/15 bg-night/80 shadow-lg shadow-black/30 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent")
      }
    >
      <Container className="flex h-16 items-center justify-between lg:h-[72px]">
        {/* ---------- Logo ---------- */}
        <a href="/#home" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 transition-shadow duration-300 group-hover:shadow-glow-purple">
            <img src="/logo-imob-white.png" alt="iMob" className="h-6 w-6" />
          </div>
          <div className="leading-tight">
            <p className="text-lg font-black text-white">{SITE.name}</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-gray-400">
              {SITE.tagline}
            </p>
          </div>
        </a>

        {/* ---------- Menu desktop ---------- */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Menu chính">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.id} item={item} active={item.id === activeId} />
          ))}
        </nav>

        {/* ---------- Bên phải: CTA + hamburger ---------- */}
        <div className="flex items-center gap-3">
          <Button href="/#contact" size="sm" className="hidden md:inline-flex">
            Liên hệ
          </Button>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-gray-300 transition-colors hover:bg-white/5 hover:text-white md:hidden"
            aria-label="Mở menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </Container>

      {/* ---------- Menu mobile (slide panel) ---------- */}
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        activeId={activeId}
      />
    </header>
  );
}
