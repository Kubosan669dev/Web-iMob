import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import KhungForm, { OChu } from "../components/taikhoan/KhungForm.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import { useCongTy } from "../context/NoiDungContext.jsx";
import { useTaiKhoan } from "../context/TaiKhoanContext.jsx";
import { VAI_QUAN_TRI } from "../services/taiKhoanService.js";

export default function DangNhapPage() {
  const congTy = useCongTy();
  useDocumentTitle(`Đăng nhập — ${congTy.name}`);

  const { nguoi, dangNhap } = useTaiKhoan();
  const dieuHuong = useNavigate();
  const viTri = useLocation();

  // Nơi cần quay lại sau khi đăng nhập xong. Trang nào đá người ta sang đây sẽ
  // gửi kèm đường dẫn của nó trong `state.tu`. Không có thì về trang hồ sơ.
  const diTiep = viTri.state?.tu || "/tai-khoan";

  const [ten, setTen] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [loi, setLoi] = useState("");
  const [dangGui, setDangGui] = useState(false);

  // Đã đăng nhập rồi mà mở /dang-nhap thì đi thẳng, đừng bắt gõ lại. Hay gặp
  // khi bấm nút Quay lại của trình duyệt sau lúc vừa đăng nhập xong.
  useEffect(() => {
    if (nguoi) dieuHuong(diTiep, { replace: true });
  }, [nguoi, diTiep, dieuHuong]);

  async function gui(e) {
    e.preventDefault();
    if (dangGui) return;
    setLoi("");
    setDangGui(true);
    try {
      const kq = await dangNhap({ tenDangNhap: ten, matKhau });
      // Quản trị đăng nhập ở đây thì đưa thẳng vào /admin. Họ vào form này gần
      // như luôn là do bấm nhầm, và trang hồ sơ thành viên chẳng có gì cho họ.
      dieuHuong(kq.vai_tro === VAI_QUAN_TRI ? "/admin" : diTiep, { replace: true });
    } catch (err) {
      setLoi(err.message);
      setDangGui(false);
    }
  }

  return (
    <KhungForm
      tieuDe="Đăng nhập"
      dan="Đăng nhập để gửi tư liệu cho trợ lý ảo của iMob."
      loi={loi}
      onSubmit={gui}
      chan={
        <>
          Chưa có tài khoản?{" "}
          <Link to="/dang-ky" className="font-semibold text-brand hover:underline">
            Đăng ký
          </Link>
          <p className="mt-3 text-xs leading-relaxed text-ink-faint">
            Quên mật khẩu thì nhắn cho iMob theo số {congTy.phone} để được đặt lại
            giúp — hiện website chưa tự gửi email đặt lại được.
          </p>
        </>
      }
    >
      <OChu
        id="ten-dang-nhap"
        nhan="Tên đăng nhập"
        value={ten}
        onChange={(e) => setTen(e.target.value)}
        autoComplete="username"
        autoCapitalize="none"
        spellCheck="false"
        required
        disabled={dangGui}
      />
      <OChu
        id="mat-khau"
        nhan="Mật khẩu"
        type="password"
        value={matKhau}
        onChange={(e) => setMatKhau(e.target.value)}
        autoComplete="current-password"
        required
        disabled={dangGui}
      />
      <Button type="submit" className="w-full" disabled={dangGui}>
        {dangGui && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {dangGui ? "Đang đăng nhập…" : "Đăng nhập"}
      </Button>
    </KhungForm>
  );
}
