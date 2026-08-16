import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  Download,
  Loader2,
  LogOut,
  RefreshCw,
  Save,
} from "lucide-react";
import Container from "../components/ui/Container.jsx";
import Button from "../components/ui/Button.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import { O, ODai, ODanhSach, locDongTrong } from "../components/admin/Fields.jsx";
import * as api from "../services/adminService.js";

// ============================================================
// AdminPage — trang quản trị nội dung (/admin).
//
// Không nằm trong menu, và public/robots.txt chặn Google lập chỉ mục.
// Lưu ý: "giấu đường dẫn" KHÔNG phải là bảo mật — thứ thật sự bảo vệ là đăng
// nhập + vé JWT ở phía máy chủ (chatbot-python/auth.py).
//
// Sửa xong bấm Lưu là ghi thẳng vào database. Website lấy nội dung mới ở lần
// tải trang kế tiếp — không cần build lại, không cần push GitHub.
// ============================================================

const TABS = [
  { id: "cong-ty", nhan: "Thông tin công ty" },
  { id: "phap-ly", nhan: "Trang pháp lý" },
  { id: "lien-he", nhan: "Liên hệ" },
];

// Các trường của company.json sẽ hiện thành ô nhập, theo đúng thứ tự này.
// `_note` cố ý không có mặt: đó là ghi chú cho lập trình viên, không phải
// nội dung hiển thị, và giữ nguyên khi lưu (xem ganNoiDungCongTy).
const TRUONG_CONG_TY = [
  { khoa: "name", nhan: "Tên ngắn", moTa: "Hiện ở Navbar, Footer" },
  { khoa: "tagline", nhan: "Khẩu hiệu" },
  { khoa: "fullName", nhan: "Tên đầy đủ" },
  { khoa: "description", nhan: "Mô tả ngắn", dai: true },
  { khoa: "phone", nhan: "Điện thoại", moTa: "Chatbot cũng dùng số này" },
  { khoa: "email", nhan: "Email" },
  { khoa: "address", nhan: "Địa chỉ", dai: true },
  { khoa: "workingHours", nhan: "Giờ làm việc" },
  { khoa: "responseTime", nhan: "Thời gian phản hồi" },
];

/* ================= Thông báo ================= */
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
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${kieu}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

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
    <div className="mx-auto max-w-sm">
      <h1 className="mb-1 text-2xl font-black text-white">Quản trị nội dung</h1>
      <p className="mb-8 text-sm text-gray-500">
        Đăng nhập để sửa nội dung website.
      </p>

      <form onSubmit={guiDi} className="space-y-4">
        <O
          nhan="Tên đăng nhập"
          giaTri={ten}
          doi={setTen}
          autoComplete="username"
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

        <Button type="submit" disabled={dangGui} className="w-full">
          {dangGui ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Đang đăng nhập…
            </>
          ) : (
            "Đăng nhập"
          )}
        </Button>

        {dangGui && (
          <p className="text-center text-xs text-gray-600">
            Lần đầu trong ngày có thể chờ 30–50 giây để máy chủ thức dậy.
          </p>
        )}
      </form>

      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-cyan-300"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Về trang chủ
      </Link>
    </div>
  );
}

/* ================= Tab: thông tin công ty ================= */
function TabCongTy({ duLieu, doi }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {TRUONG_CONG_TY.map(({ khoa, nhan, moTa, dai }) => {
        const O_ = dai ? ODai : O;
        return (
          <div key={khoa} className={dai ? "sm:col-span-2" : ""}>
            <O_
              nhan={nhan}
              moTa={moTa}
              dong={2}
              giaTri={duLieu?.[khoa]}
              doi={(v) => doi({ ...duLieu, [khoa]: v })}
            />
          </div>
        );
      })}
    </div>
  );
}

