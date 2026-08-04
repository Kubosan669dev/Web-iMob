import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// ScrollToTop: khi CHUYỂN TRANG (đổi pathname) bằng <Link>, React Router
// KHÔNG tự cuộn lên đầu — người dùng đang cuộn giữa trang cũ sẽ rơi vào
// giữa trang mới. Component này cuộn lên đầu mỗi lần đổi pathname.
//
// Ngoại lệ: nếu URL có #hash (vd /#contact khi bấm menu từ trang con), thì
// KHÔNG cuộn lên đầu — để trình duyệt tự cuộn tới đúng section theo hash.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
