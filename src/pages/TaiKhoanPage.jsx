import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Check, Loader2, LogOut, Shield, Sparkles, UserRound } from "lucide-react";
import Container from "../components/ui/Container.jsx";
import Button from "../components/ui/Button.jsx";
import { OChu } from "../components/taikhoan/KhungForm.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import { useCongTy } from "../context/NoiDungContext.jsx";
import { useTaiKhoan } from "../context/TaiKhoanContext.jsx";
import {
  VAI_QUAN_TRI,
  doiMatKhau,
  ngayViet,
  suaHoSo,
  tenGoi,
} from "../services/taiKhoanService.js";

// Một thẻ trắng có tiêu đề — dùng lại cho cả ba khối bên dưới.
function The({ tieuDe, mo_ta, children }) {
  return (
    <section className="rounded-2xl border border-line bg-paper/60 p-6 sm:p-7">
      <h2 className="text-lg font-bold tracking-tight text-ink">{tieuDe}</h2>
      {mo_ta && <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{mo_ta}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

// Dòng báo "đã lưu" / lỗi dùng chung cho hai form. Cùng một chỗ, cùng một kiểu,
// nên người dùng không phải đi tìm xem kết quả hiện ở đâu.
function BaoKetQua({ loi, xong, chuXong }) {
  if (loi) {
    return (
      <p role="alert" className="text-sm text-red-700">
        {loi}
      </p>
    );
  }
  if (xong) {
    return (
      <p role="status" className="flex items-center gap-1.5 text-sm text-brand">
        <Check className="h-4 w-4" aria-hidden="true" />
        {chuXong}
      </p>
    );
  }
  return null;
}

export default function TaiKhoanPage() {
  const congTy = useCongTy();
  useDocumentTitle(`Tài khoản — ${congTy.name}`);

  const { nguoi, dangKiemTra, dangXuat, capNhat } = useTaiKhoan();
  const viTri = useLocation();

  const [hoTen, setHoTen] = useState("");
  const [luuTen, setLuuTen] = useState({ dang: false, loi: "", xong: false });

  const [matKhauCu, setMatKhauCu] = useState("");
  const [matKhauMoi, setMatKhauMoi] = useState("");
  const [nhacLai, setNhacLai] = useState("");
  const [doiMk, setDoiMk] = useState({ dang: false, loi: "", xong: false });

  // Hồ sơ về sau lời gọi mạng nên lần dựng đầu `nguoi` có thể chưa có ho_ten.
  useEffect(() => {
    if (nguoi) setHoTen(nguoi.ho_ten || "");
  }, [nguoi]);

  // Đang hỏi máy chủ xem vé còn giá trị không thì chưa kết luận được gì. Bỏ
  // nhánh này là trang chớp một nhịp rồi đá thẳng người đang đăng nhập về
  // /dang-nhap mỗi lần tải lại trang.
  if (dangKiemTra) {
    return (
      <section className="py-32">
        <Container rong="max-w-2xl">
          <p className="flex items-center gap-2 text-sm text-ink-soft">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Đang mở tài khoản…
          </p>
        </Container>
      </section>
    );
  }

  if (!nguoi) {
    // Gửi kèm đường dẫn hiện tại để đăng nhập xong quay lại đúng đây.
    return <Navigate to="/dang-nhap" replace state={{ tu: viTri.pathname }} />;
  }

  const laQuanTri = nguoi.vai_tro === VAI_QUAN_TRI;

  async function guiTen(e) {
    e.preventDefault();
    if (luuTen.dang) return;
    setLuuTen({ dang: true, loi: "", xong: false });
    try {
      const hs = await suaHoSo(hoTen.trim());
      capNhat((cu) => ({ ...cu, ...hs }));
      setLuuTen({ dang: false, loi: "", xong: true });
    } catch (err) {
      setLuuTen({ dang: false, loi: err.message, xong: false });
    }
  }

  async function guiMatKhau(e) {
    e.preventDefault();
    if (doiMk.dang) return;
    if (matKhauMoi !== nhacLai) {
      setDoiMk({ dang: false, loi: "Hai ô mật khẩu mới chưa giống nhau.", xong: false });
      return;
    }
    setDoiMk({ dang: true, loi: "", xong: false });
    try {
      await doiMatKhau(matKhauCu, matKhauMoi);
      // Xóa sạch ba ô sau khi đổi xong. Để mật khẩu nằm lại trong ô là nó còn
      // nằm trong trang, và trang này có thể đang mở trên một máy dùng chung.
      setMatKhauCu("");
      setMatKhauMoi("");
      setNhacLai("");
      setDoiMk({ dang: false, loi: "", xong: true });
    } catch (err) {
      setDoiMk({ dang: false, loi: err.message, xong: false });
    }
  }

  return (
    <section className="relative overflow-hidden py-28 lg:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl"
      />

      <Container rong="max-w-2xl" className="relative">
        <header className="mb-10 flex flex-wrap items-start justify-between gap-4 border-b border-line pb-8">
          <div className="flex items-center gap-4">
            <span
              aria-hidden="true"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand"
            >
              {laQuanTri ? <Shield className="h-6 w-6" /> : <UserRound className="h-6 w-6" />}
            </span>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-ink sm:text-3xl">
                {tenGoi(nguoi)}
              </h1>
              <p className="mt-1 text-sm text-ink-soft">
                {nguoi.ten_dang_nhap}
                {laQuanTri ? " · quản trị" : " · thành viên"}
                {nguoi.tao_luc ? ` · tham gia ${ngayViet(nguoi.tao_luc)}` : ""}
              </p>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={dangXuat}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Đăng xuất
          </Button>
        </header>

        <div className="space-y-6">
          {/* Khối này là lý do tài khoản tồn tại, nên để trên cùng. Phần gửi
              tư liệu làm ở bước sau; chưa xong thì nói thẳng là chưa xong,
              đừng để một nút bấm vào không ra gì. */}
          <The
            tieuDe="Gửi tư liệu cho trợ lý ảo"
            mo_ta="Bạn biết điều gì mà trợ lý ảo của iMob chưa biết — kinh nghiệm dùng sản phẩm, câu khách hay hỏi, thông tin cần đính chính — thì gửi vào đây. iMob xem rồi mới đưa vào."
          >
            <p className="flex items-start gap-2 rounded-xl bg-brand-soft px-4 py-3 text-sm leading-relaxed text-brand">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Phần này đang được làm nốt. Tài khoản của bạn đã sẵn sàng, mở lại
              trang này ít hôm nữa là dùng được.
            </p>
          </The>

          <The tieuDe="Tên hiển thị" mo_ta="Tên mọi người thấy. Tên đăng nhập thì không đổi được.">
            <form onSubmit={guiTen} className="space-y-4">
              <OChu
                id="ho-ten"
                nhan="Tên hiển thị"
                value={hoTen}
                onChange={(e) => {
                  setHoTen(e.target.value);
                  setLuuTen((c) => ({ ...c, xong: false, loi: "" }));
                }}
                maxLength={60}
                autoComplete="name"
                disabled={luuTen.dang}
              />
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" size="sm" disabled={luuTen.dang}>
                  {luuTen.dang && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {luuTen.dang ? "Đang lưu…" : "Lưu tên"}
                </Button>
                <BaoKetQua loi={luuTen.loi} xong={luuTen.xong} chuXong="Đã lưu." />
              </div>
            </form>
          </The>

          <The tieuDe="Đổi mật khẩu">
            <form onSubmit={guiMatKhau} className="space-y-4">
              <OChu
                id="mat-khau-cu"
                nhan="Mật khẩu hiện tại"
                type="password"
                value={matKhauCu}
                onChange={(e) => setMatKhauCu(e.target.value)}
                autoComplete="current-password"
                required
                disabled={doiMk.dang}
              />
              <OChu
                id="mat-khau-moi"
                nhan="Mật khẩu mới"
                type="password"
                value={matKhauMoi}
                onChange={(e) => setMatKhauMoi(e.target.value)}
                autoComplete="new-password"
                goiY="Ít nhất 8 ký tự."
                required
                disabled={doiMk.dang}
              />
              <OChu
                id="nhac-lai"
                nhan="Nhắc lại mật khẩu mới"
                type="password"
                value={nhacLai}
                onChange={(e) => setNhacLai(e.target.value)}
                autoComplete="new-password"
                required
                disabled={doiMk.dang}
              />
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" size="sm" disabled={doiMk.dang}>
                  {doiMk.dang && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {doiMk.dang ? "Đang đổi…" : "Đổi mật khẩu"}
                </Button>
                <BaoKetQua loi={doiMk.loi} xong={doiMk.xong} chuXong="Đã đổi mật khẩu." />
              </div>
            </form>
          </The>

          {laQuanTri && (
            <p className="text-sm text-ink-soft">
              Bạn đang đăng nhập bằng tài khoản quản trị. Phần soạn nội dung
              website nằm ở{" "}
              <a href="/admin" className="font-semibold text-brand hover:underline">
                trang quản trị
              </a>
              .
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
