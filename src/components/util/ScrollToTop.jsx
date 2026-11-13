import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// ScrollToTop: khi CHUYỂN TRANG (đổi pathname) bằng <Link>, React Router
// KHÔNG tự cuộn lên đầu — người dùng đang cuộn giữa trang cũ sẽ rơi vào
// giữa trang mới. Component này cuộn lên đầu mỗi lần đổi pathname.
//
// URL có #hash (vd /ve-chung-toi#contact) thì cuộn tới ĐÚNG KHỐI đó.
// Trình duyệt chỉ tự làm việc này khi tải hẳn trang; còn khi đi bằng router
// (chuyển hướng link cũ imob.vn/#contact -> /ve-chung-toi#contact, hoặc bấm
// <Link>) thì không ai cuộn cả. Trang đích lại tải lười (lazy) nên khối có
// thể chưa có ngay — thử lại vài lần trong ~3 giây rồi thôi.
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    let conLan = 15;
    let hen;
    const tim = () => {
      const khoi = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (khoi) khoi.scrollIntoView();
      else if (conLan-- > 0) hen = setTimeout(tim, 200);
    };
    tim();
    return () => clearTimeout(hen);
  }, [pathname, hash]);

  return null;
}
