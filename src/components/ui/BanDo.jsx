import { ExternalLink } from "lucide-react";
import { SITE } from "../../utils/constants.js";
import { useCongTy } from "../../context/NoiDungContext.jsx";

// ============================================================
// BẢN ĐỒ ĐỊA CHỈ VĂN PHÒNG — nhúng Google Maps, không cần khoá API.
//
// Công ty yêu cầu 20/08/2026: đặt bản đồ ở chân trang và lấp chỗ trống trong
// thẻ thông tin liên hệ.
//
// ⚠️ KHÔNG lấy thẳng `address` làm từ khoá tra bản đồ. Chuỗi đầy đủ "Văn phòng
// tầng 3, Toà nhà HL68 Building, Dốc Ngân hàng, phường Hạ Long, tỉnh Quảng
// Ninh" KHÔNG tra ra vị trí nào — phần "Văn phòng tầng 3" làm hỏng việc tra
// cứu. Nên `banDo` là một trường RIÊNG trong company.json.
//
// SỬA 23/09/2026 — GHIM CŨ SAI CHỖ. Trước đó `banDo` là toạ độ
// "20.9572849,107.0932340", tra được từ "Dốc Ngân Hàng" trên bản đồ mở
// OpenStreetMap. Nhưng công ty cho biết văn phòng nằm trên ĐỒI CỘT 2, cách
// đó một quãng — cái ghim đang chỉ vào vòng xuyến Dốc Ngân Hàng, chỗ quán
// Ô Pal Coffee.
//
// Đã dựng thật khung nhúng này rồi chụp lại để đối chiếu (không đoán):
//     "Đồi Cột 2, Hạ Long, Quảng Ninh"          -> ghim GIỮA PHỐ, không rõ toà nào
//     "HL 68 Building, Đồi Cột 2, Hạ Long, …"   -> ghim ĐÚNG TOÀ NHÀ, có tên
//                                                  "HL 68 Building" trên bản đồ
//     "HL68 Building" (viết liền, đứng một mình) -> không tìm thấy
// OpenStreetMap vẫn KHÔNG biết "Đồi Cột 2" lẫn "HL 68 Building"; chỉ Google
// biết. Nên đừng tra lại bằng OSM rồi tưởng từ khoá này hỏng.
//
// Ghép tên toà nhà TRƯỚC tên phố: Google biết toà nhà thì ghim đúng toà nhà,
// không biết thì lùi về đúng con phố.
//
// ⚠️ `address` VẪN GHI "Dốc Ngân hàng" — CỐ Ý, công ty quyết ngày 23/09/2026.
// Tức là dòng chữ địa chỉ và cái ghim đang nói hai con phố khác nhau. Đừng
// "sửa cho khớp": chuỗi địa chỉ đó còn nằm trong chính sách bảo mật và trong
// kho kiến thức của chatbot, đổi nó là việc của công ty chứ không phải việc
// dọn dẹp mã. Khi nào công ty chốt lại địa chỉ thì sửa cả 4 nơi một lượt:
// src/data/company.json, src/data/legalPages.json, và hai chỗ trong
// chatbot-python/data/imob_chatbot_data.json (company.street/full và
// rag_chunks đầu tiên).
//
// Sửa được ở /admin → Thông tin công ty. Muốn ghim thật chính xác thì mở
// Google Maps, bấm chuột phải vào đúng cửa, chọn toạ độ rồi dán vào ô đó dạng
// "20.9572849,107.0932340" — cũng chạy y hệt.
//
// loading="lazy": khung này gọi thẳng sang máy chủ Google. Để lười thì khách
// chưa cuộn xuống chân trang là chưa có lời gọi nào rời khỏi máy họ.
// ============================================================

export function truyVanBanDo(congTy) {
  return (congTy?.banDo ?? "").trim() || (SITE.banDo ?? "").trim() || (congTy?.address ?? "").trim();
}

export default function BanDo({ cao = "h-52", className = "" }) {
  const congTy = useCongTy();
  const truyVan = truyVanBanDo(congTy);
  if (!truyVan) return null;

  const q = encodeURIComponent(truyVan);
  const nhung = `https://www.google.com/maps?q=${q}&output=embed&z=17`;
  const moRong = `https://www.google.com/maps/search/?api=1&query=${q}`;

  return (
    <div className={className}>
      {/* bg-mist làm nền chờ: khung của Google trong suốt lúc chưa tải xong,
          không có nền thì chỗ này nháy một mảng trắng giữa bảng màu tối. */}
      <div className={`overflow-hidden rounded-card border border-line bg-mist ${cao}`}>
        <iframe
          src={nhung}
          title={`Bản đồ tới ${congTy?.name ?? "văn phòng"}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full border-0"
        />
      </div>

      {/* Bản đồ nhúng chỉ để nhìn. Ai muốn chỉ đường thì cần mở app thật —
          nhất là trên điện thoại, nơi khung nhúng rất khó thao tác. */}
      <a
        href={moRong}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-soft transition-colors hover:text-brand"
      >
        Mở trong Google Maps
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </div>
  );
}
