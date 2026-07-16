import { motion } from "motion/react";

// Reveal: hiệu ứng trồi lên khi CUỘN TỚI, chạy đúng 1 lần (viewport once).
// Dùng chung cho mọi section — tránh lặp boilerplate motion.
//   delay : trễ (giây) để tạo nhịp so le giữa các phần tử cạnh nhau
//   y     : khoảng cách trồi lên (px)
export default function Reveal({ delay = 0, y = 28, className = "", children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
