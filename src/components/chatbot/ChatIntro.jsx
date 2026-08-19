import Logo from "../ui/Logo.jsx";
import GoiY from "./GoiY.jsx";

// ============================================================
// MÀN HÌNH MỞ ĐẦU
//
// Đây là thứ khách nhìn thấy đầu tiên, và trên máy tính khung chat TỰ MỞ nên
// nó xuất hiện mà khách chưa bấm gì cả. Nó quyết định khách có gõ chữ hay bấm
// nút đóng — nên nó được dựng như một trang mở đầu, không phải một bong bóng
// chào hỏi trôi trong danh sách tin nhắn.
//
// Cách dựng lấy đúng lối trang chủ: logo thật, một câu hỏi lớn, một dòng giải
// thích ngắn, rồi để khách TỰ CHỌN đường đi bằng danh sách hạng mục. Câu tiêu
// đề cố ý vọng lại "Bạn đang cần gì?" ở đầu trang chủ — cùng một giọng, khách
// nhận ra ngay vẫn là một sản phẩm.
//
// Logo dùng component Logo (ảnh thật của công ty) chứ không phải icon robot
// chung chung: đây là chỗ giới thiệu danh tính, mà icon robot thì trang nào
// cũng giống trang nào.
// ============================================================
export default function ChatIntro({ onSelect, disabled }) {
  return (
    <div className="pb-1 pt-1">
      <Logo className="h-10 w-10" />

      <h2 className="tieu-de-lon mt-3 text-[1.1875rem] text-ink">Bạn đang cần tìm hiểu gì?</h2>

      {/* Cố ý KHÔNG dùng lại câu chào của useChat ("Bạn cần hỏi gì cứ nhắn
          nhé") — đặt ngay dưới tiêu đề là lặp đúng một ý. Chỗ này nói thứ
          khách chưa biết: bot nắm được những gì. Rào cản lớn nhất khi đứng
          trước một ô chat trống là không biết hỏi được cái gì.
          Câu chào kia vẫn còn nguyên, hiện thành bong bóng đầu tiên ngay khi
          khách gửi câu hỏi đầu. */}
      {/* Cắt còn HAI DÒNG. Bản đầu dài ba dòng, cộng với sáu hạng mục bên dưới
          là tràn khỏi khung 600px, khách phải cuộn mới thấy hết gợi ý — hỏng
          đúng mục đích của màn hình này. Câu "cứ hỏi như nói chuyện bình
          thường" bỏ đi vì dòng chữ mờ trong ô nhập đã mời gõ rồi. */}
      <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
        Mình nắm sản phẩm đã bàn giao, bảy nhóm dịch vụ và cách liên hệ của iMob.
      </p>

      {/* Nhãn nhỏ chữ hoa: chia màn hình làm hai phần rõ ràng — phần giới
          thiệu ở trên, phần bấm được ở dưới — mà không cần vẽ thêm đường kẻ. */}
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
        Gợi ý nhanh
      </p>

      <div className="mt-2">
        <GoiY onSelect={onSelect} disabled={disabled} />
      </div>
    </div>
  );
}
