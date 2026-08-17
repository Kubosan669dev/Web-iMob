import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

// ============================================================
// Bộ ô nhập của trang quản trị.
//
// ĐỔI 17/08/2026 — dùng CHUNG hệ thiết kế sáng với trang khách.
//
// Trước đây trang quản trị cố ý để nền tối theo lối "xưởng sau cửa hàng", và
// nhãn dùng chữ MONO VIẾT HOA giãn rộng để phân biệt nhãn với nội dung. Giờ bỏ
// cả hai. Lý do: một hệ thiết kế thì dễ nhớ hơn hai, và người ngồi soạn nội
// dung cho trang sáng mà cứ phải nhảy qua lại giữa hai tông màu thì mỗi lần
// chuyển là mắt phải thích nghi lại.
//
// Ô nhập giống hệt form Liên hệ ngoài trang chủ: nền xám nhạt, KHÔNG viền,
// viền chỉ hiện lúc đang gõ. Một form 20 ô là bớt được 20 đường kẻ.
// ============================================================

const O_NHAP =
  "w-full rounded-xl border border-transparent bg-mist px-3.5 py-2.5 text-[0.9375rem] " +
  "text-ink placeholder-ink-faint outline-none transition-colors duration-150 " +
  "focus:border-brand focus:bg-panel";

const NHAN = "mb-1.5 flex items-center gap-2 text-sm font-medium text-ink-soft";

/** Chấm tròn báo ô này đã sửa mà chưa lưu.
    Giữ màu hổ phách chứ không đổi sang màu thương hiệu: đây là tín hiệu CẢNH
    BÁO ("còn dở dang"), không phải màu trang trí. Dùng đúng một màu khác với
    màu thương hiệu để mắt bắt được ngay. */
function ChamDoi({ hien }) {
  if (!hien) return null;
  return (
    <span
      title="Đã sửa, chưa lưu"
      className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"
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
  return (
    <span className="mt-1.5 block text-[0.8125rem] leading-relaxed text-ink-faint">
      {children}
    </span>
  );
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
 * Mỗi từ là một thẻ nhìn thấy được, xoá được, kèm ô xem thử chạy đúng nhịp như
 * ngoài trang chủ — thứ trừu tượng nhất của cả trang quản trị được cho nhìn tận
 * mắt. (Bản tham chiếu để đây là một ô text "cách nhau bằng dấu phẩy": người
 * dùng phải tự tưởng tượng danh sách trông ra sao, và một dấu phẩy thừa là sinh
 * ra từ rỗng mà không ai thấy.)
 *
 * ⚠️ ĐÃ BỎ .toUpperCase() (17/08/2026). Trước đây từ mới bị ép viết hoa vì
 * tiêu đề trang chủ hồi đó là tiếng Anh in hoa ("INNOVATION", "TECHNOLOGY").
 * Tiêu đề giờ là tiếng Việt viết thường ("chính quyền số", "di sản Yên Tử") —
 * ép viết hoa sẽ làm hỏng dấu và sai hẳn kiểu chữ của trang.
 */
export function OTuKhoa({ nhan, danhSach, doi, moTa, daSua = false }) {
  const tu = danhSach ?? [];
  const [dangGo, setDangGo] = useState("");
  const [xem, setXem] = useState(0);

  // Ô xem thử: đổi từ mỗi 2.6 giây, đúng nhịp của trang chủ (Hero.jsx).
  // Sửa nhịp ở Hero.jsx thì nhớ sửa cả đây, không thì xem thử nói dối.
  useEffect(() => {
    if (tu.length < 2) return;
    const timer = setInterval(() => setXem((i) => (i + 1) % tu.length), 2600);
    return () => clearInterval(timer);
  }, [tu.length]);

  const them = () => {
    const moi = dangGo.trim();
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

      <div className="rounded-xl border border-transparent bg-mist p-2.5 transition-colors focus-within:border-brand focus-within:bg-panel">
        <div className="flex flex-wrap gap-1.5">
          {tu.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 rounded-lg bg-brand-soft py-1 pl-2.5 pr-1 text-[0.8125rem] font-medium text-brand"
            >
              {t}
              <button
                type="button"
                onClick={() => doi(tu.filter((x) => x !== t))}
                aria-label={`Bỏ từ ${t}`}
                className="rounded p-0.5 text-brand/60 transition-colors hover:bg-brand/15 hover:text-brand"
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
            className="min-w-[9rem] flex-1 bg-transparent px-1.5 py-1 text-[0.9375rem] text-ink placeholder-ink-faint outline-none"
          />
        </div>
      </div>

      <MoTa>{moTa ?? "Enter hoặc dấu phẩy để thêm. Backspace khi ô trống để xoá từ cuối."}</MoTa>

      {tu.length > 0 && (
        <div className="mt-3 flex items-baseline gap-3 rounded-xl bg-mist px-3.5 py-3">
          <span className="text-[0.8125rem] text-ink-faint">Xem thử</span>
          <span className="tieu-de-lon text-xl text-brand">
            {tu[xem % tu.length]}
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
