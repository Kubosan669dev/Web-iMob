import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Phone } from "lucide-react";
import Button from "../ui/Button.jsx";
import Logo from "../ui/Logo.jsx";
import { NAV_ITEMS } from "../../utils/constants.js";
import { useCongTy } from "../../context/NoiDungContext.jsx";

// Hiệu ứng panel + stagger từng item
const panelVariants = {
  hidden: { x: "100%" },
  show: {
    x: 0,
    transition: { type: "tween", duration: 0.28, ease: "easeOut", when: "beforeChildren", staggerChildren: 0.05 },
  },
  exit: { x: "100%", transition: { type: "tween", duration: 0.22, ease: "easeIn" } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0 },
};

// MobileMenu: panel trượt từ phải, chỉ hiển thị < lg (hamburger ở Navbar).
// Ngưỡng là lg chứ không phải md: menu có 5 mục nhãn tiếng Việt, ở md xếp
// ngang là chật. Đổi ngưỡng ở đây thì phải đổi cả `lg:hidden` / `lg:flex`
// trong Navbar.jsx cho khớp.
export default function MobileMenu({ open, onClose, activeId }) {
  const congTy = useCongTy();

  // Khóa scroll body khi menu đang mở
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — bấm ra ngoài để đóng. Phủ màu mực pha loãng chứ không
              phủ đen: đen trên nền trắng cho ra một lớp xám bẩn. */}
          <motion.div
            className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-dvh w-[82%] max-w-sm flex-col bg-paper shadow-lift lg:hidden"
            variants={panelVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            aria-label="Menu di động"
          >
            {/* Header panel */}
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <Logo className="h-8 w-8" />
                <span className="text-[1.0625rem] font-semibold tracking-tight text-ink">
                  {congTy.name}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="-mr-2 rounded-lg p-2 text-ink-soft transition-colors hover:text-ink"
                aria-label="Đóng menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Danh sách link — chữ to hơn hẳn bản desktop: ngón tay cần vùng
                bấm rộng, và trên điện thoại menu chiếm gần trọn màn hình nên
                không phải tiết kiệm chỗ. */}
            <nav className="flex-1 overflow-y-auto px-5 py-6">
              {NAV_ITEMS.map((item) => (
                <motion.div key={item.id} variants={itemVariants} className="py-1">
                  <a
                    href={item.href}
                    onClick={onClose}
                    className={
                      "block py-2.5 text-2xl tracking-tight transition-colors " +
                      (item.id === activeId
                        ? "font-semibold text-brand"
                        : "font-medium text-ink hover:text-brand")
                    }
                  >
                    {item.label}
                  </a>

                  {/* Sub-link của Dịch vụ: liệt kê thẳng, không dropdown trên mobile */}
                  {item.children && (
                    <div className="mb-2 space-y-1 pl-4">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.to}
                          onClick={onClose}
                          className="block py-1.5 text-[0.9375rem] text-ink-soft transition-colors hover:text-brand"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </nav>

            {/* CTA dưới cùng — có cả nút GỌI vì thanh liên hệ trên cùng bị ẩn ở
                màn hình hẹp, không thì khách trên điện thoại phải cuộn hết
                trang xuống chân trang mới thấy số. */}
            <motion.div
              variants={itemVariants}
              className="space-y-2.5 border-t border-line p-5"
            >
              <Button
                href={`tel:${congTy.phone.replace(/\s/g, "")}`}
                className="w-full"
                onClick={onClose}
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                {congTy.phone}
              </Button>
              <Button
                href="/#contact"
                variant="outline"
                className="w-full"
                onClick={onClose}
              >
                Gửi yêu cầu tư vấn
              </Button>
            </motion.div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
