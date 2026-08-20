import { useEffect, useState } from "react";
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

// ============================================================
// Ô TÀI KHOẢN DÙNG THỬ (công ty yêu cầu 20/08/2026: "hiển thị tên user
// password ở đó để tester có thể truy cập vào").
//
// Tên và mật khẩu lấy từ MÁY CHỦ qua /api/tai-khoan-thu, không phải từ biến
// VITE_ lúc build. Lý do: tài khoản thật nằm ở Render (biến TESTER_USER /
// TESTER_PASSWORD) còn website build ở Vercel. Nếu chép mật khẩu sang một biến
// VITE_ thì hai nơi sẽ lệch nhau ngay lần đổi mật khẩu đầu tiên — màn hình hiện
// một mật khẩu cũ, người test gõ 5 lần rồi bị khóa IP 15 phút mà không hiểu vì
// sao. Lấy từ API thì chỉ có một nguồn sự thật, và tắt cũng chỉ cần bỏ trống
// biến trên Render, không phải build lại website.
//
// ⚠️ AN TOÀN: tài khoản này mang vai 'khach_thu' — sửa được nội dung website
// nhưng KHÔNG đọc được mục Tin nhắn (họ tên, số điện thoại, email khách thật —
// dữ liệu cá nhân theo Nghị định 13/2023). Chặn nằm ở máy chủ, xem
// auth.yeu_cau_quan_tri và api_lien_he.py.
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

export default function ManHinhDangNhap({ khiXong }) {
  const [ten, setTen] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [hienMatKhau, setHienMatKhau] = useState(false);
  const [loi, setLoi] = useState("");
  const [dangGui, setDangGui] = useState(false);
  const [taiKhoanThu, setTaiKhoanThu] = useState(null);

  // Hỏi máy chủ xem có tài khoản dùng thử không. Gọi ngầm và nuốt mọi lỗi:
  // máy chủ đang ngủ thì chỉ là chưa hiện dòng gợi ý, người biết mật khẩu vẫn
  // đăng nhập bình thường. `con` chặn việc gán state sau khi rời trang.
  useEffect(() => {
    let con = true;
    api.taiKhoanThu().then((tk) => con && setTaiKhoanThu(tk));
    return () => {
      con = false;
    };
  }, []);

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

            {dangGui && (
              <p className="text-center text-[0.8125rem] text-ink-faint">
                Lần đầu trong ngày có thể chờ 30–50 giây để máy chủ thức dậy.
              </p>
            )}

            {/* ---------- Dòng tài khoản dùng thử ----------
                Công ty chốt 20/08/2026: gọn đúng MỘT DÒNG, theo mẫu ảnh gửi
                kèm ("Demo: admin / imob@2025"). Bản trước là một ô có nhãn,
                bảng hai dòng và nút riêng — công ty thấy rườm rà.

                Vẫn giữ ba thứ, vì chúng không tốn thêm dòng nào:
                  · font-mono cho phần tài khoản — mật khẩu hay có l/1/I và
                    O/0, phông thường nhìn y hệt nhau, chép nhầm là gõ sai 5
                    lần rồi bị khoá IP 15 phút.
                  · select-all — nháy đúp một cái là bôi đen được cả cụm.
                  · cả dòng là một cái nút: bấm vào tự điền sẵn hai ô ở trên.
                    Nhìn vẫn là một dòng chữ, chỉ đậm nền lên khi rê chuột.

                Câu "không xem được thông tin khách hàng" chuyển vào title —
                đọc được khi rê chuột, mà không chiếm chỗ trên màn hình. */}
            {taiKhoanThu && (
              <button
                type="button"
                onClick={() => {
                  setTen(taiKhoanThu.ten);
                  setMatKhau(taiKhoanThu.mat_khau);
                  setLoi("");
                }}
                title="Bấm để điền sẵn. Tài khoản này sửa được nội dung website nhưng không xem được thông tin khách hàng."
                className="w-full rounded-xl bg-brand-soft px-4 py-3 text-center text-[0.8125rem] text-brand transition-colors hover:bg-brand hover:text-tren-brand"
              >
                Demo:{" "}
                <span className="select-all break-all font-mono">
                  {taiKhoanThu.ten} / {taiKhoanThu.mat_khau}
                </span>
              </button>
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
