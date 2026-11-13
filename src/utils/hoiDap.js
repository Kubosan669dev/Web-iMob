import { Footprints, Home, Store } from "lucide-react";

// Dùng chung cho trang Hỏi đáp AI (sections/hoi-dap/). Tách khỏi file .jsx vì
// luật react-refresh: file .jsx chỉ nên xuất component.

export const VAI_TRO = [
  { khoa: "khach", nhan: "Khách du lịch", icon: Footprints },
  { khoa: "kinh-doanh", nhan: "Doanh nghiệp & Hộ kinh doanh", icon: Store },
  { khoa: "cu-dan", nhan: "Cư dân địa phương", icon: Home },
];

/**
 * Thêm tên vùng vào đầu câu hỏi nếu câu chưa nhắc tới.
 *
 * Vì sao: cả website hiện chỉ có MỘT kho tri thức trên nền tảng (kho "iMob",
 * chatbot/botNenTang.js), chưa có kho riêng cho từng địa phương — bot chỉ biết
 * khách hỏi về đâu nếu câu hỏi nói ra. Khi mỗi địa phương có kho riêng thì bỏ
 * bước ghép này và đổi kho theo vùng.
 */
export function ghepVung(cauHoi, vung) {
  const c = cauHoi.trim();
  if (!c || !vung) return c;
  return c.toLowerCase().includes(vung.ten.toLowerCase()) ? c : `${vung.ten}: ${c}`;
}
