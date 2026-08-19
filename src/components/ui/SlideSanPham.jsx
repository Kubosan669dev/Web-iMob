import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

// 8 giây, nằm giữa khoảng 7–10s công ty đề nghị trong văn bản góp ý
// 19/08/2026. Bản trước để 5s — quá gấp: mô tả sản phẩm dài 2 dòng thì
// người đọc chậm chưa kịp hết câu đã bị đẩy sang dự án khác.
const NHIP_MS = 8000;

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
  const di = (buoc) => setChiSo((i) => (i + buoc + tong) % tong);

  /* Vị trí ngang của từng slide, suy ra từ CHỖ ĐỨNG của nó so với slide đang
     hiện — không cần nhớ vừa bấm tới hay bấm lui:
       đứng trước  -> nằm bên trái  (đã trôi qua)
       đang hiện   -> ở giữa
       đứng sau    -> nằm bên phải  (chưa tới)
     Nhờ vậy bấm tới thì chữ trôi sang trái, bấm lui thì trôi sang phải, đúng
     chiều ở cả hai nút mà không phải giữ thêm một biến trạng thái nào. */
  const viTri = (k) =>
    k === chiSo
      ? "translate-x-0 opacity-100"
      : k < chiSo
        ? "-translate-x-6 opacity-0"
        : "translate-x-6 opacity-0";

  const nutMuiTen =
    "flex h-7 w-7 items-center justify-center rounded-full text-brand transition-colors hover:bg-panel";

  return (
    <div
      role="group"
      aria-label="Dự án nổi bật"
      onMouseEnter={() => setDung(true)}
      onMouseLeave={() => setDung(false)}
      onFocusCapture={() => setDung(true)}
      onBlurCapture={() => setDung(false)}
      className="flex flex-col rounded-card bg-brand-soft p-6 sm:p-8"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">
          Dự án nổi bật
        </p>

        {tong > 1 && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => di(-1)}
              aria-label="Sản phẩm trước"
              className={nutMuiTen}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => di(1)}
              aria-label="Sản phẩm sau"
              className={nutMuiTen}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* ---------- Chồng slide ---------- */}
      <div className="mt-4 grid flex-1">
        {danhSach.map((s, k) => (
          <div
            key={s.id ?? k}
            aria-hidden={k !== chiSo}
            className={
              "col-start-1 row-start-1 transition-all duration-500 ease-out " +
              viTri(k)
            }
          >
            {/* ---------- Maket sản phẩm ----------
                Công ty yêu cầu "chèn thêm maket mờ để nhìn thấy hình ảnh từng
                sản phẩm". Khối này CHỈ HIỆN khi sản phẩm đó có trường `anh`
                trong CMS — chưa có ảnh thì tự ẩn, bố cục vẫn y như trước.

                Bỏ file vào public/anh/ rồi điền đường dẫn ở /admin (tab Sản
                phẩm) là hiện ngay, không phải sửa code.

                Phủ một lớp màu thương hiệu rất nhạt: ảnh chụp màn hình sáu
                sản phẩm khác nhau sẽ có sáu tông màu khác nhau, không xử lý
                thì mỗi lần đổi slide là cả thẻ trắng đổi màu theo. Rê chuột
                thì lớp phủ tan hẳn.

                ⚠️ 19/08/2026 — bản đầu để opacity-60, chụp màn hình 1440px
                lại thì ảnh bạc trắng gần như không nhìn ra sản phẩm gì. Góp ý
                của công ty là "maket mờ ĐỂ NHÌN đại diện từng sản phẩm": mờ
                là để ảnh không tranh chỗ với chữ, không phải để xoá ảnh đi.
                Đưa lên 90% và bỏ hẳn việc giảm độ mờ của ảnh — chỉ lớp phủ
                màu làm nhiệm vụ hoà tông. */}
            {s.anh && (
              <div className="group/anh relative mb-4 overflow-hidden rounded-card bg-mist">
                <img
                  src={s.anh}
                  alt={`Giao diện ${s.title}`}
                  loading="lazy"
                  className="h-40 w-full object-cover object-top opacity-90 transition-opacity duration-500 group-hover/anh:opacity-100 sm:h-52"
                />
                <span
                  className="pointer-events-none absolute inset-0 bg-brand/[0.07] transition-opacity duration-500 group-hover/anh:opacity-0"
                  aria-hidden="true"
                />
              </div>
            )}

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
            <p className="mt-1.5 text-xs text-ink-faint">Quét mã để trải nghiệm</p>
          </div>
        )}
      </div>
    </div>
  );
}
