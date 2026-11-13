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
export function submitContact(formData) {
  return guiDen("/api/lien-he", formData);
}

// Form "Tư vấn thí điểm" ở trang Hỏi đáp AI (13/11/2026). Máy chủ:
// POST /api/dang-ky-dia-phuong (chatbot-python/api_lien_he.py) — bắt buộc
// don_vi, ho_ten, so_dien_thoai; email không bắt buộc. Lưu chung bảng liên hệ,
// xem ở /admin với nguồn "dia-phuong".
export function dangKyDiaPhuong(duLieu) {
  return guiDen("/api/dang-ky-dia-phuong", duLieu);
}

async function guiDen(duong, duLieu) {
  const controller = new AbortController();
  const hetGio = setTimeout(() => controller.abort(), HET_GIO_MS);

  try {
    const res = await fetch(`${API_BASE_URL}${duong}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify(duLieu),
    });

    // Trang tĩnh có luật SPA rewrite nên mọi đường dẫn lạ đều trả index.html
    // kèm mã 200. Không kiểm tra kiểu nội dung thì ta sẽ báo "gửi thành công"
    // trong khi thật ra chẳng có máy chủ nào nhận — đúng cái lỗi báo thành công
    // giả mà bản trước đã mắc.
    const laJson = (res.headers.get("content-type") || "").includes("application/json");

    if (res.ok && laJson) return { success: true };

    if (res.ok && !laJson) {
      return {
        success: false,
        error: "Hệ thống nhận liên hệ chưa sẵn sàng. Bạn gọi hotline giúp mình nhé.",
      };
    }

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
