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
// Ô nhập ở đây CỐ Ý khác bộ ô trong Fields.jsx: chỗ này có biểu tượng nằm
// trong ô và nút hiện/ẩn mật khẩu, nhãn viết thường cho thân thiện. Fields.jsx
// dùng nhãn mono viết hoa vì ở đó có hàng chục ô, cần phân biệt nhanh nhãn với
// nội dung; còn ở đây chỉ có hai ô nên ưu tiên vẻ mềm mại, dễ tiếp cận.
// ============================================================

// Dòng gợi ý tài khoản dùng thử. Lấy từ biến môi trường VITE_DEMO_LOGIN,
// KHÔNG viết cứng trong mã.
//
// ⚠️ CÓ HIỆN LÀ AI CŨNG ĐĂNG NHẬP ĐƯỢC. Chỉ đặt biến này khi trang thật sự chỉ
// để trình diễn. Website thật thì để trống -> dòng này tự biến mất, không phải
// sửa code. Xem .env.example.
const DEMO_LOGIN = (import.meta.env.VITE_DEMO_LOGIN || "").trim();

const O_NHAP =
  "w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-11 text-sm " +
  "text-gray-100 placeholder-gray-600 outline-none transition-colors " +
  "hover:border-white/20 focus:border-primary/70 focus:bg-black/60 " +
  "focus:ring-1 focus:ring-primary/40";

function O({ nhan, icon: Icon, dungSau, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-gray-300">{nhan}</span>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600"
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
    <div className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-[26rem]">
        <div className="rounded-2xl border border-white/[0.08] bg-surface/70 p-7 sm:p-9">
          {/* ---------- Thương hiệu ---------- */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600/40 to-blue-600/30 ring-1 ring-white/10">
              <img
                src="/logo-imob.png"
                alt=""
                className="h-10 w-10 object-contain"
              />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white">
              iMob <span className="text-primary">Admin</span>
            </h1>
            <p className="mt-1.5 text-xs uppercase tracking-[0.18em] text-gray-500">
              Quản trị hệ thống
            </p>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-gray-600 transition-colors hover:text-gray-300"
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
                className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {loi}
              </p>
            )}

            <button
              type="submit"
              disabled={dangGui}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
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
              <p className="text-center text-xs text-gray-600">
                Lần đầu trong ngày có thể chờ 30–50 giây để máy chủ thức dậy.
              </p>
            )}

            {DEMO_LOGIN && (
              <p className="rounded-xl border border-white/[0.08] bg-black/30 px-4 py-3 text-center text-xs text-primary">
                {DEMO_LOGIN}
              </p>
            )}
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-gray-300"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
