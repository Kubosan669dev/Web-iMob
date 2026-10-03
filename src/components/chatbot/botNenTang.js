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
