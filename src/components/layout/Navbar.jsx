import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, Phone, Mail, Clock } from "lucide-react";
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

/* ---------- Thanh liên hệ trên cùng ----------
   Số điện thoại và giờ làm việc là hai thứ khách doanh nghiệp và cán bộ cơ
   quan tìm nhiều nhất, mà trước đây chỉ có ở tận chân trang.

   Đây là chỗ CỐ Ý đi lệch khỏi apple.com: Apple không có thanh này vì họ bán
   hàng qua cửa hàng và website, còn iMob bán qua gặp gỡ và điện thoại. Bù lại
   thanh được làm đúng tinh thần Apple — mỏng, nền xám nhạt, chữ 12px, không
   viền không màu mè, để nó không tranh chỗ với nội dung.

   Luôn hiện chứ không ẩn khi cuộn: ẩn/hiện làm header co giãn, trang nhấp
   nháy mỗi lần cuộn qua ngưỡng. Cao 32px thì để luôn cho yên.
   Ẩn dưới sm vì ba mục xếp ngang không đủ chỗ trên màn hình hẹp — ở đó đã có
   nút gọi trong menu di động. */
function ThanhLienHe({ congTy }) {
  return (
    <div className="hidden border-b border-line bg-mist sm:block">
      <Container className="flex h-8 items-center justify-between gap-6 text-xs text-ink-soft">
        <div className="flex items-center gap-5">
          <a
            href={`tel:${congTy.phone.replace(/\s/g, "")}`}
            className="flex items-center gap-1.5 font-medium text-ink transition-colors hover:text-brand"
          >
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            {congTy.phone}
          </a>
          <a
            href={`mailto:${congTy.email}`}
            className="hidden items-center gap-1.5 transition-colors hover:text-brand md:flex"
          >
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            {congTy.email}
          </a>
        </div>
        <p className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {congTy.workingHours}
        </p>
      </Container>
    </div>
  );
}

// Một item trên menu desktop; item có children sẽ kèm dropdown (mở bằng CSS group-hover)
function NavItem({ item, active }) {
  return (
    <div className="group relative">
      <a
        href={item.href}
        className={
          "flex items-center gap-1 px-3 py-2 text-[0.8125rem] transition-colors duration-200 " +
          (active ? "font-medium text-ink" : "text-ink-soft hover:text-ink")
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
      <ThanhLienHe congTy={congTy} />

      {/* Thanh điều hướng LUÔN mờ đục, không đổi trạng thái theo cuộn — giống
          apple.com. Bản trước để trong suốt khi ở đầu trang rồi mới hiện nền
          lúc cuộn; đổi trạng thái như vậy làm header nhấp nháy mỗi lần cuộn
          qua ngưỡng, và ở đầu trang thì menu chữ xám nằm trên nền trắng trơn
          trông như bị bỏ quên. */}
      <div className="border-b border-line bg-paper/80 backdrop-blur-xl">
        <Container className="flex h-14 items-center justify-between">
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
