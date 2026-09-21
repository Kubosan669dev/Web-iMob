import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import KhungXacThuc, { OChu } from "../components/taikhoan/KhungXacThuc.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import { useCongTy } from "../context/NoiDungContext.jsx";
import { useTaiKhoan } from "../context/TaiKhoanContext.jsx";

// Phải khớp với api_thanh_vien.py bên máy chủ. Kiểm ở đây CHỈ để báo lỗi ngay
// khi gõ, khỏi phải chờ một vòng lên máy chủ mới biết tên không hợp lệ. Hàng
// rào thật nằm ở máy chủ — chỗ này sửa được bằng F12 trong ba giây.
const MAU_TEN = /^[a-z0-9][a-z0-9._-]{2,23}$/;
const DAI_MAT_KHAU_TOI_THIEU = 8;

export default function DangKyPage() {
  const congTy = useCongTy();
  useDocumentTitle(`Đăng ký — ${congTy.name}`);

  const { nguoi, dangKy } = useTaiKhoan();
  const dieuHuong = useNavigate();

  const [hoTen, setHoTen] = useState("");
  const [ten, setTen] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [nhacLai, setNhacLai] = useState("");
  const [loi, setLoi] = useState("");
  const [dangGui, setDangGui] = useState(false);

  useEffect(() => {
    if (nguoi) dieuHuong("/tai-khoan", { replace: true });
  }, [nguoi, dieuHuong]);

  function loiTaiCho() {
    const t = ten.trim().toLowerCase();
    if (!MAU_TEN.test(t)) {
      return "Tên đăng nhập gồm 3–24 ký tự, chỉ chữ thường không dấu, số và các dấu . _ - (ví dụ: nam.tran).";
    }
    if (matKhau.length < DAI_MAT_KHAU_TOI_THIEU) {
      return `Mật khẩu cần ít nhất ${DAI_MAT_KHAU_TOI_THIEU} ký tự.`;
    }
    // Ô nhắc lại tồn tại vì mật khẩu gõ ra dấu chấm — gõ nhầm một phím là mất
    // tài khoản ngay từ phút đầu, mà không có cách nào tự lấy lại.
    if (matKhau !== nhacLai) {
      return "Hai ô mật khẩu chưa giống nhau.";
    }
    return "";
  }

  async function gui(e) {
    e.preventDefault();
    if (dangGui) return;

    const loiGan = loiTaiCho();
    if (loiGan) {
      setLoi(loiGan);
      return;
    }

    setLoi("");
    setDangGui(true);
    try {
      await dangKy({
        tenDangNhap: ten.trim().toLowerCase(),
        matKhau,
        hoTen: hoTen.trim(),
      });
      // Đăng ký xong là đã đăng nhập luôn (máy chủ trả vé kèm), nên đi thẳng
      // vào hồ sơ chứ không đá về trang đăng nhập.
      dieuHuong("/tai-khoan", { replace: true });
    } catch (err) {
      setLoi(err.message);
      setDangGui(false);
    }
  }

  return (
    <KhungXacThuc
      tieuDe="Tạo tài khoản"
      dan="Có tài khoản là bạn gửi được tư liệu cho trợ lý ảo của iMob: kinh nghiệm, câu hỏi hay gặp, thông tin cần đính chính."
      loi={loi}
      onSubmit={gui}
      chan={
        <>
          Đã có tài khoản?{" "}
          <Link to="/dang-nhap" className="font-semibold text-brand hover:underline">
            Đăng nhập
          </Link>
          <p className="mt-3 text-xs leading-relaxed text-ink-faint">
            Đăng ký không cần email. Đổi lại, quên mật khẩu thì phải nhờ iMob đặt
            lại giúp qua số {congTy.phone} — bạn chọn mật khẩu nào dễ nhớ nhé.
          </p>
        </>
      }
    >
      <OChu
        id="ho-ten"
        nhan="Tên hiển thị"
        value={hoTen}
        onChange={(e) => setHoTen(e.target.value)}
        autoComplete="name"
        maxLength={60}
        placeholder="Trần Văn Nam"
        goiY="Tên mọi người thấy. Có dấu, có khoảng trắng đều được. Bỏ trống cũng không sao."
        disabled={dangGui}
      />
      <OChu
        id="ten-dang-nhap"
        nhan="Tên đăng nhập"
        value={ten}
        onChange={(e) => setTen(e.target.value)}
        autoComplete="username"
        autoCapitalize="none"
        spellCheck="false"
        maxLength={24}
        placeholder="nam.tran"
        goiY="Dùng để đăng nhập. Chữ thường không dấu, số và các dấu . _ - · 3–24 ký tự."
        required
        disabled={dangGui}
      />
      <OChu
        id="mat-khau"
        nhan="Mật khẩu"
        type="password"
        value={matKhau}
        onChange={(e) => setMatKhau(e.target.value)}
        autoComplete="new-password"
        goiY={`Ít nhất ${DAI_MAT_KHAU_TOI_THIEU} ký tự. Một câu ngắn dễ nhớ thì vừa an toàn vừa không phải ghi ra giấy.`}
        required
        disabled={dangGui}
      />
      <OChu
        id="nhac-lai"
        nhan="Nhắc lại mật khẩu"
        type="password"
        value={nhacLai}
        onChange={(e) => setNhacLai(e.target.value)}
        autoComplete="new-password"
        required
        disabled={dangGui}
      />
      <Button type="submit" className="w-full" disabled={dangGui}>
        {dangGui && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {dangGui ? "Đang tạo tài khoản…" : "Tạo tài khoản"}
      </Button>
    </KhungXacThuc>
  );
}
