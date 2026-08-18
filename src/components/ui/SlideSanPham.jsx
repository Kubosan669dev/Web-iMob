import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import Button from "./Button.jsx";
import MaQR from "./MaQR.jsx";
import useManHinhRong from "../../hooks/useManHinhRong.js";

// ============================================================
// Băng chuyền sản phẩm ở khung hình đầu — ô bên phải, đúng chỗ TopCV để
// banner quảng cáo. Khác banner ở chỗ: thứ chạy qua đây là sản phẩm THẬT,
// mở ra dùng được ngay.
//
// BA QUYẾT ĐỊNH, và lý do:
//
// 1. TẤT CẢ SLIDE ĐỀU ĐƯỢC GẮN, XẾP CHỒNG VÀO CÙNG MỘT Ô LƯỚI.
//    Nếu chỉ gắn slide đang hiện thì mô tả dài ngắn khác nhau sẽ làm cả ô cao
//    thấp nhảy loạn mỗi 5 giây, kéo theo cả khung hình đầu giật. Xếp chồng thì
//    ô luôn lấy chiều cao của slide DÀI NHẤT và đứng yên tuyệt đối. (Cùng thủ
//    thuật với lớp giữ chỗ của từ khoá động trong Hero.jsx.)
//
// 2. DỪNG KHI RÊ CHUỘT HOẶC ĐANG ĐỌC BẰNG BÀN PHÍM.
//    Chữ tự trôi mất giữa chừng lúc người ta đang đọc là lỗi kinh điển của
//    băng chuyền. Cũng dừng hẳn nếu máy bật "giảm chuyển động".
//
// 3. MÃ QR NẰM NGOÀI CHỒNG SLIDE, chỉ đổi nội dung theo slide đang hiện.
//    Để trong chồng thì phải sinh 6 mã QR cùng lúc — tải thư viện rồi vẽ 6 lần
//    cho 5 cái không ai nhìn. Ngoài ra ô QR đứng im một chỗ cũng dễ nhìn hơn
//    là nó nhấp nháy theo từng slide.
// ============================================================

const NHIP_MS = 5000;

export default function SlideSanPham({ danhSach }) {
  const [chiSo, setChiSo] = useState(0);
  const [dung, setDung] = useState(false);
  const giamChuyenDong = useReducedMotion();
  const rong = useManHinhRong();

  const tong = danhSach?.length ?? 0;

  // Danh sách đổi (nội dung từ API về, hoặc sửa trong /admin) -> chỉ số cũ có
  // thể trỏ ra ngoài mảng mới.
  useEffect(() => {
    setChiSo(0);
  }, [tong]);

  useEffect(() => {
    if (tong < 2 || dung || giamChuyenDong) return;
    const timer = setInterval(() => setChiSo((i) => (i + 1) % tong), NHIP_MS);
    return () => clearInterval(timer);
  }, [tong, dung, giamChuyenDong]);

  if (tong === 0) return null;
  const sp = danhSach[chiSo % tong];

  return (
    <div
      role="group"
      aria-label="Sản phẩm đang chạy thật"
      onMouseEnter={() => setDung(true)}
      onMouseLeave={() => setDung(false)}
      onFocusCapture={() => setDung(true)}
      onBlurCapture={() => setDung(false)}
      className="flex flex-col rounded-card bg-brand-soft p-6 sm:p-8"
    >
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Sản phẩm đang chạy thật
        </p>
        <p className="shrink-0 text-xs font-medium tabular-nums text-ink-faint">
          {chiSo + 1}/{tong}
        </p>
      </div>

      {/* ---------- Chồng slide ---------- */}
      <div className="mt-4 grid flex-1">
        {danhSach.map((s, k) => (
          <div
            key={s.id ?? k}
            aria-hidden={k !== chiSo}
            className={
              "col-start-1 row-start-1 transition-opacity duration-500 " +
              (k === chiSo ? "opacity-100" : "opacity-0")
            }
          >
            <h2 className="tieu-de-lon text-[clamp(1.5rem,2.6vw,2rem)] text-ink">
              {s.title}
            </h2>
            <p className="mt-2.5 max-w-md text-[0.9375rem] leading-relaxed text-ink-soft">
              {s.description}
            </p>
            <p className="mt-3 text-sm text-ink-faint">{s.khachHang}</p>
          </div>
        ))}
      </div>

      {/* ---------- Hành động + mã QR ---------- */}
      <div className="mt-7 flex items-end justify-between gap-5">
        <div>
          {sp.lienKet && (
            <Button href={sp.lienKet} target="_blank" rel="noopener noreferrer">
              Mở thử ngay
            </Button>
          )}

          {/* Chấm điều hướng: bấm được, không chỉ để trang trí. Thanh của
              slide đang hiện dài hơn hẳn — chỉ đổi màu thì người mù màu không
              phân biệt được đang ở đâu. */}
          {tong > 1 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {danhSach.map((s, k) => (
                <button
                  key={s.id ?? k}
                  type="button"
                  onClick={() => setChiSo(k)}
                  aria-label={`Xem ${s.title}`}
                  aria-current={k === chiSo}
                  className={
                    "h-1.5 rounded-full transition-all duration-300 " +
                    (k === chiSo ? "w-6 bg-brand" : "w-2.5 bg-brand/30 hover:bg-brand/60")
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Mã QR chỉ trên máy tính — xem lý do trong hooks/useManHinhRong.js */}
        {rong && sp.lienKet && (
          <div className="shrink-0 text-center">
            <div className="rounded-xl bg-white p-1.5">
              <MaQR
                noiDung={sp.lienKet}
                alt={`Mã QR mở ${sp.title}`}
                className="h-24 w-24"
              />
            </div>
            <p className="mt-1.5 text-xs text-ink-faint">Quét bằng điện thoại</p>
          </div>
        )}
      </div>
    </div>
  );
}
