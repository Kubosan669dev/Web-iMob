import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BadgeCheck, Menu } from "lucide-react";
import Container from "../ui/Container.jsx";
import Logo from "../ui/Logo.jsx";
import MobileMenu from "./MobileMenu.jsx";
import { NAV_ITEMS, NUT_DANG_KY } from "../../utils/constants.js";
import { useCongTy } from "../../context/NoiDungContext.jsx";

// ============================================================
// Thanh menu — giao diện công ty chốt 13/11/2026.
//
// Ba cụm: logo bên trái, HAI mục giữa (Hỏi đáp AI · Về chúng tôi), nút
// "Đăng ký cho địa phương" bên phải.
//
// So với ảnh mẫu, CỐ Ý bỏ hai thứ:
//   • Nút đổi ngôn ngữ "VN": website chưa có bản dịch nào, bấm vào chẳng đổi
//     được gì.
//   • Ảnh đại diện người dùng: phần tài khoản thành viên đã gỡ 12/11/2026.
//
// ⚠️ Chiều cao thanh menu (h-16 = 64px) đang được tính ở
// styles/index.css -> section[id] { scroll-margin-top }. Đổi chiều cao thì
// sửa cả chỗ đó, không thì bấm neo bị menu che mất tiêu đề.
// ============================================================

function dangMo(item, pathname) {
  return item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
}

export default function Navbar() {
  const congTy = useCongTy();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="border-b border-line/70 bg-paper/85 backdrop-blur-xl">
        <Container rong="max-w-6xl" className="grid h-16 grid-cols-[1fr_auto] items-center lg:grid-cols-[1fr_auto_1fr]">
          {/* Logo: ảnh chính thức, không đổi màu theo bảng màu (xem ui/Logo.jsx) */}
          <Link to="/" className="flex items-center gap-2.5 justify-self-start">
            <Logo className="h-8 w-8" />
            <span className="text-[1.0625rem] font-semibold tracking-tight text-ink">{congTy.name}</span>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex" aria-label="Menu chính">
            {NAV_ITEMS.map((item) => {
              const mo = dangMo(item, pathname);
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  aria-current={mo ? "page" : undefined}
                  className={
                    "relative px-4 py-2 text-[0.9375rem] font-medium transition-colors " +
                    (mo ? "text-ink" : "text-ink-soft hover:text-ink")
                  }
                >
                  {item.label}
                  {mo && (
                    <span
                      className="absolute inset-x-4 -bottom-[1px] h-0.5 rounded-full bg-brand"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center justify-self-end gap-1">
            <a
              href={NUT_DANG_KY.href}
              className="hidden items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-tren-brand transition-colors hover:bg-brand-deep lg:inline-flex"
            >
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              {NUT_DANG_KY.label}
            </a>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="-mr-2 rounded-lg p-2 text-ink-soft transition-colors hover:text-ink lg:hidden"
              aria-label="Mở menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </Container>
      </div>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} pathname={pathname} />
    </header>
  );
}
