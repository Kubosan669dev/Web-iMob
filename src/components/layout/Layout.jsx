import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

// Layout: khung chung của các trang chính — Navbar cố định + nội dung + Footer.
// (Trang /ui-kit đứng ngoài Layout vì là style guide nội bộ.)
export default function Layout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
