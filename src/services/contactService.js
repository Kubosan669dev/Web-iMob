import { API_BASE_URL } from "../utils/constants.js";

// contactService: gửi form liên hệ lên backend để lưu vào database.
//
// Trước đây hàm này chỉ `console.log` rồi trả về {success: true} — khách điền
// form, thấy báo "đã gửi thành công", nhưng thông tin bốc hơi, không ai nhận
// được. Giờ gửi thật lên POST /api/lien-he và xem được ở trang /admin.
//
// Chữ ký giữ nguyên: submitContact(formData) → Promise<{ success, error? }>
// nên component Contact không phải đổi cách gọi.

// Backend gói free trên Render ngủ sau 15 phút, lần gọi đầu phải chờ máy chủ
// thức dậy. Cho rộng 45 giây — khách đã bỏ công điền form thì đáng chờ, và
// giao diện có hiện trạng thái "đang gửi".
const HET_GIO_MS = 45000;

// API_BASE_URL rỗng -> gọi đường dẫn tương đối. Lúc `npm run dev` thì
// vite.config.js chuyển tiếp /api/* sang backend ở cổng 8000.
export async function submitContact(formData) {
  const controller = new AbortController();
  const hetGio = setTimeout(() => controller.abort(), HET_GIO_MS);

  try {
    const res = await fetch(`${API_BASE_URL}/api/lien-he`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify(formData),
    });

    if (res.ok) return { success: true };

    // Máy chủ từ chối: hiện đúng câu của nó nếu đọc được (vd "Bạn đã gửi khá
    // nhiều lần…"), vì câu đó nói rõ khách cần làm gì hơn là lỗi chung chung.
    let error = "Gửi không thành công. Bạn thử lại hoặc gọi hotline giúp mình nhé.";
    try {
      const than = await res.json();
      if (typeof than?.detail === "string") error = than.detail;
    } catch {
      /* không đọc được thân lỗi — giữ câu mặc định */
    }
    return { success: false, error };
  } catch (err) {
    return {
      success: false,
      error:
        err.name === "AbortError"
          ? "Máy chủ phản hồi quá lâu. Bạn thử lại hoặc gọi hotline giúp mình nhé."
          : "Không kết nối được tới máy chủ. Bạn kiểm tra mạng hoặc gọi hotline nhé.",
    };
  } finally {
    clearTimeout(hetGio);
  }
}
