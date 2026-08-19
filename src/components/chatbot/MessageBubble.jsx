import { lazy, Suspense, memo } from "react";

// react-markdown nặng (~150kB) mà chỉ tin nhắn của BOT mới cần.
// lazy() đẩy nó ra file riêng, trình duyệt chỉ tải khi thật sự có bong bóng
// bot xuất hiện → trang chủ nhẹ đi đáng kể.
const ReactMarkdown = lazy(() => import("react-markdown"));

// ============================================================
// MỘT LƯỢT NÓI
//
// Hai vai được phân biệt bằng VỊ TRÍ và NỀN, không bằng avatar:
//
//   • Khách nói  — bám phải, nền màu thương hiệu, hẹp (85%). Câu khách gõ
//     thường ngắn nên bong bóng nhỏ là đúng, và màu đậm khiến mắt lướt dọc
//     hội thoại thấy ngay mình đã hỏi những gì.
//   • Bot trả lời — bám trái, nền chìm, RỘNG HẾT KHUNG. Câu trả lời của bot
//     iMob gần như luôn là danh sách nhiều gạch đầu dòng có chữ đậm; nhồi nó
//     vào bong bóng 80% trong panel 384px thì mỗi dòng còn chưa tới 300px,
//     danh sách vỡ hết.
//
// BỎ AVATAR ở từng bong bóng (bản trước có ở cả hai vai). Một vòng tròn màu
// lặp lại chục lần chỉ để nhắc một điều mà tiêu đề khung đã nói rõ, đổi lại
// ăn mất 42px chiều ngang của đúng phần cần rộng nhất. Vị trí + màu nền đã đủ
// phân biệt, mọi ứng dụng nhắn tin đều làm vậy.
//
// VÌ SAO NỀN BOT LÀ `bg-ink/5` CHỨ KHÔNG PHẢI `bg-mist`:
// khung chat có nền `bg-panel`, mà ở bảng màu "Midnight Crimson" thì
// --color-panel và --color-mist bằng nhau đúng bằng #1a1a24 → bong bóng bot
// TÀNG HÌNH hoàn toàn (lỗi có thật của bản trước). `bg-ink/5` là 5% màu chữ
// pha lên nền: bảng sáng thì ink tối nên ra xám nhạt, bảng tối thì ink sáng
// nên ra xám nhạt hơn nền — tự đúng ở cả 9 bảng màu, không cần thêm token và
// không phải vẽ viền.
//
// done = true  → tin nhắn đã gõ xong, render Markdown đầy đủ
// done = false → đang gõ chữ ra dần, hiện TEXT THÔ để tránh lag
//                (ReactMarkdown parse liên tục mỗi nhịp 20ms → nghẹt UI)
// plain = true → dùng ngoài khung chat thật (đoạn hội thoại mẫu ở section
//                "Về iMob"), luôn hiện text thô.
// ============================================================
function MessageBubble({ role, text, done = true, plain = false }) {
  const isBot = role === "bot";
  const dungMarkdown = isBot && done && !plain;

  return (
    <div className={isBot ? "flex" : "flex justify-end"}>
      <div
        className={
          "whitespace-pre-wrap text-[14px] leading-[1.65] " +
          (isBot
            ? "max-w-full rounded-card bg-ink/5 px-4 py-3 text-ink"
            : // Góc dưới-phải vuông lại: một dấu hiệu nhỏ chỉ về phía người
              // gõ. Chỉ đặt ở bong bóng khách — khối trả lời của bot cố ý giữ
              // bốn góc đều nhau để đọc như một đoạn văn bản, không như lời
              // thoại.
              "max-w-[85%] rounded-card rounded-br-md bg-brand px-4 py-2.5 text-tren-brand")
        }
      >
        {dungMarkdown ? (
          <div className="chat-markdown">
            <Suspense fallback={text}>
              <ReactMarkdown>{text}</ReactMarkdown>
            </Suspense>
          </div>
        ) : (
          text
        )}
      </div>
    </div>
  );
}

export default memo(MessageBubble);
