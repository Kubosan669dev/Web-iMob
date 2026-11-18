import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  MessageCircleQuestion,
  ClipboardList,
  User,
  AtSign,
} from "lucide-react";
import Logo from "../components/ui/Logo.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import useTaiKhoan from "../hooks/useTaiKhoan.js";
import {
  DAI_MAT_KHAU_TOI_THIEU,
  MAU_TEN,
  dangKy,
  dangNhap,
  dangXuat,
  tenGoi,
} from "../services/taiKhoanService.js";

// ============================================================
// Trang Đăng nhập / Đăng ký của người dùng website — 18/11/2026.
//
// Một component cho hai đường dẫn (/dang-nhap, /dang-ky): cùng vị trí trong
// cây React nên chuyển thẻ không dựng lại trang, chỉ ảnh và form đổi.
//
// Cột ảnh bên trái CỐ Ý KHÔNG theo bảng màu (giống trang đăng nhập /admin):
// ảnh giữ màu thật, lớp phủ đen mờ và chữ trắng cố định. Form bên phải thì
// theo bảng màu như mọi trang khác.
//
// ?tiep=/duong-dan: xong thì về đó (vd. bấm "Đăng nhập để tạo khảo sát").
// Chỉ nhận đường dẫn nội bộ bắt đầu bằng "/" — không cho ai gắn link ngoài.
// ============================================================

const CANH = {
  "dang-nhap": {
    anh: "/anh/dia-phuong/quang-tan-ruong-bac-thang.webp",
    viTri: "object-[50%_60%]",
    noi: "Ruộng bậc thang · xã Quảng Tân",
    tieuDe: "Chào bạn quay lại.",
    moTa: "Đăng nhập để hỏi trợ lý AI về địa phương. Sắp tới: tạo khảo sát và gửi cho người dân.",
  },
  "dang-ky": {
    anh: "/anh/dia-phuong/yen-tu-chua-dong.webp",
    viTri: "object-[50%_45%]",
    noi: "Chùa Đồng · đỉnh Yên Tử",
    tieuDe: "Một tài khoản, hỏi gì về địa phương cũng có chỗ.",
    moTa: null,
  },
};

const LOI_ICH = [
  { icon: MessageCircleQuestion, chu: "Hỏi trợ lý AI về Yên Tử, Đông Triều, Quảng Tân" },
  { icon: ClipboardList, chu: "Tạo khảo sát và gửi cho người dân", sapCo: true },
];

function duongTiep(tho) {
  return tho && tho.startsWith("/") && !tho.startsWith("//") ? tho : "/";
}

// ---------- Ô nhập ----------
const O_NHAP =
  "w-full rounded-xl border border-line bg-panel py-3 pl-11 text-[0.9375rem] text-ink " +
  "placeholder-ink-faint outline-none transition-[border-color,box-shadow] " +
  "focus:border-brand focus:ring-4 focus:ring-brand/10";

function O({ nhan, icon: Icon, dungSau, goiY, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{nhan}</span>
      <span className="relative block">
        <Icon
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        />
        <input className={`${O_NHAP} ${dungSau ? "pr-11" : "pr-4"}`} {...props} />
        {dungSau}
      </span>
      {goiY}
    </label>
  );
}

