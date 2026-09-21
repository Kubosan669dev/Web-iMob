import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ChevronLeft,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  User,
} from "lucide-react";
import * as api from "../../services/adminService.js";
import Logo from "../ui/Logo.jsx";

// ============================================================
// Màn hình đăng nhập trang quản trị.
//
// Dùng chung hệ thiết kế sáng với trang khách (đổi 17/08/2026): thẻ trắng bo
// góc lớn đặt trên nền xám nhạt, không viền không đổ bóng nặng, nút viên thuốc
// màu thương hiệu.
//
// Ô nhập ở đây CỐ Ý khác bộ ô trong Fields.jsx: chỗ này có biểu tượng nằm
// trong ô và nút hiện/ẩn mật khẩu. Fields.jsx có hàng chục ô nên phải gọn hết
// mức; còn ở đây chỉ có hai ô, thêm biểu tượng làm màn hình đăng nhập dễ tiếp
// cận và bớt trống trải.
// ============================================================

const O_NHAP =
  "w-full rounded-xl border border-transparent bg-mist py-3 pl-11 text-[0.9375rem] " +
  "text-ink placeholder-ink-faint outline-none transition-colors " +
  "focus:border-brand focus:bg-panel";

function O({ nhan, icon: Icon, dungSau, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink-soft">{nhan}</span>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        />
        <input className={`${O_NHAP} ${dungSau ? "pr-11" : "pr-4"}`} {...props} />
        {dungSau}
      </div>
    </label>
  );
}

// Chờ quá bao lâu thì mới giải thích cho người dùng biết chuyện gì đang xảy ra.
// 4 giây: đăng nhập bình thường mất khoảng 0,5–2 giây nên không bao giờ chạm
// tới; chỉ khi máy chủ thật sự phải thức dậy (30–50 giây) thì câu giải thích
// mới hiện ra, đúng lúc người dùng bắt đầu tự hỏi "hỏng rồi à?".
const NGUONG_CHO_LAU = 4000;

