import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu } from "lucide-react";
import Container from "../ui/Container.jsx";
import Logo from "../ui/Logo.jsx";
import Button from "../ui/Button.jsx";
import MobileMenu from "./MobileMenu.jsx";
import useActiveSection from "../../hooks/useActiveSection.js";
import { NAV_ITEMS } from "../../utils/constants.js";
import { useCongTy } from "../../context/NoiDungContext.jsx";

// Mảng id section — khai báo ngoài component để tham chiếu ổn định
// (useActiveSection phụ thuộc vào nó, xem comment trong hook)
const SECTION_IDS = NAV_ITEMS.map((item) => item.id);

/* ---------- ĐÃ GỠ: thanh liên hệ trên cùng (19/08/2026) ----------
   Trước đây có một dải mỏng phía trên thanh menu, hiện số điện thoại, email và
   giờ làm việc.

   Gỡ theo góp ý của công ty: ngay bên phải thanh menu đã có nút "Nhận tư vấn",
   bấm vào là ra đủ số điện thoại, email và địa chỉ văn phòng — nên dải kia
   thành thừa, chỉ tổ đẩy nội dung chính xuống thấp thêm 33px.

   ⚠️ Việc này làm THANH MENU THẤP ĐI, và có ba chỗ đang tính theo chiều cao đó:
     • styles/index.css     -> section[id] { scroll-margin-top }
     • sections/Hero.jsx    -> padding-top của dải màu thương hiệu
     • chatbot/ChatWidget.jsx -> sm:max-h của khung chat (nếu sai, khung chat
       chui xuống dưới menu và mất luôn nút đóng — đã dính lỗi này một lần)
   Sửa chiều cao menu thì phải xem lại cả ba chỗ trên.
   ---------------------------------------------------------------- */

// Một item trên menu desktop; item có children sẽ kèm dropdown (mở bằng CSS group-hover)
function NavItem({ item, active }) {
  return (
    <div className="group relative">
      <a
        href={item.href}
        className={
          "flex items-center gap-1 px-3.5 py-2 text-[0.9375rem] font-medium transition-colors duration-200 " +
          (active ? "text-brand" : "text-ink-soft hover:text-ink")
        }
      >
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
          <div className="w-72 rounded-2xl bg-panel p-2 shadow-lift">
            {item.children.map((child) => (
              <Link
                key={child.label}
                to={child.to}
                className="block rounded-xl px-4 py-2.5 text-sm text-ink-soft transition-colors hover:bg-mist hover:text-ink"
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
  const congTy = useCongTy();
  const activeId = useActiveSection(SECTION_IDS);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">

      {/* Thanh điều hướng LUÔN mờ đục, không đổi trạng thái theo cuộn — giống
          apple.com. Bản trước để trong suốt khi ở đầu trang rồi mới hiện nền
          lúc cuộn; đổi trạng thái như vậy làm header nhấp nháy mỗi lần cuộn
          qua ngưỡng, và ở đầu trang thì menu chữ xám nằm trên nền trắng trơn
          trông như bị bỏ quên. */}
      <div className="border-b border-line bg-paper/80 backdrop-blur-xl">
        <Container className="flex h-16 items-center justify-between">
          {/* ---------- Logo ----------
              Logo dùng ảnh chính thức có sẵn ô nền, KHÔNG tự dựng ô nền bằng
              bg-brand nữa: bg-brand đổi theo bảng màu, mà logo công ty thì
              không được phép đổi màu. Xem components/ui/Logo.jsx. */}
          <a href="/#home" className="flex items-center gap-2.5">
            <Logo className="h-8 w-8" />
            <span className="text-[1.0625rem] font-semibold tracking-tight text-ink">
              {congTy.name}
            </span>
          </a>

          {/* ---------- Menu desktop ---------- */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Menu chính">
            {NAV_ITEMS.map((item) => (
              <NavItem key={item.id} item={item} active={item.id === activeId} />
            ))}
          </nav>

          {/* ---------- Bên phải: CTA + hamburger ---------- */}
          <div className="flex items-center gap-3">
            <Button href="/#contact" size="sm" className="hidden lg:inline-flex">
              Nhận tư vấn
            </Button>
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

      {/* ---------- Menu mobile (slide panel) ---------- */}
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        activeId={activeId}
      />
    </header>
  );
}
