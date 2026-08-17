import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  Download,
  Inbox,
  Loader2,
  LogOut,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldCheck,
} from "lucide-react";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import { O, ODai, ODanhSach, OTuKhoa, locDongTrong } from "../components/admin/Fields.jsx";
import * as api from "../services/adminService.js";

// ============================================================
// AdminPage — trang quản trị nội dung (/admin).
//
// BA QUYẾT ĐỊNH THIẾT KẾ, và lý do:
//
// 1. ĐIỀU HƯỚNG DỌC BÊN TRÁI, XẾP THEO THỨ TỰ TRÊN TRANG CHỦ.
//    Các mục Hero → Giới thiệu → Liên hệ được đánh số 01/02/03 vì chúng THẬT SỰ
//    nằm theo thứ tự đó khi khách cuộn trang chủ — con số nói lên điều có thật
//    chứ không phải trang trí. Tin nhắn và Trang pháp lý không nằm trên trang
//    chủ nên tách nhóm riêng, KHÔNG đánh số. Rail dọc cũng đọc tên mục dễ hơn
//    hàng tab ngang khi có nhiều mục.
//
// 2. THANH LƯU CHỈ HIỆN KHI CÓ THAY ĐỔI, và nói rõ đang sửa những gì.
//    Nút "Lưu" lúc nào cũng sáng thì không cho biết điều gì: bấm rồi cũng không
//    chắc mình vừa đổi cái gì, và đóng tab lúc đang sửa dở thì mất trắng mà
//    không được cảnh báo. Ở đây mỗi ô đã sửa có chấm vàng, thanh dưới đếm số
//    mục đang sửa, và rời trang khi chưa lưu thì trình duyệt hỏi lại.
//
// 3. MỖI MỤC CÓ LINK "XEM TRÊN WEB".
//    Đang sửa chữ mà không nhớ nó hiện ở chỗ nào trên trang là chuyện thường —
//    bấm một cái là nhảy thẳng tới đúng khối đó.
//
// Bảo vệ thật nằm ở máy chủ (đăng nhập + vé JWT, xem chatbot-python/auth.py).
// Đường dẫn /admin không có trong menu và bị robots.txt chặn, nhưng "giấu
// đường dẫn" KHÔNG phải là bảo mật.
// ============================================================

/* Mục nào sửa khoá nội dung nào, và nằm ở đâu trên website. */
const MUC_TRANG_CHU = [
  { id: "hero", nhan: "Hero", khoa: "hero", neo: "/#home", ghiChu: "Màn hình đầu tiên khách nhìn thấy" },
  { id: "about", nhan: "Giới thiệu", khoa: "about", neo: "/#about", ghiChu: "Khối About" },
  { id: "lien-he", nhan: "Liên hệ", khoa: "company", neo: "/#contact", ghiChu: "Website và chatbot dùng chung" },
];

const MUC_KHAC = [
  { id: "tin-nhan", nhan: "Tin nhắn", khoa: null },
  { id: "phap-ly", nhan: "Trang pháp lý", khoa: "legalPages", neo: "/privacy-policy" },
];

const TAT_CA_MUC = [...MUC_TRANG_CHU, ...MUC_KHAC];

