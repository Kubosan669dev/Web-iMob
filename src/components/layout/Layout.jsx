import { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import ChatWidget from "../chatbot/ChatWidget.jsx";
import ChatbotNenTang from "../chatbot/ChatbotNenTang.jsx";
import { dungBotMoi } from "../chatbot/botNenTang.js";

// Layout: khung chung của các trang chính — Navbar cố định + nội dung + Footer.
// Nút chat đặt Ở ĐÂY (không phải trong HomePage) để nút nổi xuất hiện
// trên MỌI trang dùng Layout này, không biến mất khi chuyển route.
// (Trang /ui-kit đứng ngoài Layout vì là style guide nội bộ.)
//
// Hai bot, CHỈ MỘT được hiện: bot cũ của website (ChatWidget) hoặc bot của
// nền tảng iMob CMS (ChatbotNenTang). Hiện cả hai thì hai nút nổi đè lên nhau
// ở cùng góc phải. Bot nào được hiện do công tắc trong botNenTang.js quyết định.
export default function Layout() {
  const { search, pathname } = useLocation();
  const botMoi = useMemo(() => dungBotMoi(search), [search]);
  // Trang tour 360°: tour chiếm trọn màn hình và có nút toàn màn hình ở góc
  // phải dưới — đúng chỗ nút chat nổi. Để cả hai thì nút chat đè mất nút kia.
  const anChat = pathname === "/tour-360";

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      {anChat ? null : botMoi ? <ChatbotNenTang /> : <ChatWidget />}
    </>
  );
}
