import { useEffect, useState } from "react";

// ============================================================
// Mã QR sinh NGAY TRONG TRÌNH DUYỆT.
//
// Bản trước sinh mã QR lúc build bằng scripts/tao-ma-qr.mjs rồi ghi ra file
// SVG. Cách đó chết ngay khi sản phẩm chuyển vào CMS: thêm sản phẩm trong
// /admin thì KHÔNG có lần build nào chạy, nên sẽ không có mã QR — mà đó lại
// đúng là thứ người dùng vừa yêu cầu làm được.
//
// Thư viện qrcode nạp bằng import() ĐỘNG nên nó nằm ở một chunk riêng, chỉ tải
// khi thật sự có mã QR cần vẽ. Khách mở trang chủ bằng điện thoại không tải
// một byte nào của nó (xem cách chặn theo bề ngang màn hình ở Projects.jsx).
//
// Kết quả nhét vào <img> dưới dạng data: URI thay vì dùng
// dangerouslySetInnerHTML — vừa khỏi phải nhúng HTML thô, vừa giữ được SVG nên
// mã nét ở mọi cỡ.
// ============================================================

/** Mức sửa lỗi "M" (~15%): mã trên màn hình luôn sạch, để cao hơn chỉ làm ô
    dày đặc thêm và khó quét ở cỡ nhỏ. */
const TUY_CHON = {
  type: "svg",
  errorCorrectionLevel: "M",
  margin: 1,
  color: { dark: "#000000", light: "#ffffff" },
};

export default function MaQR({ noiDung, alt = "", className = "" }) {
  const [uri, setUri] = useState("");

  useEffect(() => {
    const dc = (noiDung ?? "").trim();
    if (!dc) {
      setUri("");
      return;
    }

    let huy = false;
    import("qrcode")
      .then((m) => (m.default ?? m).toString(dc, TUY_CHON))
      .then((svg) => {
        if (huy) return;
        setUri("data:image/svg+xml;utf8," + encodeURIComponent(svg));
      })
      .catch(() => {
        // Không tải được thư viện (mạng hỏng) — im lặng không hiện gì. Mã QR là
        // thứ có thì tốt, thiếu cũng không làm hỏng trang.
        if (!huy) setUri("");
      });

    return () => {
      huy = true;
    };
  }, [noiDung]);

  if (!uri) return null;
  return <img src={uri} alt={alt} loading="lazy" decoding="async" className={className} />;
}