function NutMat({ hien, doi }) {
  return (
    <button
      type="button"
      onClick={doi}
      aria-label={hien ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
      className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-ink-faint transition-colors hover:text-ink"
    >
      {hien ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}

// Một dòng điều kiện, đổi sang dấu tích khi đạt. Chưa gõ gì thì xám.
function DieuKien({ dat, children }) {
  return (
    <span className={`flex items-center gap-1.5 ${dat ? "text-brand" : "text-ink-faint"}`}>
      <Check className={`h-3.5 w-3.5 ${dat ? "opacity-100" : "opacity-40"}`} aria-hidden="true" />
      {children}
    </span>
  );
}

export default function TaiKhoanPage({ che = "dang-nhap" }) {
  const dangKyMo = che === "dang-ky";
  useDocumentTitle(dangKyMo ? "Đăng ký tài khoản" : "Đăng nhập");

  const navigate = useNavigate();
  const [params] = useSearchParams();
  const tiep = duongTiep(params.get("tiep"));
  const duoi = params.get("tiep") ? `?tiep=${encodeURIComponent(tiep)}` : "";
  const nguoi = useTaiKhoan();

  const [hoTen, setHoTen] = useState("");
  const [ten, setTen] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [hienMk, setHienMk] = useState(false);
  const [dongY, setDongY] = useState(false);
  const [loi, setLoi] = useState("");
  const [dangGui, setDangGui] = useState(false);

  // Chuyển thẻ thì xoá lỗi cũ: lỗi của form kia không còn nghĩa.
  useEffect(() => setLoi(""), [che]);

  const tenSach = ten.trim().toLowerCase();
  const tenDat = MAU_TEN.test(tenSach);
  const mkDuDai = matKhau.length >= DAI_MAT_KHAU_TOI_THIEU;
  const mkKhacTen = matKhau.length > 0 && matKhau.trim().toLowerCase() !== tenSach;

  const gui = async (e) => {
    e.preventDefault();
    setLoi("");
    if (dangKyMo) {
      if (!tenDat) return setLoi("Tên đăng nhập chưa đúng mẫu bên dưới ô.");
      if (!mkDuDai || !mkKhacTen) return setLoi("Mật khẩu chưa đạt điều kiện bên dưới ô.");
      if (!dongY) return setLoi("Bạn cần đồng ý với điều khoản sử dụng để tạo tài khoản.");
    }
    setDangGui(true);
    try {
      if (dangKyMo) await dangKy({ hoTen, tenDangNhap: ten, matKhau });
      else await dangNhap({ tenDangNhap: ten, matKhau });
      navigate(tiep, { replace: true });
    } catch (err) {
      setLoi(err.message);
    } finally {
      setDangGui(false);
    }
  };

  const canh = CANH[che];

  return (
    <div className="grid min-h-screen bg-paper text-ink lg:grid-cols-[1.05fr_1fr]">
      {/* ================= Cột ảnh (màu cố định) ================= */}
      <aside className="relative h-60 overflow-hidden bg-[#1b2a22] text-white sm:h-64 lg:sticky lg:top-0 lg:h-screen">
        <AnimatePresence initial={false}>
          <motion.img
            key={canh.anh}
            src={canh.anh}
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute inset-0 h-full w-full object-cover ${canh.viTri}`}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/30" />

        <div className="relative flex h-full flex-col justify-between p-6 sm:p-8 lg:p-12">
          <Link to="/" className="inline-flex items-center gap-2.5 self-start rounded-lg">
            <Logo className="h-9 w-9" />
            <span className="text-lg font-semibold tracking-tight">iMob</span>
          </Link>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={che}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="max-w-md"
            >
              <p className="hidden text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-white/70 sm:block">
                {canh.noi}
              </p>
              <h2 className="mt-3 font-display text-2xl font-semibold leading-tight [text-shadow:0_1px_14px_rgb(0_0_0/0.4)] sm:text-3xl lg:text-[2.5rem]">
                {canh.tieuDe}
              </h2>
              {canh.moTa && (
                <p className="mt-4 hidden text-[0.9375rem] leading-relaxed text-white/80 lg:block">{canh.moTa}</p>
              )}
              {dangKyMo && (
                <ul className="mt-6 hidden space-y-3 lg:block">
                  {LOI_ICH.map(({ icon: Icon, chu, sapCo }) => (
                    <li key={chu} className="flex items-center gap-3 text-[0.9375rem] text-white/90">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      {chu}
                      {sapCo && (
                        <span className="rounded-full border border-white/30 px-2 py-0.5 text-[0.6875rem] font-medium uppercase tracking-wider text-white/75">
                          Sắp có
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </aside>

      {/* ================= Cột form ================= */}
      <main className="flex flex-col px-5 py-8 sm:px-10 lg:py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1 self-start text-sm text-ink-soft transition-colors hover:text-brand"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Về trang chủ
        </Link>

        <div className="mx-auto flex w-full max-w-[25rem] flex-1 flex-col justify-center py-10">
          {nguoi ? (
            <DaDangNhap nguoi={nguoi} tiep={tiep} />
          ) : (
            <>
              <h1 className="font-display text-[2rem] font-semibold leading-tight text-brand-deep">
                {dangKyMo ? (
                  <>Tạo tài khoản <em>iMob</em></>
                ) : (
                  <>Đăng nhập <em>iMob</em></>
                )}
              </h1>
              <p className="mt-2 text-[0.9375rem] text-ink-soft">
                {dangKyMo ? "Chưa tới một phút, không cần email." : "Dùng tên đăng nhập bạn đã tạo."}
              </p>

              {/* Thẻ chuyển: viên thuốc trượt theo thẻ đang mở */}
              <div className="mt-7 grid grid-cols-2 rounded-xl bg-mist p-1" role="tablist" aria-label="Chọn đăng nhập hoặc đăng ký">
                {[
                  ["dang-nhap", "Đăng nhập"],
                  ["dang-ky", "Đăng ký"],
                ].map(([khoa, nhan]) => {
                  const mo = che === khoa;
                  return (
                    <Link
                      key={khoa}
                      to={`/${khoa}${duoi}`}
                      replace
                      role="tab"
                      aria-selected={mo}
                      className={`relative rounded-lg py-2.5 text-center text-sm font-semibold transition-colors ${
                        mo ? "text-ink" : "text-ink-soft hover:text-ink"
                      }`}
                    >
                      {mo && (
                        <motion.span
                          layoutId="the-tai-khoan"
                          className="absolute inset-0 rounded-lg bg-panel shadow-soft"
                          transition={{ type: "spring", stiffness: 500, damping: 38 }}
                        />
                      )}
                      <span className="relative">{nhan}</span>
                    </Link>
                  );
                })}
              </div>

              <form onSubmit={gui} className="mt-7 space-y-5" noValidate>
                {dangKyMo && (
                  <O
                    nhan="Họ và tên"
                    icon={User}
                    placeholder="Ví dụ: Trần Thị Hoa"
                    value={hoTen}
                    onChange={(e) => setHoTen(e.target.value)}
                    autoComplete="name"
                    maxLength={60}
                  />
                )}

                <O
                  nhan="Tên đăng nhập"
                  icon={AtSign}
                  placeholder={dangKyMo ? "Ví dụ: hoa.tran" : "Tên đăng nhập của bạn"}
                  value={ten}
                  onChange={(e) => setTen(e.target.value)}
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={24}
                  required
                  goiY={
                    dangKyMo && (
                      <span className="mt-2 block text-xs leading-relaxed">
                        <DieuKien dat={tenDat}>3–24 ký tự: chữ thường không dấu, số, dấu . _ -</DieuKien>
                      </span>
                    )
                  }
                />

                <O
                  nhan="Mật khẩu"
                  icon={Lock}
                  type={hienMk ? "text" : "password"}
                  placeholder={dangKyMo ? "Ít nhất 8 ký tự" : "Mật khẩu"}
                  value={matKhau}
                  onChange={(e) => setMatKhau(e.target.value)}
                  autoComplete={dangKyMo ? "new-password" : "current-password"}
                  required
                  dungSau={<NutMat hien={hienMk} doi={() => setHienMk((v) => !v)} />}
                  goiY={
                    dangKyMo && (
                      <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        <DieuKien dat={mkDuDai}>Ít nhất 8 ký tự</DieuKien>
                        <DieuKien dat={mkKhacTen}>Khác tên đăng nhập</DieuKien>
                      </span>
                    )
                  }
                />

                {dangKyMo && (
                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink-soft">
                    <input
                      type="checkbox"
                      checked={dongY}
                      onChange={(e) => setDongY(e.target.checked)}
                      className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-brand)]"
                    />
                    <span>
                      Tôi đồng ý với{" "}
                      <Link to="/terms-of-service" className="font-medium text-brand underline-offset-2 hover:underline">
                        điều khoản sử dụng
                      </Link>{" "}
                      và{" "}
                      <Link to="/privacy-policy" className="font-medium text-brand underline-offset-2 hover:underline">
                        chính sách bảo mật
                      </Link>
                      .
                    </span>
                  </label>
                )}

                {loi && (
                  <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-loi-nen px-4 py-3 text-sm text-loi">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {loi}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={dangGui}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 text-[1rem] font-semibold text-tren-brand transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {dangGui ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      {dangKyMo ? "Đang tạo tài khoản…" : "Đang đăng nhập…"}
                    </>
                  ) : (
                    <>
                      {dangKyMo ? "Tạo tài khoản" : "Đăng nhập"}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-ink-soft">
                {dangKyMo ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
                <Link
                  to={`/${dangKyMo ? "dang-nhap" : "dang-ky"}${duoi}`}
                  replace
                  className="font-semibold text-brand underline-offset-2 hover:underline"
                >
                  {dangKyMo ? "Đăng nhập" : "Đăng ký miễn phí"}
                </Link>
              </p>
              {!dangKyMo && (
                <p className="mt-3 text-center text-xs leading-relaxed text-ink-faint">
                  Quên mật khẩu? Liên hệ iMob để được đặt lại.
                </p>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// Đã đăng nhập mà vẫn mở trang này: nói rõ đang là ai, cho hai lối đi tiếp.
function DaDangNhap({ nguoi, tiep }) {
  return (
    <div className="text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand text-2xl font-semibold text-tren-brand">
        {tenGoi(nguoi).charAt(0).toUpperCase()}
      </span>
      <h1 className="mt-5 font-display text-[2rem] font-semibold text-brand-deep">
        Chào <em>{tenGoi(nguoi)}</em>
      </h1>
      <p className="mt-2 text-[0.9375rem] text-ink-soft">
        Bạn đang đăng nhập bằng tài khoản <strong className="text-ink">{nguoi.ten}</strong>.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <Link
          to={tiep}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3.5 font-semibold text-tren-brand transition-colors hover:bg-brand-deep"
        >
          Tiếp tục
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <button
          type="button"
          onClick={dangXuat}
          className="rounded-xl border border-line px-5 py-3.5 font-semibold text-ink-soft transition-colors hover:border-ink-faint hover:text-ink"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
