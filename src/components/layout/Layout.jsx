import { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import ChatWidget from "../chatbot/ChatWidget.jsx";
import ChatbotNenTang from "../chatbot/ChatbotNenTang.jsx";
import PopupTroLyAo from "../chatbot/PopupTroLyAo.jsx";
import { CHE_DO_BOT, dungBotMoi } from "../chatbot/botNenTang.js";

// Layout: khung chung của các trang chính — Navbar cố định + nội dung + Footer.
// Nút chat đặt Ở ĐÂY (không phải trong HomePage) để nút nổi xuất hiện
// trên MỌI trang dùng Layout này, không biến mất khi chuyển route.
// (Trang /ui-kit đứng ngoài Layout vì là style guide nội bộ.)
//
// Tối đa MỘT bot được hiện: bot cũ của website (ChatWidget) hoặc bot của
// nền tảng iMob CMS (ChatbotNenTang). Hiện cả hai thì hai nút nổi đè lên nhau
// ở cùng góc phải. Bot nào được hiện — hay không bot nào — do công tắc
// CHE_DO_BOT trong botNenTang.js quyết định.

export default function Layout() {
  const { search } = useLocation();
  const botMoi = useMemo(() => dungBotMoi(search), [search]);

  // Chế độ "an": không có khung chat trên imob.vn. Thay vào đó là popup giới
  // thiệu trợ lý ảo, dẫn sang chatbot.imob.vn; nó cũng nhận luôn các nút
  // "Chat với AI" (openChat() trong chatBus.js), không thì bấm vào chẳng có gì.
  let bot;
  if (CHE_DO_BOT === "an") bot = <PopupTroLyAo />;
  else if (botMoi) bot = <ChatbotNenTang />;
  else bot = <ChatWidget />;

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      {bot}
    </>
  );
}
