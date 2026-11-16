// ============================================================
// Chatbot của nền tảng iMob CMS (kho "iMob") — cấu hình và công tắc.
//
// Bot này KHÔNG chạy trong website. Website chỉ chèn khung chat của nền tảng
// (2 file widget.css + widget.min.js); tri thức, AI và lịch sử hội thoại nằm
// ở hệ thống iMob CMS. Quản lý tri thức: chatbot.imob.vn → Quản lý Tài liệu →
// thẻ "iMob".
//
// Tách khỏi ChatbotNenTang.jsx vì file .jsx chỉ nên xuất component (luật
// react-refresh), còn Layout.jsx cần gọi dungBotMoi().
// ============================================================

// Địa chỉ hệ thống chatbot. Từ 03/10/2026 nền tảng chạy trên hạ tầng iMob
// (máy CMC, thư mục /home/imob — anh Thắng quản lý) ở tên miền con riêng.
// Trước đó là imob.hangdaaodieu.com. ĐỪNG đặt nó chung tên miền imob.vn: /api/*
// của imob.vn là API của website, hệ thống chatbot cũng dùng /api/v1/….
export const GOC_BOT = "https://chatbot.imob.vn";

// Đổi số này khi nền tảng báo có bản khung chat mới — trình duyệt của khách sẽ
// tải bản mới thay vì dùng bản cũ đã lưu.
export const PHIEN_BAN_BOT = "20261003-chatbot-imob-vn";

// Khoá của kho "iMob". Khoá này VỐN CÔNG KHAI — khung chat nào cũng phải
// để nó trong mã trang. Thứ bảo vệ nó là danh sách tên miền cho phép bên nền
// tảng (kho "iMob" khai báo: imob.vn). ⚠️ Đừng nhầm với khoá Gemini — cái đó là
// bí mật và không bao giờ được nằm ở đây.
//
// Khoá của kho "iMob" trên hệ thống mới chatbot.imob.vn. Khoá của hệ thống cũ
// (imob_live_p6rk… kho Web iMob, imob_live_Zds… kho Yên Tử) bị hệ thống mới
// trả 401 — đã thử 03/10/2026.
export const KHOA_BOT = "imob_live_qBcBKkD7uOT7ljKaCAdaMQQzOmIwx3V";

// ============================================================
// CÔNG TẮC
//
//   "thu"        — chỉ ai mở link imob.vn/?bot=moi mới thấy bot mới (nhớ trong
//                  cả phiên, chuyển trang không mất). Mở ?bot=cu để quay lại.
//                  Khách bình thường vẫn thấy bot iMob cũ.
//   "chinh-thuc" — mọi khách đều thấy bot mới, bot cũ ẩn.
//
// Bật "chinh-thuc" ngày 01/10/2026. Cùng ngày đã cho www.imob.vn tự chuyển về
// imob.vn trong nginx: ô tên miền của nền tảng chỉ nhận MỘT tên miền, khách ở
// lại www sẽ bị nền tảng chặn (403). Đổi tên miền website thì nhớ cả hai chỗ.
//
// Muốn quay về bot cũ: đổi lại thành "thu" rồi đẩy lên — mã bot cũ vẫn còn
// nguyên (ChatWidget.jsx).
// ============================================================
export const CHE_DO_BOT = "chinh-thuc";

const KHOA_PHIEN = "imob_dung_bot_moi";

/** Trang hiện tại có dùng bot mới không. `search` là chuỗi "?bot=moi…". */
export function dungBotMoi(search) {
  if (CHE_DO_BOT === "chinh-thuc") return true;
  const q = new URLSearchParams(search).get("bot");
  try {
    if (q === "moi") sessionStorage.setItem(KHOA_PHIEN, "1");
    if (q === "cu") sessionStorage.removeItem(KHOA_PHIEN);
    return sessionStorage.getItem(KHOA_PHIEN) === "1";
  } catch {
    // Trình duyệt chặn sessionStorage (chế độ riêng tư…): vẫn thử được, chỉ là
    // chuyển trang thì phải mở lại link có ?bot=moi.
    return q === "moi";
  }
}

// ============================================================
// ĐIỀU KHIỂN KHUNG CHAT TỪ BÊN NGOÀI — dùng chung cho khung chat nổi
// (ChatbotNenTang.jsx) và trang chat cả màn hình (pages/HoiDapPage.jsx).
// Khung chat nằm ngoài React, mã bị làm rối, nên chỉ điều khiển được như
// người thật: bấm nút, điền ô nhập.
// ============================================================

/** Đang ở trang chat cả màn hình (khung chat được đặt vào giữa trang)? */
export function dangCaTrang() {
  return document.documentElement.dataset.chatCaTrang === "1";
}

// Các nút "Chat với AI" trên trang (Hero, About, ServiceHero…) gọi openChat()
// trong chatBus.js. Bot cũ tự nghe sự kiện đó; khung chat của nền tảng thì
// không biết gì về nó, nên mình mở hộ bằng cách bấm nút tròn của nó. Khách bấm
// lúc script còn đang tải thì chờ thêm tối đa ~5 giây.
export function moKhungChat(conLan = 25) {
  const nut = document.getElementById("imob-toggle-btn");
  if (nut) {
    if (!document.querySelector(".imob-chatbox.open")) nut.click();
    return;
  }
  if (conLan > 0) setTimeout(() => moKhungChat(conLan - 1), 200);
}

// Gửi một câu hỏi vào khung chat của nền tảng (ô "Hỏi ngay" ở trang Hỏi đáp
// AI). Khung chat nằm ngoài React và mã của nó bị làm rối, nên làm đúng như
// người thật: điền chữ vào ô nhập rồi bấm nút gửi. Id ô nhập và nút gửi đo trên
// khung chat thật ngày 13/11/2026: #imob-chat-input (textarea), #imob-send-btn.
//
// ⚠️ PHẢI gán giá trị qua "setter gốc" của textarea rồi phát sự kiện input.
// Gán thẳng `o.value = ...` thì chữ hiện lên nhưng nếu khung chat theo dõi ô
// nhập bằng sự kiện input, nó vẫn tưởng ô trống và nút gửi không làm gì.
// Nền tảng đổi id thì hàm này lặng lẽ chỉ còn MỞ khung chat (không gửi được) —
// khách vẫn tự gõ lại được, không hỏng trang.
export function guiCauHoi(cauHoi, conLan = 75) {
  const o = document.getElementById("imob-chat-input");
  const nutGui = document.getElementById("imob-send-btn");
  const khungMo = document.querySelector(".imob-chatbox.open");
  // Chờ cả LỜI CHÀO của bot hiện ra: gửi sớm hơn (khung vừa dựng, chưa khởi
  // động xong) thì câu hỏi bị hiện HAI lần — một lần trước lời chào, một lần
  // sau (thấy khi thử trang /hoi-dap ngày 16/11/2026).
  const daSan = document.querySelector("#imob-messages .imob-msg-bot");
  if (!o || !nutGui || !khungMo || !daSan) {
    if (conLan > 0) setTimeout(() => guiCauHoi(cauHoi, conLan - 1), 200);
    return;
  }
  const ganGoc = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set;
  ganGoc.call(o, cauHoi);
  o.dispatchEvent(new Event("input", { bubbles: true }));
  nutGui.click();
}
