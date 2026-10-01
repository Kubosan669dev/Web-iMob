// Nhớ việc khách đã tự tay đóng khung chat trong phiên duyệt web này.
// Dùng chung cho bot cũ (ChatWidget) và bot nền tảng (ChatbotNenTang): khách
// đóng rồi thì thôi tự mở / tự chào, dù đang hiện bot nào.
// sessionStorage: hết phiên là quên, hôm sau khách quay lại vẫn được chào.
const KHOA_DA_DONG = "imob_chat_da_dong";

export function daTungDong() {
  try {
    return sessionStorage.getItem(KHOA_DA_DONG) === "1";
  } catch {
    return false; // chế độ riêng tư chặn storage — coi như chưa đóng lần nào
  }
}

export function ghiDaDong() {
  try {
    sessionStorage.setItem(KHOA_DA_DONG, "1");
  } catch {
    /* không ghi được cũng không sao, chỉ mất trí nhớ giữa các trang */
  }
}
