import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

// ============================================================
// Bộ ô nhập của trang quản trị.
//
// HƯỚNG THIẾT KẾ — "xưởng sau cửa hàng":
// Trang chủ là gian trưng bày: tối, gradient, hiệu ứng. Trang quản trị là chỗ
// làm việc, nên cùng tông tối cho quen mắt nhưng CẮT gần hết hiệu ứng — không
// gradient, không glow, không animation thừa. Chỉ giữ đúng một màu nhấn (cyan
// --color-neon của site) và chỉ dùng cho thứ đang được chọn / đang gõ. Nhìn
// vào là biết ngay con trỏ đang ở đâu.
//
// Nhãn dùng chữ MONO viết hoa, giãn chữ: nhãn là siêu dữ liệu (nói về ô nhập),
// khác hẳn nội dung thật bạn gõ vào — cho hai thứ hai kiểu chữ khác nhau thì
// mắt phân biệt được ngay mà không cần kẻ khung.
// ============================================================

const O_NHAP =
  "w-full rounded-lg border bg-black/40 px-3.5 py-2.5 text-sm text-gray-100 " +
  "placeholder-gray-600 outline-none transition-colors duration-150 " +
  "border-white/10 hover:border-white/20 " +
  "focus:border-neon/70 focus:bg-black/60 focus:ring-1 focus:ring-neon/40";

const NHAN =
  "mb-1.5 flex items-center gap-2 font-mono text-[11px] font-medium uppercase " +
  "tracking-[0.12em] text-gray-500";

/** Chấm tròn báo ô này đã sửa mà chưa lưu. */
function ChamDoi({ hien }) {
  if (!hien) return null;
  return (
    <span
      title="Đã sửa, chưa lưu"
      className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400"
    />
  );
}

function Nhan({ children, doi }) {
  return (
    <span className={NHAN}>
      {children}
      <ChamDoi hien={doi} />
    </span>
  );
}

function MoTa({ children }) {
  if (!children) return null;
  return <span className="mt-1.5 block text-xs text-gray-600">{children}</span>;
}

/** Ô nhập một dòng. */
export function O({ nhan, giaTri, doi, moTa, daSua = false, ...props }) {
  return (
    <label className="block">
      <Nhan doi={daSua}>{nhan}</Nhan>
      <input
        className={O_NHAP}
        value={giaTri ?? ""}
        onChange={(e) => doi(e.target.value)}
        {...props}
      />
      <MoTa>{moTa}</MoTa>
    </label>
  );
}

/**
 * Ô nhập nhiều dòng, TỰ CAO DẦN theo nội dung.
 *
 * Vì sao không để chiều cao cố định: các ô mô tả ở đây dài ngắn rất khác nhau.
 * Cao cố định thì hoặc chừa thừa một khoảng trống lớn, hoặc bắt người soạn cuộn
 * trong một ô bé xíu để đọc lại đoạn mình vừa viết.
 */
export function ODai({ nhan, giaTri, doi, moTa, daSua = false, dongToiThieu = 3, ...props }) {
  const oRef = useRef(null);

  useEffect(() => {
    const o = oRef.current;
    if (!o) return;
    // Đặt về auto trước rồi mới đo: nếu không, scrollHeight giữ nguyên chiều
    // cao cũ và ô chỉ phình ra chứ không bao giờ co lại khi xoá bớt chữ.
    o.style.height = "auto";
    o.style.height = `${o.scrollHeight}px`;
  }, [giaTri]);

  return (
    <label className="block">
      <Nhan doi={daSua}>{nhan}</Nhan>
      <textarea
        ref={oRef}
        rows={dongToiThieu}
        className={`${O_NHAP} resize-none leading-relaxed`}
        value={giaTri ?? ""}
        onChange={(e) => doi(e.target.value)}
        {...props}
      />
      <MoTa>{moTa}</MoTa>
    </label>
  );
}

/**
 * Ô nhập cho DANH SÁCH chuỗi: mỗi dòng là một phần tử.
 * Dùng cho `items` / `paragraphs` của trang pháp lý — soạn văn bản dài thì gõ
 * liền mạch rồi xuống dòng là nhanh nhất, lại dễ dán từ Word sang.
 */
