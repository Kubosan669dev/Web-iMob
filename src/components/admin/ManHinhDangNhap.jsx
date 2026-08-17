import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ChevronLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  User,
} from "lucide-react";
import * as api from "../../services/adminService.js";

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

// Dòng gợi ý tài khoản dùng thử. Lấy từ biến môi trường VITE_DEMO_LOGIN,
// KHÔNG viết cứng trong mã.
//
// ⚠️ CÓ HIỆN LÀ AI CŨNG ĐĂNG NHẬP ĐƯỢC. Chỉ đặt biến này khi trang thật sự chỉ
// để trình diễn. Website thật thì để trống -> dòng này tự biến mất, không phải
// sửa code. Xem .env.example.
const DEMO_LOGIN = (import.meta.env.VITE_DEMO_LOGIN || "").trim();

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

export default function ManHinhDangNhap({ khiXong }) {
  const [ten, setTen] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [hienMatKhau, setHienMatKhau] = useState(false);
  const [loi, setLoi] = useState("");
  const [dangGui, setDangGui] = useState(false);

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
            {/* Ô logo nền chàm tím đặc, dùng file logo TRẮNG — logo màu đặt
                trên nền trắng sẽ chìm. */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-block bg-brand">
              <img
                src="/logo-imob-white.png"
                alt=""
                className="h-9 w-9 object-contain"
              />
            </div>

            <h1 className="tieu-de-lon text-2xl text-ink">
              iMob <span className="text-brand">Admin</span>
            </h1>
            <p className="mt-1.5 text-sm text-ink-faint">Quản trị nội dung</p>
          </div>

          {/* ---------- Form ---------- */}
          <form onSubmit={guiDi} className="space-y-5">
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
                className="flex items-start gap-2.5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {loi}
              </p>
            )}

            <button
              type="submit"
              disabled={dangGui}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-[1.0625rem] font-medium text-white transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
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

            {dangGui && (
              <p className="text-center text-[0.8125rem] text-ink-faint">
                Lần đầu trong ngày có thể chờ 30–50 giây để máy chủ thức dậy.
              </p>
            )}

            {DEMO_LOGIN && (
              <p className="rounded-xl bg-brand-soft px-4 py-3 text-center text-[0.8125rem] text-brand">
                {DEMO_LOGIN}
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
