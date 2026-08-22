import knowledge from "../data/kienThuc.json";
import companyMacDinh from "../data/company.json";
import projectsMacDinh from "../data/projects.json";
import doiTacMacDinh from "../data/doiTac.json";
import { API_BASE_URL } from "../utils/constants.js";
import { findAnswer, chongLap } from "./chatBrain.js";
import {
  demSoLieu,
  danhSachMarkdown,
  danhSachDoiTacMarkdown,
} from "../utils/soLieu.js";

// ============================================================
// chatService: "tổng đài" — nơi DUY NHẤT giao diện gọi để lấy câu trả lời.
//
// Ba tầng, xếp theo thứ tự nhanh-và-chắc-chắn trước:
//
//   1. Kho kiến thức TRONG TRÌNH DUYỆT (kienThuc.json + chatBrain.js)
//      0ms, không cần mạng, câu chữ đã được người duyệt. Đại đa số câu hỏi
//      dừng ở đây.
//   2. Bot Python trên Render (TF-IDF trên kho kiến thức lớn hơn)
//   3. Gemini — NẰM BÊN TRONG bot Python ở tầng 2, không gọi từ đây.
//
// VÌ SAO TẦNG GEMINI KHÔNG CÒN Ở FILE NÀY (gỡ 19/08/2026):
// bản trước gọi Gemini thẳng từ đây bằng `import.meta.env.VITE_GEMINI_API_KEY`.
// Mọi biến `VITE_*` bị Vite nhét THẲNG vào file JavaScript công khai — ai mở
// F12 cũng copy được khoá rồi tiêu quota của công ty. Giờ khoá nằm ở biến
// `GEMINI_API_KEY` trên Render, trình duyệt không bao giờ nhìn thấy nó.
// Xem chatbot-python/imob_bot/gemini.py.
//
// ⚠️ ĐỪNG DỰNG LẠI TẦNG GEMINI Ở ĐÂY. Muốn sửa cách gọi AI thì sửa ở backend.
//
// Vì sao trước đó còn bỏ cả tầng Ollama (FastAPI + qwen2.5:3b chạy local):
//   - Model 3B từng BỊA thông tin thật (nói địa chỉ ở "Đống Đa, Hà Nội" trong
//     khi dữ liệu ghi Hạ Long).
//   - Nó đọc sai tiếng Việt không dấu và không tự chống được câu đánh lừa.
//   - Ollama bắt người dùng cài đặt, ăn GPU, không deploy được lên hosting tĩnh.
// Chi tiết đầy đủ ở CHATBOT.md mục 9.
//
// Chữ ký cố định (hợp đồng giữa UI và bộ não):
//   sendMessage(message, history, congTy, sanPham) → Promise<{ response }>
// ============================================================

// Nghỉ một nhịp trước khi trả lời. Bot trả lời tức thì (0ms) trông giật cục
// và làm hiệu ứng "đang gõ" chỉ loé lên rồi tắt — chờ chút cho tự nhiên.
const DO_TRE_MS = 350;

const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === "true";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Mã phiên trò chuyện. Backend Python NHỚ ngữ cảnh giữa các lượt (đang hỏi
// khách họ tên hay số điện thoại), nên phải cho nó biết "câu này là của ai".
// Dùng sessionStorage: mỗi tab một phiên riêng, đóng tab là hết — hợp với một
// cuộc tư vấn, và không để lại dấu vết lâu dài trên máy khách.
const KHOA_PHIEN = "imob_chat_session";

function laySessionId() {
  try {
    let id = sessionStorage.getItem(KHOA_PHIEN);
    if (!id) {
      id =
        globalThis.crypto?.randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(KHOA_PHIEN, id);
    }
    return id;
  } catch {
    // Trình duyệt chặn storage (chế độ ẩn danh, chặn cookie...) → không sao,
    // để trống thì server tự cấp mã mới mỗi lượt.
    return null;
  }
}

// Backend free trên Render "ngủ" sau 15 phút không ai dùng, lần gọi đầu phải
// chờ máy chủ thức dậy. Cho nó 25 giây rồi thôi, chứ không để khách chờ mãi.
//
// 25 chứ không phải 20 như bản trước: giờ backend còn phải gọi tiếp Gemini
// (tối đa 8 giây, xem CHO_TOI_DA_S trong imob_bot/gemini.py) cho những câu kho
// kiến thức không trả lời được. Để 20 thì đúng những câu KHÓ NHẤT — loại cần
// Gemini nhất — lại hay bị cắt ngang ngay trước khi có câu trả lời.
const BACKEND_TIMEOUT_MS = 25000;

async function callBackendChat(message, history = []) {
  if (!API_BASE_URL) return null;

  // Hủy request nếu quá lâu — nếu không, promise treo vô hạn khi mạng chết.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BACKEND_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ message, history, session_id: laySessionId() }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data?.response || null;
  } catch (err) {
    console.warn(
      "Backend chat lỗi:",
      err.name === "AbortError" ? "hết giờ chờ" : err.message
    );
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * @param congTy Thông tin công ty MỚI NHẤT (từ useCongTy). Bot điền nó vào các
 *   chỗ {{cong_ty.*}} trong kho kiến thức, nên sửa SĐT ở /admin là bot nói theo
 *   ngay. Không truyền thì dùng bản đóng gói sẵn.
 */
export async function sendMessage(message, history = [], congTy, sanPham, doiTac) {
  const company = congTy ?? companyMacDinh;

  // Số liệu bot đọc cho khách nghe được ĐẾM từ danh sách sản phẩm mới nhất
  // (sửa ở /admin), không chép tay vào kho kiến thức — cùng lý do với congTy
  // ở trên. Nơi gọi không truyền thì dùng bản đóng gói sẵn.
  const ds = sanPham?.length ? sanPham : projectsMacDinh.danhSach;
  const dsDoiTac = doiTac?.danhSach?.length ? doiTac : doiTacMacDinh;
  const soLieu = {
    ...demSoLieu(ds),
    danhSach: danhSachMarkdown(ds),
    doiTac: danhSachDoiTacMarkdown(dsDoiTac),
  };

  // Tầng 1: kho kiến thức trong trình duyệt (0ms, không cần mạng)
  const result = findAnswer(message, knowledge, company, soLieu);

  if (result.intentId !== "fallback") {
    await sleep(DO_TRE_MS); // câu local ra tức thì → nghỉ một nhịp cho tự nhiên
    // Chống lặp: khách trả lời câu hỏi ngược bằng đúng từ khóa của intent →
    // findAnswer trả về lại đúng intent cũ. Nếu câu này trùng y hệt câu bot
    // vừa nói ngay trước, đẩy hội thoại tiến lên thay vì lặp lại.
    const cauBotTruoc = [...history]
      .reverse()
      .find((h) => h.role === "assistant")?.content;
    const { response } = chongLap(result.answer, cauBotTruoc, company);
    return { response };
  }

  // Tầng 2: bot Python trên Render — và bên trong nó là tầng 3, Gemini.
  if (USE_BACKEND) {
    const backendAnswer = await callBackendChat(message, history);
    if (backendAnswer) {
      return { response: backendAnswer };
    }
  }

  // Backend ngủ / mạng hỏng / chưa bật → câu fallback đóng gói sẵn.
  // Khách luôn nhận được MỘT câu trả lời tử tế, không bao giờ thấy màn hình lỗi.
  return { response: result.answer };
}