export default function ManHinhDangNhap({ khiXong, lyDo = "" }) {
  const [ten, setTen] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [hienMatKhau, setHienMatKhau] = useState(false);
  const [loi, setLoi] = useState("");
  const [dangGui, setDangGui] = useState(false);
  const [choLau, setChoLau] = useState(false);

  // Bấm gửi -> hẹn giờ; xong (hoặc lỗi) -> phần dọn dẹp huỷ hẹn giờ, nên câu
  // giải thích không bao giờ loé lên sau khi việc đã xong.
  useEffect(() => {
    if (!dangGui) {
      setChoLau(false);
      return;
    }
    const dongHo = setTimeout(() => setChoLau(true), NGUONG_CHO_LAU);
    return () => clearTimeout(dongHo);
  }, [dangGui]);

  const guiDi = async (e) => {
    e.preventDefault();
    setLoi("");
    setDangGui(true);
    try {
      khiXong(await api.dangNhap(ten.trim(), matKhau));
    } catch (err) {
      setLoi(err.message);
    } finally {
      setDangGui(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-mist px-5 py-12 text-ink">
      <div className="w-full max-w-[26rem]">
        <div className="rounded-block bg-panel p-7 sm:p-9">
          {/* ---------- Thương hiệu ---------- */}
          <div className="mb-8 text-center">
            {/* Logo giữ nguyên màu ở mọi bảng màu — xem components/ui/Logo.jsx */}
            <Logo className="mx-auto mb-5 h-16 w-16" />

            <h1 className="tieu-de-lon text-2xl text-ink">
              iMob <span className="text-brand">Admin</span>
            </h1>
            {/* "QUẢN TRỊ HỆ THỐNG" viết hoa, giãn chữ — theo đúng ảnh mẫu
                công ty gửi 20/08/2026 ("làm y hệt cái ảnh"). */}
            <p className="mt-1.5 text-sm uppercase tracking-wider text-ink-faint">
              Quản trị hệ thống
            </p>
          </div>

          {/* ---------- Form ---------- */}
          <form onSubmit={guiDi} className="space-y-5">
            {/* Câu giải thích khi bị TỰ ĐỘNG đăng xuất (useTuDongDangXuat.js).
                Không có nó thì người đang soạn dở tự dưng thấy màn hình đăng
                nhập hiện ra mà không hiểu vì sao.

                Đặt TRƯỚC hai ô nhập chứ không phải dưới cùng: đây là câu trả
                lời cho "ủa sao lại thế này?", phải đọc được trước khi người ta
                bắt đầu gõ lại.

                Không dùng màu lỗi — đây không phải lỗi, mà là việc đúng như
                thiết kế. Tô đỏ chỉ làm người dùng tưởng hệ thống hỏng. */}
            {lyDo && !loi && (
              <p
                role="status"
                className="flex items-start gap-2.5 rounded-xl bg-mist px-4 py-3 text-[0.8125rem] leading-relaxed text-ink-soft"
              >
                <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  {lyDo}
                  <span className="mt-1 block text-ink-faint">
                    Đăng nhập lại là thấy nguyên phần đang sửa dở.
                  </span>
                </span>
              </p>
            )}

            <O
              nhan="Tên đăng nhập"
              icon={User}
              placeholder="Nhập tên đăng nhập"
              value={ten}
              onChange={(e) => setTen(e.target.value)}
              autoComplete="username"
              autoFocus
              required
            />

            <O
              nhan="Mật khẩu"
              icon={Lock}
              type={hienMatKhau ? "text" : "password"}
              placeholder="Nhập mật khẩu"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              autoComplete="current-password"
              required
              dungSau={
                <button
                  type="button"
                  onClick={() => setHienMatKhau((v) => !v)}
                  aria-label={hienMatKhau ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-ink-faint transition-colors hover:text-ink"
                >
                  {hienMatKhau ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              }
            />

            {loi && (
              <p
                role="alert"
                className="flex items-start gap-2.5 rounded-xl bg-loi-nen px-4 py-3 text-sm text-loi"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {loi}
              </p>
            )}

            <button
              type="submit"
              disabled={dangGui}
              /* Nút chuyển sắc theo ảnh mẫu công ty gửi. CỐ Ý dùng hai màu
                 thương hiệu (brand -> brand-deep) chứ không ghim cứng mã màu
                 xanh–tím như trong ảnh: trang này chạy được với cả 9 bảng màu,
                 ghim cứng thì bảng nào cũng ra một nút xanh tím lạc lõng, và
                 mất luôn phần bảo đảm tương phản đã đo bằng
                 scripts/kiem-tra-bang-mau.mjs. */
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-deep px-5 py-3 text-[1.0625rem] font-medium text-tren-brand transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {dangGui ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Đang đăng nhập…
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>

            {/* ⚠️ CÂU NÀY CHỈ HIỆN KHI THẬT SỰ CHỜ LÂU (quá NGUONG_CHO_LAU).
                Trước 21/08/2026 nó hiện NGAY khi bấm Đăng nhập, kèm con số
                "30–50 giây" — vừa sai vừa phản tác dụng: nó BẢO người ta rằng
                sắp phải chờ nửa phút, nên một cái chờ 2 giây cũng thành cảm
                giác lâu. Đúng phàn nàn đã nhận: "bấm Đăng nhập rồi ngồi chờ".

                16/09/2026 — chuyển sang máy chủ riêng ở CMC: câu cũ nói "máy
                chủ đang thức dậy, mất 30–50 giây". Đó là hiện tượng của gói
                free trên Render, nơi dịch vụ tự ngủ sau 15 phút không ai gọi.
                Máy chủ riêng chạy liên tục, không bao giờ ngủ. Giữ nguyên câu
                đó thì mỗi lần mạng chậm lại đổ tội cho một nguyên nhân không
                còn tồn tại, và người đọc sẽ ngồi đợi thay vì đi tìm lỗi thật.

                Vẫn giữ một câu nào đó chứ không xoá hẳn: màn hình im lặng quá
                4 giây thì người dùng tưởng là hỏng và bấm lại lần nữa. */}
            {choLau && (
              <p className="text-center text-[0.8125rem] text-ink-faint">
                Máy chủ phản hồi chậm hơn bình thường, vui lòng đợi thêm giây lát.
              </p>
            )}
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-ink-soft transition-colors hover:text-brand"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
