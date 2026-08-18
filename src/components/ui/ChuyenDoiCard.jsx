import { useEffect, useState } from "react";
import {
  ArrowDown,
  Check,
  ClipboardList,
  Table2,
  PhoneCall,
  Smartphone,
  Users,
  TrendingUp,
} from "lucide-react";

/* ================= ChuyenDoiCard =================
   Kể đúng nghĩa hai chữ "chuyển đổi số" bằng hình ảnh: cách làm cũ ở trên,
   cách làm sau khi triển khai ở dưới. Nhìn hai giây là hiểu iMob bán gì.

   Nội dung này đúng cho cả cơ quan nhà nước lẫn doanh nghiệp — sổ sách giấy,
   file Excel mỗi người một bản, muốn số liệu phải gọi điện hỏi là chuyện chung
   của mọi đơn vị chưa số hoá.

   Tô lại theo ngôn ngữ Apple: bỏ viền đứt nét, bỏ bóng đổ, bỏ vạch màu bên
   trái. Hai bảng giờ chỉ khác nhau ở SẮC ĐỘ NỀN — "trước" chìm vào nền xám,
   "sau" nổi lên nền trắng. Ít chi tiết hơn hẳn mà thông điệp vẫn nguyên. */

const VIEC_CU = [
  { icon: ClipboardList, text: "Sổ tay, giấy tờ mỗi nơi một kiểu" },
  { icon: Table2, text: "File Excel mỗi người giữ một bản" },
  { icon: PhoneCall, text: "Muốn xem số liệu phải gọi điện hỏi" },
];

const VIEC_MOI = [
  { icon: Smartphone, text: "Dữ liệu cập nhật tức thì" },
  { icon: Users, text: "Cả đơn vị dùng chung một nguồn" },
  { icon: TrendingUp, text: "Báo cáo tự chạy, xem trên điện thoại" },
];

// Nhịp tick: mỗi 900ms đánh dấu thêm một dòng, xong thì nghỉ 2 nhịp rồi lặp
// lại. Chuyển động duy nhất của khối này, và nó CÓ NGHĨA — "việc tự chạy" —
// chứ không phải hiệu ứng cho đẹp.
const SO_NHIP = VIEC_MOI.length + 2;

export default function ChuyenDoiCard({ className = "" }) {
  const [daXong, setDaXong] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDaXong((n) => (n + 1) % SO_NHIP), 900);
    return () => clearTimeout(timer);
  }, [daXong]);

  return (
    <div className={`w-full ${className}`}>
      {/* ---------- Trước ---------- */}
      <div className="rounded-block bg-mist p-7">
        <p className="mb-4 text-sm font-semibold text-ink-faint">Trước</p>
        <ul className="space-y-3.5">
          {VIEC_CU.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-3 text-[0.9375rem] text-ink-soft"
            >
              <Icon className="h-5 w-5 shrink-0 text-ink-faint" aria-hidden="true" />
              {text}
            </li>
          ))}
        </ul>
      </div>

      {/* ---------- Mũi tên chuyển đổi ---------- */}
      <div className="flex justify-center py-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-tren-brand">
          <ArrowDown className="h-4 w-4" aria-hidden="true" />
          iMob
        </span>
      </div>

      {/* ---------- Sau ---------- */}
      <div className="rounded-block bg-panel p-7 shadow-soft">
        <p className="mb-4 text-sm font-semibold text-brand">Sau khi triển khai</p>
        <ul className="space-y-3.5">
          {VIEC_MOI.map(({ icon: Icon, text }, i) => {
            const xong = i < daXong;
            return (
              <li
                key={text}
                className="flex items-center gap-3 text-[0.9375rem] text-ink"
              >
                {/* Icon đổi thành dấu tích khi tới lượt. Bọc trong ô cố định
                    kích thước để chữ không nhích ngang lúc icon đổi. */}
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                  {xong ? (
                    <Check className="h-5 w-5 text-brand" aria-hidden="true" />
                  ) : (
                    <Icon className="h-5 w-5 text-ink-faint" aria-hidden="true" />
                  )}
                </span>
                {text}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
