import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import ChatWidget from "../chatbot/ChatWidget.jsx";

// Layout: khung chung của các trang chính — Navbar cố định + nội dung + Footer.
// ChatWidget đặt Ở ĐÂY (không phải trong HomePage) để nút nổi xuất hiện
// trên MỌI trang dùng Layout này, không biến mất khi chuyển route.
// (Trang /ui-kit đứng ngoài Layout vì là style guide nội bộ.)
export default function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
