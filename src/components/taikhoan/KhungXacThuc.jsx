import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Logo from "../ui/Logo.jsx";
import { useCongTy } from "../../context/NoiDungContext.jsx";

// ============================================================
// KhungXacThuc — khung của HAI trang Đăng nhập và Đăng ký.
//
// HAI TRANG NÀY ĐỨNG NGOÀI Layout: không thanh menu, không chân trang, không
// nút chat. Cố ý. Một trang đăng nhập chỉ có đúng MỘT việc phải làm, mà thanh
// menu thì bày ra mười lối đi khác — trong đó có cả "Nhận tư vấn" trông y hệt
// một nút bấm chính. Bỏ hết đi thì người ta không phải chọn gì cả.
//
// Đổi lại, phải tự lo lối quay về: logo ở góc và dòng "Về trang chủ" dưới cùng.
// Không có hai thứ đó thì trang này thành ngõ cụt.
//
// ------------------------------------------------------------
// BỐ CỤC: hai cột trên màn rộng, một cột trên điện thoại.
//
// Cột trái là tấm màu thương hiệu, và nó KHÔNG phải để trang trí: nó trả lời
// câu "tạo tài khoản để làm gì?". Bản đầu của trang này không có phần đó, và
// một form đăng ký không nói lý do thì người ta đóng tab.
//
// Cột trái ẨN trên điện thoại (dưới lg). Trên màn hẹp, đẩy một tấm màu cao
// nghều lên trên form nghĩa là bắt người ta cuộn qua quảng cáo mới tới được ô
// nhập — trong khi phần lớn người mở trang này là người đã biết mình vào để
// làm gì rồi.
// ============================================================

// Ba bước — CÓ ĐÁNH SỐ, vì đây đúng là một trình tự có thật: gửi, duyệt, rồi
// mới vào trợ lý ảo. Đánh số một danh sách không theo thứ tự thì chỉ là trang
// trí, nhưng ở đây thứ tự chính là điều cần nói: không có gì lên thẳng.
const BA_BUOC = [
  {
    tieu_de: "Bạn gửi tư liệu",
    mo_ta: "Điều bạn biết mà trợ lý ảo chưa biết: kinh nghiệm dùng sản phẩm, câu khách hay hỏi, thông tin cần đính chính.",
  },
  {
    tieu_de: "iMob xem lại",
    mo_ta: "Không có gì tự động lên. Đúng và dùng được thì mới nhận.",
  },
  {
    tieu_de: "Trợ lý ảo trả lời được",
    mo_ta: "Lần sau có người hỏi tới, câu trả lời đã nằm sẵn ở đó.",
  },
];

function TamGioiThieu() {
  const congTy = useCongTy();

  return (
    <aside className="relative hidden overflow-hidden bg-brand px-12 py-14 text-tren-brand lg:flex lg:flex-col lg:justify-between xl:px-16">
      {/* Quầng sáng mờ — cùng thủ pháp với khối đầu trang chủ, để trang này
          vẫn trông là của cùng một website chứ không phải đi mượn ở đâu về. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-tren-brand/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-tren-brand/10 blur-3xl"
      />

      <Link to="/" className="relative flex items-center gap-2.5">
        <Logo className="h-9 w-9" />
        <span className="text-[1.0625rem] font-semibold tracking-tight">
          {congTy.name}
        </span>
      </Link>

      <div className="relative max-w-md">
        <h2 className="text-[2rem] font-black leading-[1.15] tracking-tight xl:text-[2.375rem]">
          Điều bạn biết,
          <br />
          trợ lý ảo sẽ nhớ.
        </h2>
        <p className="mt-4 text-[0.9375rem] leading-relaxed text-tren-brand/75">
          Tài khoản iMob để bạn gửi tư liệu cho trợ lý ảo trên website — thứ
          đang trả lời khách mỗi ngày.
        </p>

        <ol className="mt-10 space-y-7">
          {BA_BUOC.map((buoc, i) => (
            <li key={buoc.tieu_de} className="relative flex gap-4">
              {/* Đường nối dọc giữa các bước, trừ bước cuối. Nó làm ba mục rời
                  rạc thành một mạch đi từ trên xuống — đúng cái đang muốn kể. */}
              {i < BA_BUOC.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[0.9375rem] top-9 h-[calc(100%+0.5rem)] w-px bg-tren-brand/25"
                />
              )}
              <span
                aria-hidden="true"
                className="relative z-10 flex h-[1.875rem] w-[1.875rem] shrink-0 items-center justify-center rounded-full border border-tren-brand/30 bg-brand text-[0.8125rem] font-semibold"
              >
                {i + 1}
              </span>
              <div className="pt-0.5">
                <p className="font-semibold leading-snug">{buoc.tieu_de}</p>
                <p className="mt-1 text-sm leading-relaxed text-tren-brand/70">
                  {buoc.mo_ta}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="relative text-sm text-tren-brand/60">
        Cần giúp? Gọi {congTy.phone}
      </p>
    </aside>
  );
}

