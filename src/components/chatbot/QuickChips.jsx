import React from "react";

const SUGGESTED_CHIPS = [
  { label: "💻 Web Bán máy tính / Bán hàng", query: "Tôi muốn làm website bán máy tính và thiết bị công nghệ" },
  { label: "🏛️ Zalo App Dịch vụ công", query: "Bên bạn có làm Zalo Mini App cho Dịch vụ công không?" },
  { label: "📱 Zalo Mini App Ngành khác", query: "Zalo Mini App có thể ứng dụng cho những ngành nào?" },
  { label: "⚙️ Quản lý kho & IoT", query: "Bên mình có giải pháp quản lý kho và kết nối thiết bị IoT không?" },
  { label: "💰 Báo giá & Chi phí", query: "Chi phí và bảng giá dịch vụ tính như thế nào?" }
];

export default function QuickChips({ onSelect, disabled }) {
  return (
    <div className="my-2 space-y-1.5 px-1">
      <p className="text-[11px] font-medium text-ink-soft">💡 Gợi ý câu hỏi phổ biến:</p>
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTED_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(chip.query)}
            className="rounded-full border border-brand/30 bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand transition-all hover:border-brand hover:bg-brand hover:text-white disabled:opacity-50"
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}