/* ================= Tab: trang pháp lý ================= */
function TabPhapLy({ duLieu, doi }) {
  const cacSlug = Object.keys(duLieu ?? {});
  const [slug, setSlug] = useState(cacSlug[0] ?? "");
  const trang = duLieu?.[slug];

  if (!trang) {
    return <p className="text-sm text-gray-500">Chưa có dữ liệu trang pháp lý.</p>;
  }

  // Sửa một trường của trang đang chọn, giữ nguyên các trang khác.
  const doiTrang = (phanMoi) =>
    doi({ ...duLieu, [slug]: { ...trang, ...phanMoi } });

  const doiMuc = (i, phanMoi) => {
    const sections = trang.sections.map((s, j) =>
      j === i ? { ...s, ...phanMoi } : s
    );
    doiTrang({ sections });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {cacSlug.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSlug(s)}
            className={
              "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors " +
              (s === slug
                ? "bg-purple-500/20 text-cyan-300 ring-1 ring-purple-400/40"
                : "text-gray-400 hover:bg-white/5 hover:text-white")
            }
          >
            {duLieu[s].title ?? s}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <O nhan="Tiêu đề" giaTri={trang.title} doi={(v) => doiTrang({ title: v })} />
        <O
          nhan="Tiêu đề phụ"
          giaTri={trang.subtitle}
          doi={(v) => doiTrang({ subtitle: v })}
        />
        <O
          nhan="Nhãn nhỏ"
          giaTri={trang.eyebrow}
          doi={(v) => doiTrang({ eyebrow: v })}
        />
        <O
          nhan="Ngày hiệu lực"
          giaTri={trang.effective}
          doi={(v) => doiTrang({ effective: v })}
        />
        <div className="sm:col-span-2">
          <ODai
            nhan="Mở đầu"
            dong={3}
            giaTri={trang.intro}
            doi={(v) => doiTrang({ intro: v })}
          />
        </div>
      </div>

      <div className="space-y-5 border-t border-white/10 pt-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
          Các mục ({trang.sections?.length ?? 0})
        </h3>

        {(trang.sections ?? []).map((muc, i) => (
          <div
            key={i}
            className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5"
          >
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-sm text-purple-400">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <O
                  nhan="Tiêu đề mục"
                  giaTri={muc.heading}
                  doi={(v) => doiMuc(i, { heading: v })}
                />
              </div>
            </div>

            {/* Chỉ hiện ô cho những phần mục này THẬT SỰ có. Mỗi mục dùng một
                kiểu khác nhau (có mục dùng items, có mục dùng paragraphs) —
                hiện hết mọi ô sẽ rối và dễ tạo ra trường rỗng vô nghĩa. */}
            {muc.intro !== undefined && (
              <ODai
                nhan="Dẫn nhập"
                dong={2}
                giaTri={muc.intro}
                doi={(v) => doiMuc(i, { intro: v })}
              />
            )}
            {muc.items !== undefined && (
              <ODanhSach
                nhan="Gạch đầu dòng"
                danhSach={muc.items}
                doi={(v) => doiMuc(i, { items: v })}
              />
            )}
            {muc.paragraphs !== undefined && (
              <ODanhSach
                nhan="Đoạn văn"
                dong={5}
                danhSach={muc.paragraphs}
                doi={(v) => doiMuc(i, { paragraphs: v })}
                moTa="Mỗi dòng là một đoạn."
              />
            )}
            {muc.note !== undefined && (
              <ODai
                nhan="Ghi chú"
                dong={2}
                giaTri={muc.note}
                doi={(v) => doiMuc(i, { note: v })}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= Tab: liên hệ ================= */
function TabLienHe() {
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
    // Cập nhật ngay trên màn hình cho mượt, hỏng thì tải lại để về đúng thực tế.
    setDs((truoc) =>
      truoc.map((r) => (r.id === ma ? { ...r, da_xu_ly: daXuLy } : r))
    );
    try {
      await api.danhDauLienHe(ma, daXuLy);
    } catch (err) {
      setLoi(err.message);
      tai();
    }
  };

  if (dangTai && ds === null) {
    return (
      <p className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Đang tải…
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {ds?.length ?? 0} liên hệ gần nhất
        </p>
        <Button variant="ghost" size="sm" onClick={tai} disabled={dangTai}>
          <RefreshCw
            className={`h-3.5 w-3.5 ${dangTai ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          Tải lại
        </Button>
      </div>

      <Bang loai="loi">{loi}</Bang>

      {ds?.length === 0 && (
        <p className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-gray-500">
          Chưa có ai để lại thông tin.
        </p>
      )}

      {/* Bảng rộng hơn màn hình điện thoại -> cho cuộn ngang trong khung riêng,
          không để cả trang bị cuộn ngang. */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-gray-500">
            <tr className="border-b border-white/10">
              <th className="py-2.5 pr-4 font-semibold">Thời điểm</th>
              <th className="py-2.5 pr-4 font-semibold">Nguồn</th>
              <th className="py-2.5 pr-4 font-semibold">Họ tên</th>
              <th className="py-2.5 pr-4 font-semibold">Liên lạc</th>
              <th className="py-2.5 pr-4 font-semibold">Nội dung</th>
              <th className="py-2.5 font-semibold">Xong</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(ds ?? []).map((r) => (
              <tr
                key={r.id}
                className={r.da_xu_ly ? "text-gray-600" : "text-gray-300"}
              >
                <td className="whitespace-nowrap py-3 pr-4 text-xs text-gray-500">
                  {new Date(r.tao_luc).toLocaleString("vi-VN")}
                </td>
                <td className="py-3 pr-4">
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase " +
                      (r.nguon === "chatbot"
                        ? "bg-purple-500/15 text-purple-300"
                        : "bg-cyan-500/15 text-cyan-300")
                    }
                  >
                    {r.nguon}
                  </span>
                </td>
                <td className="py-3 pr-4">{r.ho_ten || "—"}</td>
                <td className="py-3 pr-4">
                  <div className="space-y-0.5 text-xs">
                    {r.so_dien_thoai && <p>{r.so_dien_thoai}</p>}
                    {r.email && <p className="break-all">{r.email}</p>}
                    {!r.so_dien_thoai && !r.email && "—"}
                  </div>
                </td>
                <td className="max-w-xs py-3 pr-4 text-xs">
                  {r.dich_vu && (
                    <p className="mb-0.5 text-cyan-400">{r.dich_vu}</p>
                  )}
                  {r.loi_nhan || (r.dich_vu ? "" : "—")}
                </td>
                <td className="py-3">
                  <input
                    type="checkbox"
                    checked={r.da_xu_ly}
                    onChange={(e) => danhDau(r.id, e.target.checked)}
                    aria-label={`Đánh dấu đã xử lý liên hệ của ${r.ho_ten || r.id}`}
                    className="h-4 w-4 cursor-pointer accent-purple-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= Trang chính ================= */
export default function AdminPage() {
  useDocumentTitle("Quản trị nội dung — iMob");

  const [ten, setTen] = useState(api.layTenDangNhap());
  const [tab, setTab] = useState("cong-ty");

  const [noiDung, setNoiDung] = useState(null); // { company, legalPages }
  const [dangTai, setDangTai] = useState(false);
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState("");
  const [xong, setXong] = useState("");

  // Chặn Google lập chỉ mục trang này. robots.txt đã chặn, thẻ meta là lớp thứ
  // hai cho chắc (site tĩnh nên không đặt được thẻ này lúc dựng HTML).
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
      setNoiDung(await api.docNoiDung());
    } catch (err) {
      setLoi(err.message);
    } finally {
      setDangTai(false);
    }
  }, []);

  useEffect(() => {
    if (ten) taiNoiDung();
  }, [ten, taiNoiDung]);

  if (!ten) {
    return (
      <section className="min-h-screen py-24">
        <Container>
          <ManHinhDangNhap khiXong={setTen} />
        </Container>
      </section>
    );
  }

  const luu = async (khoa) => {
    setDangLuu(true);
    setLoi("");
    setXong("");
    try {
      let duLieu = noiDung[khoa];

      // Dọn dòng trống trong các danh sách của trang pháp lý ngay trước khi
      // gửi — người soạn hay để lại dòng Enter thừa ở cuối.
      if (khoa === "legalPages") {
        duLieu = Object.fromEntries(
          Object.entries(duLieu).map(([slug, trang]) => [
            slug,
            {
              ...trang,
              sections: (trang.sections ?? []).map((m) => ({
                ...m,
                ...(m.items ? { items: locDongTrong(m.items) } : {}),
                ...(m.paragraphs
                  ? { paragraphs: locDongTrong(m.paragraphs) }
                  : {}),
              })),
            },
          ])
        );
        setNoiDung((truoc) => ({ ...truoc, legalPages: duLieu }));
      }

      await api.ghiNoiDung(khoa, duLieu);
      setXong("Đã lưu. Tải lại trang chủ để xem thay đổi.");
      setTimeout(() => setXong(""), 6000);
    } catch (err) {
      setLoi(err.message);
      if (err.ma === 401) setTen(null);
    } finally {
      setDangLuu(false);
    }
  };

  // Tải toàn bộ nội dung về máy làm bản sao lưu. Quan trọng vì gói database
  // miễn phí có thời hạn — mất database mà có file này thì chép lại được ngay.
  const xuatJson = () => {
    const blob = new Blob([JSON.stringify(noiDung, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `imob-noi-dung-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const thoat = () => {
    api.dangXuat();
    setTen(null);
  };

  const khoaDangSua = tab === "cong-ty" ? "company" : "legalPages";

  return (
    <section className="min-h-screen py-16">
      <Container className="max-w-5xl space-y-8">
        {/* ---------- Đầu trang ---------- */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-2xl font-black text-white">Quản trị nội dung</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Đang đăng nhập: <span className="text-cyan-300">{ten}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={xuatJson} disabled={!noiDung}>
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Xuất JSON
            </Button>
            <Button variant="ghost" size="sm" onClick={thoat}>
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Thoát
            </Button>
          </div>
        </header>

        {/* ---------- Tab ---------- */}
        <nav className="flex flex-wrap gap-1 border-b border-white/10">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={
                "-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors " +
                (tab === t.id
                  ? "border-purple-500 text-white"
                  : "border-transparent text-gray-500 hover:text-gray-300")
              }
            >
              {t.nhan}
            </button>
          ))}
        </nav>

        <Bang loai="loi">{loi}</Bang>
        <Bang loai="xong">{xong}</Bang>

        {/* ---------- Nội dung tab ---------- */}
        {tab === "lien-he" ? (
          <TabLienHe />
        ) : dangTai ? (
          <p className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Đang tải nội dung…
          </p>
        ) : !noiDung?.[khoaDangSua] ? (
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Máy chủ chưa có dữ liệu cho phần này. Kiểm tra xem database đã kết
            nối chưa (mở <code>/health</code> của API).
          </p>
        ) : (
          <>
            {tab === "cong-ty" && (
              <TabCongTy
                duLieu={noiDung.company}
                doi={(v) => setNoiDung((t) => ({ ...t, company: v }))}
              />
            )}
            {tab === "phap-ly" && (
              <TabPhapLy
                duLieu={noiDung.legalPages}
                doi={(v) => setNoiDung((t) => ({ ...t, legalPages: v }))}
              />
            )}

            <div className="flex items-center gap-3 border-t border-white/10 pt-6">
              <Button onClick={() => luu(khoaDangSua)} disabled={dangLuu}>
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
              </Button>
              <Button variant="ghost" size="sm" onClick={taiNoiDung} disabled={dangTai}>
                Huỷ, tải lại bản đã lưu
              </Button>
            </div>
          </>
        )}
      </Container>
    </section>
  );
}
