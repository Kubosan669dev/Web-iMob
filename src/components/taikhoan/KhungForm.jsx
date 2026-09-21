import { AlertCircle } from "lucide-react";
import Container from "../ui/Container.jsx";

// ============================================================
// Khung chung cho hai trang Đăng nhập và Đăng ký.
//
// Hai trang đó giống nhau gần hết: cùng một thẻ giữa màn hình, cùng chỗ đặt
// tiêu đề, cùng ô báo lỗi, cùng dòng chân dẫn sang trang kia. Viết hai lần thì
// sớm muộn một bên được chỉnh còn bên kia quên, và người dùng đi qua lại giữa
// hai trang sẽ thấy giao diện nhảy — lỗi không ai báo, chỉ làm mất tin tưởng.
// ============================================================
export default function KhungForm({ tieuDe, dan, loi, onSubmit, children, chan }) {
  return (
    <section className="relative overflow-hidden py-28 lg:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl"
      />

      <Container rong="max-w-md" className="relative">
        <div className="rounded-2xl border border-line bg-paper/60 p-7 shadow-lg backdrop-blur-sm sm:p-9">
          <h1 className="text-2xl font-black tracking-tight text-ink">{tieuDe}</h1>
          {dan && <p className="mt-2 text-sm leading-relaxed text-ink-soft">{dan}</p>}

          {/* role="alert" để trình đọc màn hình đọc lên ngay khi lỗi hiện ra.
              Không có nó thì người dùng bàn phím bấm "Đăng nhập", không nghe
              thấy gì, và không biết vì sao trang đứng im. */}
          {loi && (
            <p
              role="alert"
              className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-relaxed text-red-800"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {loi}
            </p>
          )}

          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            {children}
          </form>

          {chan && <div className="mt-6 border-t border-line pt-5 text-sm text-ink-soft">{chan}</div>}
        </div>
      </Container>
    </section>
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
        className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-[0.9375rem] text-ink outline-none transition placeholder:text-ink-faint focus:border-brand focus:ring-2 focus:ring-brand/20"
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
