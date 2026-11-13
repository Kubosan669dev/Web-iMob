import { useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  FilePenLine,
  Loader2,
  Map as MapIcon,
  Phone,
  Send,
  ShieldCheck,
  Store,
  Zap,
} from "lucide-react";
import Container from "../../components/ui/Container.jsx";
import { dangKyDiaPhuong } from "../../services/contactService.js";
import { useCongTy } from "../../context/NoiDungContext.jsx";

// ============================================================
// "Giải pháp AI cho địa phương" + form "Tư vấn thí điểm" (giao diện chốt
// 13/11/2026). Neo #dang-ky: nút "Đăng ký cho địa phương" trên thanh menu
// trỏ về đây. Gửi tới POST /api/dang-ky-dia-phuong, xem ở /admin → Liên hệ
// (nguồn "dia-phuong").
//
// So với ảnh mẫu đã sửa:
//   • "Tích hợp ... chỉ trong 7 ngày làm việc": bỏ con số, công ty chưa chốt
//     cam kết thời gian.
//   • "Đa ngôn ngữ: Việt, Anh, Hàn, Trung, Pháp": thay bằng "Gắn với bản đồ số
//     & 360°" — việc iMob đã làm thật cho cả ba địa phương trên trang.
//   • Nút "Xem tài liệu kiến trúc RAG": chưa có tài liệu nào để mở → đổi
//     thành số điện thoại gọi thẳng.
//   • Dòng "tuân thủ khung hướng dẫn chuyển đổi số của Bộ VHTTDL": chưa có
//     căn cứ → thay bằng câu về việc dùng thông tin, dẫn tới Chính sách bảo mật.
//   • Thêm ô Email (không bắt buộc): người trực cần thêm một đường liên lạc
//     để gửi tài liệu tư vấn.
// ============================================================

const DIEM_MANH = [
  {
    icon: Zap,
    ten: "Không cần lập trình",
    moTa: "Khách hỏi qua website, mã QR đặt tại điểm đến hoặc Zalo Mini App.",
  },
  {
    icon: ShieldCheck,
    ten: "Địa phương làm chủ dữ liệu",
    moTa: "Cơ quan địa phương tự duyệt và cập nhật kho tài liệu của trợ lý.",
  },
  {
    icon: Store,
    ten: "Quảng bá sản phẩm địa phương",
    moTa: "Giới thiệu đặc sản, hộ kinh doanh, sản phẩm OCOP khi du khách hỏi lịch trình.",
  },
  {
    icon: MapIcon,
    ten: "Gắn với bản đồ số & 360°",
    moTa: "Nối với bản đồ số và tour thực tế ảo iMob đã làm cho địa phương.",
  },
];

const NHU_CAU = [
  "Trợ lý AI hỏi đáp cho du khách",
  "Hỏi đáp thủ tục hành chính cho người dân",
  "Hỗ trợ hộ kinh doanh, sản phẩm OCOP",
  "Số hoá di tích, tour thực tế ảo 360°",
  "Bản đồ số địa phương",
  "Khác",
];

const O =
  "w-full rounded-lg border border-transparent bg-mist px-3.5 py-3 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand focus:bg-panel";

function Truong({ nhan, batBuoc, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.8125rem] font-medium text-ink-soft">
        {nhan}
        {batBuoc ? (
          <span className="text-loi"> *</span>
        ) : (
          <span className="font-normal text-ink-faint"> (không bắt buộc)</span>
        )}
      </span>
      {children}
    </label>
  );
}

const TRONG = { don_vi: "", ho_ten: "", so_dien_thoai: "", email: "", nhu_cau: NHU_CAU[0] };