/* ================= Mảnh dùng chung ================= */
function Bang({ loai, children }) {
  if (!children) return null;
  const kieu =
    loai === "loi"
      ? "border-red-500/30 bg-red-500/10 text-red-200"
      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
  const Icon = loai === "loi" ? AlertTriangle : CheckCircle2;
  return (
    <div
      role={loai === "loi" ? "alert" : "status"}
      className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm ${kieu}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

function TieuDeMuc({ children, ghiChu, neo }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-3 border-b border-white/[0.07] pb-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white">{children}</h2>
        {ghiChu && <p className="mt-1 text-sm text-gray-500">{ghiChu}</p>}
      </div>
      {neo && (
        <Link
          to={neo}
          target="_blank"
          className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.12em] text-gray-500 transition-colors hover:text-neon"
        >
          Xem trên web
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

/** Khung một mục: card tối, viền mảnh, không glow. */
function Khung({ children }) {
  return (
    <section className="rounded-xl border border-white/[0.07] bg-surface/60 p-6 sm:p-8">
      {children}
    </section>
  );
}

const LUOI = "grid gap-x-6 gap-y-5 sm:grid-cols-2";

/* ================= Đăng nhập ================= */
function ManHinhDangNhap({ khiXong }) {
  const [ten, setTen] = useState("");
  const [matKhau, setMatKhau] = useState("");
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
    <div className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-[22rem]">
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-gray-600">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Khu vực quản trị
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">
            Nội dung website iMob
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Đăng nhập để sửa nội dung hiển thị trên trang.
          </p>
        </div>

        <form onSubmit={guiDi} className="space-y-4">
          <O
            nhan="Tên đăng nhập"
            giaTri={ten}
            doi={setTen}
            autoComplete="username"
            autoFocus
            required
          />
          <O
            nhan="Mật khẩu"
            type="password"
            giaTri={matKhau}
            doi={setMatKhau}
            autoComplete="current-password"
            required
          />

          <Bang loai="loi">{loi}</Bang>

          <button
            type="submit"
            disabled={dangGui}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-neon px-5 py-2.5 text-sm font-semibold text-night transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
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
        </form>

        <Link
          to="/"
          className="mt-10 inline-flex items-center gap-1.5 text-sm text-gray-600 transition-colors hover:text-neon"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}

/* ================= Các mục nội dung ================= */
function MucHero({ d, doi, daSua }) {
  const s = (k) => (v) => doi({ ...d, [k]: v });
  return (
    <Khung>
      <TieuDeMuc ghiChu="Màn hình đầu tiên khách nhìn thấy" neo="/#home">
        Hero
      </TieuDeMuc>
      <div className="space-y-5">
        <O nhan="Nhãn nhỏ phía trên" giaTri={d.badge} doi={s("badge")} daSua={daSua} />

        <div className={LUOI}>
          <O nhan="Dòng tiêu đề trên" giaTri={d.tieuDeTruoc} doi={s("tieuDeTruoc")} daSua={daSua} />
          <O nhan="Dòng tiêu đề dưới" giaTri={d.tieuDeSau} doi={s("tieuDeSau")} daSua={daSua} />
        </div>

        <OTuKhoa
          nhan="Từ khoá đổi liên tục (dòng giữa)"
          danhSach={d.tuKhoaDong}
          doi={s("tuKhoaDong")}
          daSua={daSua}
        />

        <ODai nhan="Mô tả" giaTri={d.moTa} doi={s("moTa")} daSua={daSua} />

        <div className={LUOI}>
          <O nhan="Chữ trên nút chính" giaTri={d.nutChinh} doi={s("nutChinh")} daSua={daSua} />
          <O nhan="Chữ trên nút phụ" giaTri={d.nutPhu} doi={s("nutPhu")} daSua={daSua} />
        </div>

        <p className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-xs leading-relaxed text-gray-500">
          Số điện thoại và email của khối này lấy từ mục{" "}
          <span className="text-gray-300">Liên hệ</span> — cố ý không cho nhập lại ở
          đây, vì cùng một thông tin để ở hai chỗ thì sớm muộn cũng lệch nhau.
        </p>
      </div>
    </Khung>
  );
}

function MucAbout({ d, doi, daSua }) {
  const s = (k) => (v) => doi({ ...d, [k]: v });
  return (
    <Khung>
      <TieuDeMuc ghiChu="Khối giới thiệu ở trang chủ" neo="/#about">
        Giới thiệu
      </TieuDeMuc>
      <div className="space-y-5">
        <div className={LUOI}>
          <O nhan="Nhãn nhỏ" giaTri={d.phuDe} doi={s("phuDe")} daSua={daSua} />
          <O nhan="Tiêu đề" giaTri={d.tieuDe} doi={s("tieuDe")} daSua={daSua} />
        </div>
        <ODai
          nhan="Mô tả"
          giaTri={d.moTa}
          doi={s("moTa")}
          daSua={daSua}
          moTa="Nối tiếp sau mô tả công ty, nên viết như phần sau của một câu."
        />
        <ODai
          nhan="Câu nói nổi bật"
          giaTri={d.philosophy}
          doi={s("philosophy")}
          daSua={daSua}
          dongToiThieu={4}
        />
        <p className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-xs leading-relaxed text-gray-500">
          Ba con số thống kê và ba thẻ thế mạnh bên dưới khối này chưa sửa được ở
          đây — còn nằm trong <span className="font-mono text-gray-400">src/data/about.json</span>.
        </p>
      </div>
    </Khung>
  );
}

const TRUONG_CONG_TY = [
  { khoa: "name", nhan: "Tên ngắn", moTa: "Hiện ở Navbar và Footer" },
  { khoa: "tagline", nhan: "Khẩu hiệu" },
  { khoa: "fullName", nhan: "Tên đầy đủ", rong: true },
  { khoa: "description", nhan: "Mô tả ngắn", dai: true },
  { khoa: "phone", nhan: "Điện thoại", moTa: "Chatbot cũng đọc số này" },
  { khoa: "email", nhan: "Email" },
  { khoa: "address", nhan: "Địa chỉ", dai: true },
  { khoa: "workingHours", nhan: "Giờ làm việc" },
  { khoa: "responseTime", nhan: "Thời gian phản hồi", moTa: 'Ví dụ: "trong vòng 24 giờ"' },
];

function MucLienHe({ d, doi, daSua }) {
  return (
    <Khung>
      <TieuDeMuc
        ghiChu="Website và chatbot dùng chung — sửa một lần, cả hai cùng đổi"
        neo="/#contact"
      >
        Liên hệ
      </TieuDeMuc>
      <div className={LUOI}>
        {TRUONG_CONG_TY.map(({ khoa, nhan, moTa, dai, rong }) => {
          const O_ = dai ? ODai : O;
          return (
            <div key={khoa} className={dai || rong ? "sm:col-span-2" : ""}>
              <O_
                nhan={nhan}
                moTa={moTa}
                dongToiThieu={2}
                daSua={daSua}
                giaTri={d?.[khoa]}
                doi={(v) => doi({ ...d, [khoa]: v })}
              />
            </div>
          );
        })}
      </div>
    </Khung>
  );
}

function MucPhapLy({ d, doi, daSua }) {
  const cacSlug = Object.keys(d ?? {});
  const [slug, setSlug] = useState(cacSlug[0] ?? "");
  const trang = d?.[slug];

  if (!trang) {
    return (
      <Khung>
        <p className="text-sm text-gray-500">Chưa có dữ liệu trang pháp lý.</p>
      </Khung>
    );
  }

  const doiTrang = (phanMoi) => doi({ ...d, [slug]: { ...trang, ...phanMoi } });
  const doiMuc = (i, phanMoi) =>
    doiTrang({ sections: trang.sections.map((s, j) => (j === i ? { ...s, ...phanMoi } : s)) });

  return (
    <Khung>
      <TieuDeMuc ghiChu="Chính sách bảo mật và Điều khoản dịch vụ" neo={`/${slug}`}>
        Trang pháp lý
      </TieuDeMuc>

      <div className="mb-7 flex flex-wrap gap-1.5">
        {cacSlug.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSlug(s)}
            className={
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors " +
              (s === slug
                ? "bg-white/[0.08] text-white"
                : "text-gray-500 hover:bg-white/[0.04] hover:text-gray-300")
            }
          >
            {d[s].title ?? s}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        <div className={LUOI}>
          <O nhan="Tiêu đề" giaTri={trang.title} doi={(v) => doiTrang({ title: v })} daSua={daSua} />
          <O nhan="Tiêu đề phụ" giaTri={trang.subtitle} doi={(v) => doiTrang({ subtitle: v })} daSua={daSua} />
          <O nhan="Nhãn nhỏ" giaTri={trang.eyebrow} doi={(v) => doiTrang({ eyebrow: v })} daSua={daSua} />
          <O nhan="Ngày hiệu lực" giaTri={trang.effective} doi={(v) => doiTrang({ effective: v })} daSua={daSua} />
        </div>
        <ODai nhan="Mở đầu" giaTri={trang.intro} doi={(v) => doiTrang({ intro: v })} daSua={daSua} />
      </div>

      <div className="mt-8 space-y-4 border-t border-white/[0.07] pt-7">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-gray-500">
          {trang.sections?.length ?? 0} mục nội dung
        </h3>

        {(trang.sections ?? []).map((muc, i) => (
          <div key={i} className="rounded-lg border border-white/[0.07] bg-black/20 p-5">
            <div className="mb-4 flex items-baseline gap-3">
              <span className="font-mono text-xs text-gray-600">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <O
                  nhan="Tiêu đề mục"
                  giaTri={muc.heading}
                  doi={(v) => doiMuc(i, { heading: v })}
                  daSua={daSua}
                />
              </div>
            </div>

            {/* Chỉ hiện ô cho những phần mục này THẬT SỰ có — mỗi mục dùng một
                kiểu khác nhau, hiện hết mọi ô sẽ rối và đẻ ra trường rỗng. */}
            <div className="space-y-4">
              {muc.intro !== undefined && (
                <ODai nhan="Dẫn nhập" dongToiThieu={2} giaTri={muc.intro} doi={(v) => doiMuc(i, { intro: v })} daSua={daSua} />
              )}
              {muc.items !== undefined && (
                <ODanhSach nhan="Gạch đầu dòng" danhSach={muc.items} doi={(v) => doiMuc(i, { items: v })} daSua={daSua} />
              )}
              {muc.paragraphs !== undefined && (
                <ODanhSach nhan="Đoạn văn" dongToiThieu={5} danhSach={muc.paragraphs} doi={(v) => doiMuc(i, { paragraphs: v })} daSua={daSua} moTa="Mỗi dòng là một đoạn." />
              )}
              {muc.note !== undefined && (
                <ODai nhan="Ghi chú" dongToiThieu={2} giaTri={muc.note} doi={(v) => doiMuc(i, { note: v })} daSua={daSua} />
              )}
            </div>
          </div>
        ))}
      </div>
    </Khung>
  );
}

/* ================= Tin nhắn ================= */
function MucTinNhan() {
  const [ds, setDs] = useState(null);
  const [loi, setLoi] = useState("");
  const [dangTai, setDangTai] = useState(false);

  const tai = useCallback(async () => {
    setDangTai(true);
    setLoi("");
    try {
      setDs(await api.danhSachLienHe());
    } catch (err) {
      setLoi(err.message);
    } finally {
      setDangTai(false);
    }
  }, []);

  useEffect(() => {
    tai();
  }, [tai]);

  const danhDau = async (ma, daXuLy) => {
    setDs((truoc) => truoc.map((r) => (r.id === ma ? { ...r, da_xu_ly: daXuLy } : r)));
    try {
      await api.danhDauLienHe(ma, daXuLy);
    } catch (err) {
      setLoi(err.message);
      tai(); // hỏng thì tải lại cho khớp thực tế trong database
    }
  };

  const chuaXuLy = (ds ?? []).filter((r) => !r.da_xu_ly).length;

  return (
    <Khung>
      <TieuDeMuc ghiChu="Khách để lại từ form liên hệ và từ chatbot">Tin nhắn</TieuDeMuc>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-gray-500">
          {ds === null ? "Đang tải…" : `${ds.length} tin · ${chuaXuLy} chưa xử lý`}
        </p>
        <button
          type="button"
          onClick={tai}
          disabled={dangTai}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-gray-500 transition-colors hover:bg-white/[0.04] hover:text-gray-200 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${dangTai ? "animate-spin" : ""}`} aria-hidden="true" />
          Tải lại
        </button>
      </div>

      <Bang loai="loi">{loi}</Bang>

      {ds !== null && ds.length === 0 && (
        <div className="rounded-lg border border-dashed border-white/10 px-6 py-14 text-center">
          <Inbox className="mx-auto h-7 w-7 text-gray-700" aria-hidden="true" />
          <p className="mt-3 text-sm text-gray-400">Chưa có ai để lại thông tin</p>
          <p className="mx-auto mt-1.5 max-w-sm text-xs leading-relaxed text-gray-600">
            Tin nhắn sẽ xuất hiện ở đây khi khách gửi form Liên hệ ở trang chủ,
            hoặc để lại số điện thoại cho chatbot.
          </p>
        </div>
      )}

      {ds !== null && ds.length > 0 && (
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.07] font-mono text-[10px] uppercase tracking-[0.12em] text-gray-600">
                <th className="px-2 py-2.5 font-medium">Thời điểm</th>
                <th className="px-2 py-2.5 font-medium">Nguồn</th>
                <th className="px-2 py-2.5 font-medium">Họ tên</th>
                <th className="px-2 py-2.5 font-medium">Liên lạc</th>
                <th className="px-2 py-2.5 font-medium">Nội dung</th>
                <th className="px-2 py-2.5 font-medium">Xong</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {ds.map((r) => (
                <tr key={r.id} className={r.da_xu_ly ? "text-gray-600" : "text-gray-300"}>
                  <td className="whitespace-nowrap px-2 py-3 font-mono text-xs text-gray-600">
                    {new Date(r.tao_luc).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-2 py-3">
                    <span
                      className={
                        "rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide " +
                        (r.nguon === "chatbot"
                          ? "bg-purple-500/15 text-purple-300"
                          : "bg-cyan-500/15 text-cyan-300")
                      }
                    >
                      {r.nguon}
                    </span>
                  </td>
                  <td className="px-2 py-3">{r.ho_ten || "—"}</td>
                  <td className="px-2 py-3 text-xs">
                    {r.so_dien_thoai && <div>{r.so_dien_thoai}</div>}
                    {r.email && <div className="break-all text-gray-500">{r.email}</div>}
                    {!r.so_dien_thoai && !r.email && "—"}
                  </td>
                  <td className="max-w-sm px-2 py-3 text-xs">
                    {r.dich_vu && <div className="mb-0.5 text-cyan-400">{r.dich_vu}</div>}
                    {r.loi_nhan || (r.dich_vu ? "" : "—")}
                  </td>
                  <td className="px-2 py-3">
                    <input
                      type="checkbox"
                      checked={r.da_xu_ly}
                      onChange={(e) => danhDau(r.id, e.target.checked)}
                      aria-label={`Đánh dấu đã xử lý tin của ${r.ho_ten || r.id}`}
                      className="h-4 w-4 cursor-pointer accent-neon"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Khung>
  );
}

/* ================= Trang chính ================= */
export default function AdminPage() {
  useDocumentTitle("Quản trị nội dung — iMob");

  const [ten, setTen] = useState(api.layTenDangNhap());
  const [muc, setMuc] = useState("hero");

  const [goc, setGoc] = useState(null); // bản đã lưu trên máy chủ
  const [noiDung, setNoiDung] = useState(null); // bản đang sửa
  const [dangTai, setDangTai] = useState(false);
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState("");
  const [xong, setXong] = useState("");

  // Chặn Google lập chỉ mục. robots.txt đã chặn, thẻ này là lớp thứ hai
  // (site tĩnh nên không đặt được thẻ riêng cho từng đường dẫn lúc dựng HTML).
  useEffect(() => {
    const the = document.createElement("meta");
    the.name = "robots";
    the.content = "noindex, nofollow";
    document.head.appendChild(the);
    return () => the.remove();
  }, []);

  const taiNoiDung = useCallback(async () => {
    setDangTai(true);
    setLoi("");
    try {
      const d = await api.docNoiDung();
      setGoc(d);
      setNoiDung(d);
    } catch (err) {
      setLoi(err.message);
    } finally {
      setDangTai(false);
    }
  }, []);

  useEffect(() => {
    if (ten) taiNoiDung();
  }, [ten, taiNoiDung]);

  // Khoá nào đang khác bản đã lưu.
  const khoaDaSua = useMemo(() => {
    if (!goc || !noiDung) return [];
    return Object.keys(noiDung).filter(
      (k) => JSON.stringify(noiDung[k]) !== JSON.stringify(goc[k])
    );
  }, [goc, noiDung]);

  // Đang sửa dở mà đóng tab / bấm back thì trình duyệt hỏi lại.
  useEffect(() => {
    if (khoaDaSua.length === 0) return;
    const canh = (e) => e.preventDefault();
    window.addEventListener("beforeunload", canh);
    return () => window.removeEventListener("beforeunload", canh);
  }, [khoaDaSua.length]);

  if (!ten) return <ManHinhDangNhap khiXong={setTen} />;

  /* --------- Lưu --------- */
  const donDep = (khoa, duLieu) => {
    // Người soạn hay để lại dòng Enter thừa ở cuối các danh sách.
    if (khoa !== "legalPages") return duLieu;
    return Object.fromEntries(
      Object.entries(duLieu).map(([slug, trang]) => [
        slug,
        {
          ...trang,
          sections: (trang.sections ?? []).map((m) => ({
            ...m,
            ...(m.items ? { items: locDongTrong(m.items) } : {}),
            ...(m.paragraphs ? { paragraphs: locDongTrong(m.paragraphs) } : {}),
          })),
        },
      ])
    );
  };

  const luuTatCa = async () => {
    setDangLuu(true);
    setLoi("");
    setXong("");
    try {
      const daLuu = { ...noiDung };
      for (const khoa of khoaDaSua) {
        const sach = donDep(khoa, noiDung[khoa]);
        await api.ghiNoiDung(khoa, sach);
        daLuu[khoa] = sach;
      }
      setNoiDung(daLuu);
      setGoc(daLuu);
      setXong(
        `Đã lưu ${khoaDaSua.length} mục. Tải lại trang chủ (F5) để xem thay đổi.`
      );
      setTimeout(() => setXong(""), 6000);
    } catch (err) {
      setLoi(err.message);
      if (err.ma === 401) setTen(null);
    } finally {
      setDangLuu(false);
    }
  };

  const boThayDoi = () => setNoiDung(goc);

  const xuatJson = () => {
    const blob = new Blob([JSON.stringify(noiDung, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `imob-noi-dung-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const thoat = () => {
    if (khoaDaSua.length && !window.confirm("Còn thay đổi chưa lưu. Thoát luôn?")) return;
    api.dangXuat();
    setTen(null);
  };

  const dat = (khoa) => (v) => setNoiDung((t) => ({ ...t, [khoa]: v }));
  const suaKhoa = (khoa) => khoaDaSua.includes(khoa);

  /* --------- Rail trái --------- */
  const NutMuc = ({ m, so }) => {
    const dangChon = muc === m.id;
    return (
      <button
        type="button"
        onClick={() => setMuc(m.id)}
        aria-current={dangChon ? "page" : undefined}
        className={
          "flex w-full items-center gap-3 rounded-lg border-l-2 px-3 py-2 text-left text-sm transition-colors " +
          (dangChon
            ? "border-neon bg-white/[0.06] text-white"
            : "border-transparent text-gray-500 hover:bg-white/[0.03] hover:text-gray-300")
        }
      >
        {so && <span className="font-mono text-[11px] text-gray-600">{so}</span>}
        <span className="flex-1 font-medium">{m.nhan}</span>
        {m.khoa && suaKhoa(m.khoa) && (
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" title="Chưa lưu" />
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen pb-28">
      {/* ---------- Thanh trên ---------- */}
      <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-night/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
          <div className="flex items-baseline gap-3">
            <span className="text-sm font-bold tracking-tight text-white">iMob</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-gray-600">
              Quản trị nội dung
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="mr-2 hidden text-xs text-gray-600 sm:inline">{ten}</span>
            <button
              type="button"
              onClick={xuatJson}
              disabled={!noiDung}
              title="Tải nội dung về máy để sao lưu"
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-gray-500 transition-colors hover:bg-white/[0.04] hover:text-gray-200 disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Xuất JSON</span>
            </button>
            <button
              type="button"
              onClick={thoat}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-gray-500 transition-colors hover:bg-white/[0.04] hover:text-red-300"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Thoát</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl gap-8 px-5 py-8 lg:grid lg:grid-cols-[13rem_1fr]">
        {/* ---------- Rail trái ---------- */}
        <nav aria-label="Mục nội dung" className="mb-8 lg:mb-0">
          <div className="lg:sticky lg:top-24">
            <p className="mb-2 px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-gray-700">
              Trang chủ
            </p>
            <div className="space-y-0.5">
              {MUC_TRANG_CHU.map((m, i) => (
                <NutMuc key={m.id} m={m} so={String(i + 1).padStart(2, "0")} />
              ))}
            </div>

            <p className="mb-2 mt-6 px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-gray-700">
              Khác
            </p>
            <div className="space-y-0.5">
              {MUC_KHAC.map((m) => (
                <NutMuc key={m.id} m={m} />
              ))}
            </div>
          </div>
        </nav>

        {/* ---------- Nội dung ---------- */}
        <main className="min-w-0 space-y-5">
          <Bang loai="loi">{loi}</Bang>
          <Bang loai="xong">{xong}</Bang>

          {muc === "tin-nhan" ? (
            <MucTinNhan />
          ) : dangTai ? (
            <p className="flex items-center gap-2 py-10 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Đang tải nội dung…
            </p>
          ) : !noiDung?.[TAT_CA_MUC.find((m) => m.id === muc)?.khoa] ? (
            <Khung>
              <p className="text-sm leading-relaxed text-amber-200">
                Máy chủ chưa có dữ liệu cho mục này. Kiểm tra database đã kết nối
                chưa — mở <span className="font-mono">/health</span> của API, trường{" "}
                <span className="font-mono">database</span> phải là{" "}
                <span className="font-mono">ok</span>.
              </p>
            </Khung>
          ) : (
            <>
              {muc === "hero" && (
                <MucHero d={noiDung.hero} doi={dat("hero")} daSua={suaKhoa("hero")} />
              )}
              {muc === "about" && (
                <MucAbout d={noiDung.about} doi={dat("about")} daSua={suaKhoa("about")} />
              )}
              {muc === "lien-he" && (
                <MucLienHe d={noiDung.company} doi={dat("company")} daSua={suaKhoa("company")} />
              )}
              {muc === "phap-ly" && (
                <MucPhapLy
                  d={noiDung.legalPages}
                  doi={dat("legalPages")}
                  daSua={suaKhoa("legalPages")}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* ---------- Thanh lưu: CHỈ hiện khi có thay đổi ---------- */}
      {khoaDaSua.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-night/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3.5">
            <p className="flex items-center gap-2 text-sm text-gray-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" aria-hidden="true" />
              Chưa lưu:{" "}
              <span className="text-gray-200">
                {khoaDaSua
                  .map((k) => TAT_CA_MUC.find((m) => m.khoa === k)?.nhan ?? k)
                  .join(", ")}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={boThayDoi}
                disabled={dangLuu}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs text-gray-500 transition-colors hover:bg-white/[0.04] hover:text-gray-200 disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Bỏ thay đổi
              </button>
              <button
                type="button"
                onClick={luuTatCa}
                disabled={dangLuu}
                className="inline-flex items-center gap-2 rounded-lg bg-neon px-4 py-2 text-sm font-semibold text-night transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {dangLuu ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Đang lưu…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" aria-hidden="true" />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