export function ODanhSach({ nhan, danhSach, doi, moTa, daSua = false, dongToiThieu = 4 }) {
  return (
    <ODai
      nhan={nhan}
      daSua={daSua}
      dongToiThieu={dongToiThieu}
      giaTri={(danhSach ?? []).join("\n")}
      doi={(v) => doi(v.split("\n"))}
      moTa={moTa ?? "Mỗi dòng là một ý. Dòng trống sẽ bị bỏ qua khi lưu."}
    />
  );
}

/**
 * Ô nhập TỪ KHOÁ ĐỘNG của tiêu đề trang chủ.
 *
 * Bản tham chiếu để đây là một ô text "cách nhau bằng dấu phẩy" — người dùng
 * phải tự tưởng tượng cái danh sách đó trông ra sao, và một dấu phẩy thừa là
 * sinh ra từ rỗng mà không ai thấy. Ở đây mỗi từ là một thẻ nhìn thấy được, xoá
 * được, kèm ô xem thử chạy đúng như ngoài trang chủ — thứ trừu tượng nhất của
 * cả trang quản trị được cho nhìn tận mắt.
 */
export function OTuKhoa({ nhan, danhSach, doi, moTa, daSua = false }) {
  const tu = danhSach ?? [];
  const [dangGo, setDangGo] = useState("");
  const [xem, setXem] = useState(0);

  // Ô xem thử: đổi từ mỗi 2.2 giây, đúng nhịp của trang chủ (Hero.jsx).
  useEffect(() => {
    if (tu.length < 2) return;
    const timer = setInterval(() => setXem((i) => (i + 1) % tu.length), 2200);
    return () => clearInterval(timer);
  }, [tu.length]);

  const them = () => {
    const moi = dangGo.trim().toUpperCase();
    if (!moi || tu.includes(moi)) {
      setDangGo("");
      return;
    }
    doi([...tu, moi]);
    setDangGo("");
  };

  const phimGo = (e) => {
    // Enter hoặc dấu phẩy đều thêm từ — người quen gõ phẩy vẫn dùng được.
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      them();
    } else if (e.key === "Backspace" && !dangGo && tu.length) {
      doi(tu.slice(0, -1));
    }
  };

  return (
    <div>
      <Nhan doi={daSua}>{nhan}</Nhan>

      <div className="rounded-lg border border-white/10 bg-black/40 p-2.5 transition-colors focus-within:border-neon/70 focus-within:ring-1 focus-within:ring-neon/40">
        <div className="flex flex-wrap gap-1.5">
          {tu.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] py-1 pl-2.5 pr-1 font-mono text-xs text-gray-200"
            >
              {t}
              <button
                type="button"
                onClick={() => doi(tu.filter((x) => x !== t))}
                aria-label={`Bỏ từ ${t}`}
                className="rounded p-0.5 text-gray-500 transition-colors hover:bg-white/10 hover:text-red-300"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          ))}

          <input
            value={dangGo}
            onChange={(e) => setDangGo(e.target.value)}
            onKeyDown={phimGo}
            onBlur={them}
            placeholder={tu.length ? "Thêm từ…" : "Gõ một từ rồi Enter"}
            aria-label="Thêm từ khoá mới"
            className="min-w-[9rem] flex-1 bg-transparent px-1.5 py-1 text-sm text-gray-100 placeholder-gray-600 outline-none"
          />
        </div>
      </div>

      <MoTa>{moTa ?? "Enter hoặc dấu phẩy để thêm. Backspace khi ô trống để xoá từ cuối."}</MoTa>

      {tu.length > 0 && (
        <div className="mt-3 flex items-baseline gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-gray-600">
            Xem thử
          </span>
          <span className="text-lg font-black tracking-tight text-white">
            <span className="bg-gradient-to-r from-blue-500 via-sky-300 to-white bg-clip-text text-transparent">
              {tu[xem % tu.length]}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

/** Bỏ các dòng trống trong mảng chuỗi — gọi ngay trước khi gửi lên máy chủ. */
export function locDongTrong(danhSach) {
  return (danhSach ?? []).map((s) => s.trim()).filter(Boolean);
}
