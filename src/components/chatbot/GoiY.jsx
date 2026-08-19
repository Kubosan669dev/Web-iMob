import {
  ArrowRight,
  Bot,
  MonitorSmartphone,
  Package,
  Radar,
  Receipt,
  ShieldCheck,
} from "lucide-react";

// ============================================================
// GỢI Ý CÂU HỎI
//
// Sáu mục dưới đây bám theo đúng danh sách 7 nhóm việc công ty đã chốt và đang
// hiện ở cột trái trang chủ (MUC trong src/sections/Hero.jsx). Khách vừa đọc
// bảy hạng mục ngoài trang chủ, mở chat ra thấy đúng những mục đó — chứ không
// phải một bộ chủ đề khác do chatbot tự nghĩ. Icon cũng lấy trùng bộ lucide
// với trang chủ vì lý do đó.
//
// ⚠️ TỪNG CÂU TRONG `hoi` ĐÃ CHẠY THỬ QUA BỘ NÃO CHAT, khớp đúng intent:
//     Sản phẩm đã làm             -> portfolio
//     Zalo Mini App phường, xã    -> zma-dich-vu-cong
//     Nâng chuẩn an toàn cấp độ 2 -> an-toan-cap-do
//     Giám sát 24/7               -> giam-sat-ung-cuu
//     Trợ lý AI doanh nghiệp      -> tro-ly-ai-doanh-nghiep
//     Chi phí                     -> pricing
//
// Sửa chữ trong `hoi` thì PHẢI thử lại bằng findAnswer, đổi vài từ là câu rơi
// sang intent khác ngay. Ví dụ thật gặp lúc dựng: "Giám sát an ninh mạng 24/7
// gồm những gì?" rơi nhầm sang an-toan-cap-do, phải thêm "và ứng cứu sự cố"
// mới về đúng chỗ. Nút gợi ý mà bấm vào ra câu trả lời lạc đề thì phản tác
// dụng hơn là không có nút.
//
// `nhan` là chữ khách NHÌN THẤY (ngắn, lướt mắt là hiểu), `hoi` là câu THẬT
// gửi cho bot (dài, đủ từ khoá để khớp đúng). Hai thứ tách nhau vì mục đích
// khác nhau — nhưng `nhan` không được hứa nhiều hơn `hoi` sẽ trả lời.
// ============================================================
const GOI_Y = [
  { nhan: "Sản phẩm đã làm", hoi: "Bên bạn đã làm những sản phẩm gì rồi?", icon: Package },
  {
    nhan: "Zalo Mini App cho phường, xã",
    hoi: "Zalo Mini App cho dịch vụ công của phường gồm những gì?",
    icon: MonitorSmartphone,
  },
  {
    nhan: "Nâng chuẩn an toàn cấp độ 2",
    hoi: "Nâng cấp lên chuẩn an toàn cấp độ 2 là làm gì?",
    icon: ShieldCheck,
  },
  {
    nhan: "Giám sát an ninh mạng 24/7",
    hoi: "Giám sát an ninh mạng 24/7 và ứng cứu sự cố gồm những gì?",
    icon: Radar,
  },
  {
    nhan: "Trợ lý AI cho doanh nghiệp",
    hoi: "Xây trợ lý AI riêng cho doanh nghiệp được không?",
    icon: Bot,
  },
  { nhan: "Chi phí tính thế nào", hoi: "Chi phí tính như thế nào?", icon: Receipt },
];

/**
 * Hai hình dạng cho cùng một bộ dữ liệu:
 *
 * • Mặc định — hàng dọc, thoáng, có mũi tên. Dùng ở màn hình mở đầu, lúc khách
 *   chưa gõ gì và cần được mời.
 * • `gon` — chip xếp cuộn dòng. Dùng khi đã có hội thoại: lúc đó khoảng trống
 *   quý, gợi ý chỉ đóng vai nhắc lại chứ không còn là nội dung chính.
 *
 * @param {(cau: string) => void} onSelect  Nhận CÂU THẬT (`hoi`), không phải nhãn.
 */
export default function GoiY({ onSelect, disabled, gon = false }) {
  if (gon) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {GOI_Y.map((g) => (
          <button
            key={g.nhan}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(g.hoi)}
            className="flex items-center gap-1.5 rounded-full bg-ink/5 px-3 py-1.5 text-[12px] font-medium text-ink-soft transition-colors hover:bg-brand-soft hover:text-brand disabled:opacity-40"
          >
            <g.icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {g.nhan}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {GOI_Y.map((g) => (
        <button
          key={g.nhan}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(g.hoi)}
          className="group flex w-full items-center gap-3 rounded-card bg-ink/5 px-3.5 py-3 text-left transition-colors hover:bg-brand-soft disabled:opacity-40"
        >
          <g.icon className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
          <span className="min-w-0 flex-1 text-[13px] font-medium text-ink">{g.nhan}</span>
          <ArrowRight
            className="h-3.5 w-3.5 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  );
}
