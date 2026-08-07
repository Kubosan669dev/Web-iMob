import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Zap, X } from "lucide-react";
import Button from "../ui/Button.jsx";
import { NAV_ITEMS, SITE } from "../../utils/constants.js";

// Hiệu ứng panel + stagger từng item
const panelVariants = {
  hidden: { x: "100%" },
  show: {
    x: 0,
    transition: { type: "tween", duration: 0.28, ease: "easeOut", when: "beforeChildren", staggerChildren: 0.06 },
  },
  exit: { x: "100%", transition: { type: "tween", duration: 0.22, ease: "easeIn" } },
};

const itemVariants = {
  hidden: { opacity: 0, x: 24 },
  show: { opacity: 1, x: 0 },
};

// MobileMenu: panel trượt từ phải, chỉ hiển thị < md (hamburger ở Navbar).
export default function MobileMenu({ open, onClose, activeId }) {
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
          {/* Backdrop mờ — bấm ra ngoài để đóng */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            className="fixed right-0 top-0 z-50 flex h-dvh w-[78%] max-w-xs flex-col border-l border-blue-500/20 bg-surface/95 backdrop-blur-2xl md:hidden"
            variants={panelVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            aria-label="Menu di động"
          >
            {/* Header panel */}
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
                  <img src="/logo-imob-white.png" alt="iMob" className="h-5 w-5" />
                </div>
                <p className="font-black text-white">{SITE.name}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Đóng menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Danh sách link */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
              {NAV_ITEMS.map((item) => (
                <motion.div key={item.id} variants={itemVariants}>
                  <a
                    href={item.href}
                    onClick={onClose}
                    className={
                      "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold tracking-wider transition-colors " +
                      (item.id === activeId
                        ? "border-purple-500/50 bg-purple-500/10 text-white"
                        : "border-transparent text-gray-300 hover:bg-white/5 hover:text-white")
                    }
                  >
                    {item.id === activeId && (
                      <Zap className="h-3.5 w-3.5 text-cyan-300" aria-hidden="true" />
                    )}
                    {item.label}
                  </a>

                  {/* Sub-link của SERVICES: liệt kê thẳng, không dropdown trên mobile */}
                  {item.children && (
                    <div className="mb-1 mt-1 space-y-0.5 border-l border-purple-500/20 pl-5">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.to}
                          onClick={onClose}
                          className="block rounded-lg px-3 py-2 text-xs text-gray-400 transition-colors hover:text-white"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </nav>

            {/* CTA dưới cùng */}
            <motion.div variants={itemVariants} className="border-t border-white/5 p-5">
              <Button href="/#contact" className="w-full" onClick={onClose}>
                Liên hệ
              </Button>
            </motion.div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