export default function DangKyDiaPhuong() {
  const congTy = useCongTy();
  const [f, setF] = useState(TRONG);
  const [trangThai, setTrangThai] = useState("nhap"); // nhap | gui | xong
  const [loi, setLoi] = useState("");
  const oDau = useRef(null);
  const idTieuDe = useId();

  const doi = (k) => (e) => setF((cu) => ({ ...cu, [k]: e.target.value }));

  const guiDi = async (e) => {
    e.preventDefault();
    setLoi("");
    setTrangThai("gui");
    const kq = await dangKyDiaPhuong(f);
    if (kq.success) {
      setTrangThai("xong");
      setF(TRONG);
    } else {
      setTrangThai("nhap");
      setLoi(kq.error);
    }
  };

  return (
    <section id="dang-ky" className="relative overflow-hidden bg-brand-deep py-20 text-tren-brand sm:py-24">
      {/* Hoạ tiết mạng lưới mờ góc phải — trang trí, giống ảnh mẫu */}
      <svg
        className="pointer-events-none absolute -right-24 top-1/2 hidden h-[30rem] w-[30rem] -translate-y-1/2 opacity-[0.12] lg:block"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="9"
        aria-hidden="true"
      >
        <circle cx="100" cy="100" r="26" />
        <circle cx="100" cy="28" r="12" />
        <circle cx="168" cy="72" r="12" />
        <circle cx="150" cy="160" r="12" />
        <circle cx="40" cy="150" r="12" />
        <path d="M100 74V40M124 92l32-14M118 120l24 30M80 118l-32 24" />
      </svg>

      <Container rong="max-w-6xl" className="relative">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-14">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-tren-brand/10 px-3.5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em]">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Dành cho chính quyền, ban quản lý di tích & hợp tác xã
            </p>
            <h2 className="mt-6 font-display text-[2rem] font-semibold leading-[1.18] sm:text-[2.375rem]">
              Giải pháp AI cho địa phương:
              <br />
              <em className="text-accent-soft">biến tài liệu địa phương thành trợ lý số đồng hành</em>
            </h2>
            <p className="mt-6 max-w-xl leading-relaxed text-tren-brand/85">
              iMob cùng chính quyền, ban quản lý du lịch và hợp tác xã dựng trợ lý ảo riêng cho từng địa bàn, học từ
              chính tài liệu của địa phương.
            </p>

            <ul className="mt-9 grid gap-6 sm:grid-cols-2">
              {DIEM_MANH.map(({ icon: Icon, ten, moTa }) => (
                <li key={ten} className="flex gap-3">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent-soft" aria-hidden="true" />
                  <div>
                    <p className="text-[0.9375rem] font-semibold">{ten}</p>
                    <p className="mt-1 text-[0.8125rem] leading-relaxed text-tren-brand/75">{moTa}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
              <button
                type="button"
                onClick={() => oDau.current?.focus()}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-[0.9375rem] font-semibold text-tren-brand transition-opacity hover:opacity-90"
              >
                Đăng ký triển khai cho địa phương của bạn
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <a
                href={`tel:${congTy.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-tren-brand/90 hover:text-tren-brand"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                Hoặc gọi {congTy.phone}
              </a>
            </div>
          </div>

          {/* ---------- Form ---------- */}
          <div className="rounded-2xl bg-panel p-6 text-ink shadow-lift sm:p-8">
            {trangThai === "xong" ? (
              <div className="py-10 text-center" role="status">
                <CheckCircle2 className="mx-auto h-12 w-12 text-brand" aria-hidden="true" />
                <h3 className="mt-4 font-display text-2xl font-semibold">Đã nhận đăng ký</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
                  iMob sẽ gọi lại cho bạn {congTy.responseTime || "sớm nhất"}. Cần gấp, gọi {congTy.phone}.
                </p>
                <button
                  type="button"
                  onClick={() => setTrangThai("nhap")}
                  className="mt-6 text-sm font-medium text-brand hover:underline"
                >
                  Gửi thêm một đăng ký khác
                </button>
              </div>
            ) : (
              <form onSubmit={guiDi} aria-labelledby={idTieuDe} className="space-y-4">
                <div className="mb-6 flex items-start justify-between gap-4 border-b border-line pb-5">
                  <div>
                    <h3 id={idTieuDe} className="font-display text-2xl font-semibold">
                      Tư vấn thí điểm
                    </h3>
                    <p className="mt-1 text-[0.8125rem] text-ink-soft">
                      Dành cho đại diện chính quyền & ban quản lý di sản
                    </p>
                  </div>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <FilePenLine className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>

                <Truong nhan="Tên đơn vị / địa phương" batBuoc>
                  <input
                    ref={oDau}
                    className={O}
                    value={f.don_vi}
                    onChange={doi("don_vi")}
                    placeholder="Ví dụ: UBND xã…, Ban quản lý di tích…"
                    required
                    minLength={2}
                    maxLength={200}
                  />
                </Truong>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Truong nhan="Họ tên người liên hệ" batBuoc>
                    <input
                      className={O}
                      value={f.ho_ten}
                      onChange={doi("ho_ten")}
                      autoComplete="name"
                      required
                      maxLength={120}
                    />
                  </Truong>
                  <Truong nhan="Số điện thoại" batBuoc>
                    <input
                      className={O}
                      value={f.so_dien_thoai}
                      onChange={doi("so_dien_thoai")}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="09xx xxx xxx"
                      required
                      maxLength={40}
                    />
                  </Truong>
                </div>

                <Truong nhan="Email">
                  <input
                    className={O}
                    value={f.email}
                    onChange={doi("email")}
                    type="email"
                    autoComplete="email"
                    maxLength={200}
                  />
                </Truong>

                <Truong nhan="Nhu cầu ưu tiên" batBuoc>
                  <select className={O + " cursor-pointer"} value={f.nhu_cau} onChange={doi("nhu_cau")}>
                    {NHU_CAU.map((n) => (
                      <option key={n}>{n}</option>
                    ))}
                  </select>
                </Truong>

                {loi && (
                  <p role="alert" className="rounded-lg bg-loi-nen px-4 py-3 text-sm text-loi">
                    {loi}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={trangThai === "gui"}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3.5 text-[0.9375rem] font-semibold text-tren-brand transition-colors hover:bg-brand-deep disabled:cursor-wait disabled:opacity-70"
                >
                  {trangThai === "gui" ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="h-4 w-4" aria-hidden="true" />
                  )}
                  Gửi đề xuất phối hợp thí điểm
                </button>

                <p className="text-center text-xs leading-relaxed text-ink-faint">
                  iMob chỉ dùng thông tin này để liên hệ tư vấn. Xem{" "}
                  <Link to="/privacy-policy" className="underline underline-offset-2 hover:text-brand">
                    Chính sách bảo mật
                  </Link>
                  .
                </p>
              </form>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
