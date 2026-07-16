import { useEffect, useState } from "react";

// useScrollPosition: trả về true khi trang đã cuộn quá `threshold` px.
// Dùng cho Navbar: đầu trang trong suốt → cuộn xuống thì nền tối + blur.
export default function useScrollPosition(threshold = 24) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll(); // tính ngay lần đầu (trường hợp load trang ở giữa)
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return scrolled;
}