export default function KhungXacThuc({ tieuDe, dan, loi, onSubmit, children, chan }) {
  const congTy = useCongTy();

  return (
    <div className="min-h-dvh bg-paper text-ink lg:grid lg:grid-cols-[1.05fr_1fr]">
      <TamGioiThieu />

      <main className="flex min-h-dvh flex-col justify-center px-5 py-12 sm:px-10 lg:min-h-0 lg:px-14 xl:px-20">
        <div className="mx-auto w-full max-w-[25rem]">
          {/* Logo chỉ hiện trên màn hẹp — màn rộng đã có logo ở tấm bên trái,
              hai cái cùng lúc là thừa. */}
          <Link to="/" className="mb-9 flex items-center gap-2.5 lg:hidden">
            <Logo className="h-9 w-9" />
            <span className="text-[1.0625rem] font-semibold tracking-tight text-ink">
              {congTy.name}
            </span>
          </Link>

          <h1 className="text-[1.75rem] font-black tracking-tight text-ink sm:text-3xl">
            {tieuDe}
          </h1>
          {dan && (
            <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-soft">
              {dan}
            </p>
          )}

          {/* role="alert" để trình đọc màn hình đọc lên NGAY khi lỗi hiện ra.
              Không có nó thì người dùng bàn phím bấm "Đăng nhập", không nghe
              thấy gì, và không biết vì sao trang đứng im. */}
          {loi && (
            <p
              role="alert"
              className="mt-6 flex items-start gap-2 rounded-xl border border-loi/25 bg-loi-nen px-3.5 py-3 text-sm leading-relaxed text-loi"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {loi}
            </p>
          )}

          <form onSubmit={onSubmit} className="mt-7 space-y-5">
            {children}
          </form>

          {chan && (
            <div className="mt-7 border-t border-line pt-6 text-sm text-ink-soft">
              {chan}
            </div>
          )}

          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-1.5 text-sm text-ink-faint transition-colors hover:text-brand"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Về trang chủ
          </Link>
        </div>
      </main>
    </div>
  );
}

// Ô nhập có nhãn. `goiY` là dòng chữ nhỏ dưới ô — nối vào ô bằng
// aria-describedby để trình đọc màn hình đọc kèm, chứ không chỉ để nhìn.
export function OChu({ nhan, id, goiY, ...props }) {
  const maGoiY = goiY ? `${id}-goi-y` : undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {nhan}
      </label>
      <input
        id={id}
        aria-describedby={maGoiY}
        className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-[0.9375rem] text-ink outline-none transition placeholder:text-ink-faint/70 focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:bg-mist disabled:text-ink-faint"
        {...props}
      />
      {goiY && (
        <p id={maGoiY} className="mt-1.5 text-xs leading-relaxed text-ink-faint">
          {goiY}
        </p>
      )}
    </div>
  );
}
