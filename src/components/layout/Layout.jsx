import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import ChatbotNenTang from "../chatbot/ChatbotNenTang.jsx";
import NutHoiAI from "../chatbot/NutHoiAI.jsx";
import useTaiKhoan from "../../hooks/useTaiKhoan.js";
import { onOpenChat } from "../../utils/chatBus.js";

// Layout: khung chung của các trang chính — Navbar cố định + nội dung + Footer.
// Nút nổi đặt Ở ĐÂY để nó có trên MỌI trang dùng Layout này.
//
// 18/11/2026 (yêu cầu người dùng): BỎ khung chat popup. Mọi trang chỉ có nút
// nổi "Hỏi trợ lý AI" dẫn tới trang chat cả màn hình /hoi-dap/:diaPhuong, và
// chỉ người ĐÃ ĐĂNG NHẬP mới thấy khung chat ở đó (chưa đăng nhập: ô báo
// "phải đăng nhập", xem sections/hoi-dap/CanDangNhap.jsx).
//
// Script khung chat của nền tảng (ChatbotNenTang) vì thế chỉ được nạp khi
// đang ở /hoi-dap và đã đăng nhập. Rời trang thì nó tự giấu (xem đầu
// ChatbotNenTang.jsx). Bot cũ của website (ChatWidget) không còn hiện ở đâu.
//
// Các nút "Chat với AI" trong trang (openChat ở utils/chatBus.js) nay chuyển
// sang trang chat, mang theo câu hỏi nếu có.
export default function Layout() {
  const { pathname } = useLocation();
  const diTiep = useNavigate();
  const nguoi = useTaiKhoan();
  const oTrangChat = pathname.startsWith("/hoi-dap");
  // Trang tour 360°: tour chiếm trọn màn hình và có nút toàn màn hình ở góc
  // phải dưới, đúng chỗ nút nổi. Để cả hai thì nút kia bị đè.
  const anNut = oTrangChat || pathname === "/tour-360";

  useEffect(
    () =>
      onOpenChat((cauHoi) =>
        diTiep(`/hoi-dap/yen-tu${cauHoi ? `?hoi=${encodeURIComponent(cauHoi)}` : ""}`),
      ),
    [diTiep],
  );

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      {oTrangChat && nguoi && <ChatbotNenTang />}
      {!anNut && <NutHoiAI />}
    </>
  );
}
