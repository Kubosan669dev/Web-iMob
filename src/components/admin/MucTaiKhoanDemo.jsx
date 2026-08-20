import { useEffect, useState } from "react";
import { AlertTriangle, Check, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import * as api from "../../services/adminService.js";

// ============================================================
// MỤC "DÒNG ĐĂNG NHẬP THỬ" của trang quản trị.
//
// Công ty yêu cầu 20/08/2026: chỉnh được ngay trong /admin, không phải mở
// Render sửa biến môi trường rồi chờ khởi động lại.
//
// BA QUYẾT ĐỊNH, và lý do:
//
// 1. CẢNH BÁO ĐỔI THEO VAI TRÒ CỦA TÀI KHOẢN ĐANG ĐIỀN.
//    Đem một tài khoản chỉ-sửa-nội-dung ra công khai là chuyện nhỏ. Đem tài
//    khoản TOÀN QUYỀN ra công khai thì đồng nghĩa mở luôn danh sách khách hàng
//    cho cả internet. Hai việc đó khác nhau về bản chất nên không thể dùng
//    chung một dòng chữ nhắc nhở nhạt nhoà. Máy chủ trả về `vai_tro`, ở đây
//    đổi hẳn màu và nội dung cảnh báo theo nó.
//
// 2. MẬT KHẨU HIỆN RÕ MẶC ĐỊNH.
//    Mọi ô mật khẩu khác đều nên che. Ô này thì ngược lại: thứ đang nhập vào
//    đây SẼ ĐƯỢC IN CÔNG KHAI lên màn hình đăng nhập. Che nó đi là tạo cảm
//    giác an toàn giả, và còn làm người nhập không soát được mình gõ đúng chưa.
//    Vẫn có nút che lại cho ai đang chia sẻ màn hình.
//
// 3. MÁY CHỦ TỪ CHỐI LƯU MẬT KHẨU SAI.
//    Xem /api/cai-dat-demo. Nếu cặp tên/mật khẩu không đăng nhập được thật thì
//    không lưu — vì in một mật khẩu sai lên màn hình sẽ khiến người kiểm thử
//    gõ sai 5 lần rồi bị khoá IP 15 phút, mà nhìn vào đâu cũng thấy "đã cấu
//    hình xong".
// ============================================================

const O_NHAP =
  "w-full rounded-xl border border-transparent bg-mist px-3.5 py-2.5 text-[0.9375rem] " +
  "text-ink placeholder-ink-faint outline-none transition-colors focus:border-brand focus:bg-panel";

/** Cảnh báo hậu quả, đổi theo vai trò của tài khoản đang được điền. */
function CanhBao({ vaiTro, ten }) {
  if (!ten) return null;

  if (vaiTro === null || vaiTro === undefined) {
    return (
      <p className="flex items-start gap-2.5 rounded-xl bg-mist px-4 py-3 text-[0.8125rem] leading-relaxed text-canhbao">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          Chưa có tài khoản nào tên <span className="font-mono">{ten}</span>. Bấm lưu
          sẽ bị máy chủ từ chối.
        </span>
      </p>
    );
  }

  if (vaiTro === "quan_tri") {
    return (
      <div className="rounded-xl bg-loi-nen px-4 py-3.5">
        <p className="flex items-center gap-2 text-[0.8125rem] font-semibold text-loi">
          <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
          Đây là tài khoản TOÀN QUYỀN
        </p>
        <p className="mt-2 text-[0.8125rem] leading-relaxed text-loi">
          Bật lên là bất kỳ ai mở trang đăng nhập cũng đọc được mật khẩu này, rồi:
        </p>
        <ul className="mt-2 space-y-1 text-[0.8125rem] leading-relaxed text-loi">
          <li>
            · xem được <span className="font-semibold">toàn bộ mục Tin nhắn</span> — họ
            tên, số điện thoại, email và lời nhắn của khách thật
          </li>
          <li>· sửa hoặc xoá mọi nội dung website</li>
          <li>· xoá vĩnh viễn ảnh trong kho</li>
        </ul>
        <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-loi">
          Nếu mật khẩu này đang dùng ở nơi khác thì đổi trước khi bật.
        </p>
      </div>
    );
  }

  return (
    <p className="flex items-start gap-2.5 rounded-xl bg-brand-soft px-4 py-3 text-[0.8125rem] leading-relaxed text-brand">
      <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>
        Tài khoản hạn chế: sửa được nội dung website, nhưng không xem được mục Tin
        nhắn và không xoá được ảnh.
      </span>
    </p>
  );
}

export default function MucTaiKhoanDemo() {
  const [dangTai, setDangTai] = useState(true);
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState("");
  const [xong, setXong] = useState("");

  const [bat, setBat] = useState(false);
  const [ten, setTen] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [vaiTro, setVaiTro] = useState(null);
  const [che, setChe] = useState(false);

  useEffect(() => {
    let con = true;
    (async () => {
      try {
        const kq = await api.docCaiDatDemo();
        if (!con) return;
        setBat(kq.bat);
        setTen(kq.ten ?? "");
        setMatKhau(kq.mat_khau ?? "");
        setVaiTro(kq.vai_tro ?? null);
      } catch (err) {
        if (con) setLoi(err.message);
      } finally {
        if (con) setDangTai(false);
      }
    })();
    return () => {
      con = false;
    };
  }, []);

  const luu = async () => {
    setLoi("");
    setXong("");
    setDangLuu(true);
    try {
      const kq = await api.ghiCaiDatDemo({ bat, ten, matKhau });
      setVaiTro(kq.vai_tro ?? null);
      setXong(
        kq.bat
          ? "Đã lưu. Dòng tài khoản đang hiện trên trang đăng nhập."
          : "Đã lưu. Trang đăng nhập không hiện dòng nào."
      );
    } catch (err) {
      setLoi(err.message);
    } finally {
      setDangLuu(false);
    }
  };

  if (dangTai) {
    return (
      <p className="flex items-center gap-2 py-10 text-sm text-ink-soft">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Đang tải cấu hình…
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-[0.8125rem] leading-relaxed text-ink-soft">
        Dòng này hiện ngay dưới nút Đăng nhập ở trang{" "}
        <span className="font-mono text-ink">/admin</span>, để người kiểm thử tự vào
        mà không phải hỏi mật khẩu. Bấm vào dòng đó là tự điền sẵn hai ô.
      </p>

      {/* ---------- Bật / tắt ---------- */}
      <label className="flex cursor-pointer items-start gap-3 rounded-card bg-mist p-4">
        <input
          type="checkbox"
          checked={bat}
          onChange={(e) => {
            setBat(e.target.checked);
            setXong("");
          }}
          className="mt-0.5 h-4 w-4 shrink-0 accent-brand"
        />
        <span>
          <span className="block text-sm font-medium text-ink">
            Hiện dòng tài khoản trên trang đăng nhập
          </span>
          <span className="mt-0.5 block text-[0.8125rem] leading-relaxed text-ink-soft">
            Tắt đi thì dòng biến mất ngay, không ai còn đọc được mật khẩu ở đó.
          </span>
        </span>
      </label>

      {/* ---------- Hai ô ---------- */}
      <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">
            Tên đăng nhập hiện ra
          </span>
          <input
            value={ten}
            onChange={(e) => {
              setTen(e.target.value);
              setXong("");
            }}
            placeholder="admin"
            autoComplete="off"
            className={O_NHAP}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-soft">
            Mật khẩu hiện ra
          </span>
          <div className="relative">
            {/* CỐ Ý để type="text" mặc định — xem quyết định 2 ở đầu file. */}
            <input
              type={che ? "password" : "text"}
              value={matKhau}
              onChange={(e) => {
                setMatKhau(e.target.value);
                setXong("");
              }}
              placeholder="imob@2026"
              autoComplete="off"
              className={`${O_NHAP} pr-11 font-mono`}
            />
            <button
              type="button"
              onClick={() => setChe((v) => !v)}
              aria-label={che ? "Hiện mật khẩu" : "Che mật khẩu"}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-ink-faint transition-colors hover:text-ink"
            >
              {che ? (
                <Eye className="h-4 w-4" aria-hidden="true" />
              ) : (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </label>
      </div>

      <CanhBao vaiTro={vaiTro} ten={ten.trim()} />

      {/* ---------- Xem trước ---------- */}
      {bat && ten.trim() && matKhau && (
        <div>
          <p className="mb-2 text-sm font-medium text-ink-soft">
            Người lạ mở trang đăng nhập sẽ thấy đúng dòng này:
          </p>
          <div className="rounded-xl bg-brand-soft px-4 py-3 text-center text-[0.8125rem] text-brand">
            Demo:{" "}
            <span className="font-mono">
              {ten.trim()} / {matKhau}
            </span>
          </div>
        </div>
      )}

      {loi && (
        <p
          role="alert"
          className="flex items-start gap-2.5 rounded-xl bg-loi-nen px-4 py-3 text-[0.8125rem] leading-relaxed text-loi"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {loi}
        </p>
      )}

      {xong && (
        <p className="flex items-start gap-2.5 rounded-xl bg-brand-soft px-4 py-3 text-[0.8125rem] text-brand">
          <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {xong}
        </p>
      )}

      <button
        type="button"
        onClick={luu}
        disabled={dangLuu}
        className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-tren-brand transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
      >
        {dangLuu && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {dangLuu ? "Đang lưu…" : "Lưu"}
      </button>
    </div>
  );
}
