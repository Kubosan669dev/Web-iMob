// ============================================================
// Chatbot của nền tảng iMob CMS (kho "Web iMob") — cấu hình và công tắc.
//
// Bot này KHÔNG chạy trong website. Website chỉ chèn khung chat của nền tảng
// (2 file widget.css + widget.min.js); tri thức, AI và lịch sử hội thoại nằm
// ở hệ thống iMob CMS. Quản lý tri thức: imob.hangdaaodieu.com → Quản lý tài
// liệu → Web iMob.
//
// Tách khỏi ChatbotNenTang.jsx vì file .jsx chỉ nên xuất component (luật
// react-refresh), còn Layout.jsx cần gọi dungBotMoi().
// ============================================================

// Địa chỉ hệ thống chatbot. Khi nền tảng chuyển sang hạ tầng iMob thì CHỈ đổi
// dòng này — nhưng ĐỪNG đặt nó chung tên miền imob.vn: /api/* của imob.vn là
// API của website (đăng nhập, bài viết…), hệ thống chatbot cũng dùng /api/v1/…
// nên hai bên sẽ đụng nhau. Dùng tên miền con, ví dụ chatbot.imob.vn.
export const GOC_BOT = "https://imob.hangdaaodieu.com";

// Đổi số này khi nền tảng báo có bản khung chat mới — trình duyệt của khách sẽ
// tải bản mới thay vì dùng bản cũ đã lưu.
export const PHIEN_BAN_BOT = "20260926-suggestions-3";

// Khoá của kho "Web iMob". Khoá này VỐN CÔNG KHAI — khung chat nào cũng phải
// để nó trong mã trang. Thứ bảo vệ nó là danh sách tên miền cho phép bên nền
// tảng (hiện khai báo: imob.vn). ⚠️ Đừng nhầm với khoá Gemini — cái đó là bí
// mật và không bao giờ được nằm ở đây.
//
// Khoá imob_live_Zds… là của kho Yên Tử, không phải của kho này.
export const KHOA_BOT = "imob_live_p6rkc41dBMhR6gUEG87df1D6uaxQMC4";

// ============================================================
// CÔNG TẮC
//
//   "thu"        — chỉ ai mở link imob.vn/?bot=moi mới thấy bot mới (nhớ trong
//                  cả phiên, chuyển trang không mất). Mở ?bot=cu để quay lại.
//                  Khách bình thường vẫn thấy bot iMob cũ.
//   "chinh-thuc" — mọi khách đều thấy bot mới, bot cũ ẩn.
//   "an"         — imob.vn KHÔNG có khung chat nào. Các nút "Chat với AI" dẫn
//                  sang trang giới thiệu /tro-ly-ao, trang đó có nút mở
//                  TRANG_CHATBOT (xem Layout.jsx và pages/TroLyAoPage.jsx).
//
// LỊCH SỬ:
//   01/10/2026 — bật "chinh-thuc" (kho Web iMob khai báo tên miền imob.vn).
//   02/10/2026 — về lại "thu": kho Web iMob CHUYỂN sang trang riêng
//                https://chatbot.imob.vn (thư mục trang-chatbot/) theo yêu cầu
//                lãnh đạo. Ô tên miền của nền tảng chỉ nhận MỘT tên miền, nên
//                kho này giờ KHÔNG trả lời trên imob.vn nữa — imob.vn dùng lại
//                bot cũ (ChatWidget.jsx), vốn trả lời về dịch vụ iMob.
//
// ⚠️ Vì vậy ?bot=moi trên imob.vn hiện KHÔNG dùng được (nền tảng chặn). Muốn
// bật lại bot nền tảng ở imob.vn thì cần một kho khai báo tên miền imob.vn,
// hoặc nền tảng cho một kho nhận nhiều tên miền.
//   02/10/2026 (chiều) — "an" theo yêu cầu: tạm ẩn cả bot cũ, dồn khách sang
//                trang giới thiệu /tro-ly-ao rồi sang chatbot.imob.vn.
// ============================================================
export const CHE_DO_BOT = "an";

// Trang chatbot riêng (thư mục trang-chatbot/, nginx: imob-chatbot).
export const TRANG_CHATBOT = "https://chatbot.imob.vn";

const KHOA_PHIEN = "imob_dung_bot_moi";

/** Trang hiện tại có dùng bot mới không. `search` là chuỗi "?bot=moi…". */
export function dungBotMoi(search) {
  if (CHE_DO_BOT === "chinh-thuc") return true;
  if (CHE_DO_BOT === "an") return false;
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
