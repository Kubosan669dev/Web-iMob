import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  BookOpenCheck,
  ChevronDown,
  ChevronRight,
  Cloud,
  ExternalLink,
  Map as MapIcon,
  Radio,
  Rotate3d,
  Sunset,
} from "lucide-react";
import Container from "../components/ui/Container.jsx";
import KhungChatCaTrang from "../sections/hoi-dap/KhungChatCaTrang.jsx";
import CanDangNhap from "../sections/hoi-dap/CanDangNhap.jsx";
import useTaiKhoan from "../hooks/useTaiKhoan.js";
import { guiCauHoi } from "../components/chatbot/botNenTang.js";
import { VAI_TRO, ghepVung } from "../utils/hoiDap.js";
import { layThoiTiet } from "../services/thoiTietService.js";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import diaPhuong from "../data/diaPhuong.json";

// ============================================================
// Trang chat cả màn hình /hoi-dap/:khoa — GIAI ĐOẠN 2 (16/11/2026), theo ảnh
// mẫu thứ 4 công ty chốt.
//
//   • Giữa: khung chat của nền tảng đặt vào trang (KhungChatCaTrang.jsx).
//   • Phải: "Thực địa hôm nay" (thời tiết THẬT từ Open-Meteo), gợi ý câu hỏi
//     theo vai trò, ghi chú nguồn trích dẫn, bản đồ OpenStreetMap.
//   • ?hoi=… trên địa chỉ: câu hỏi mang từ trang chủ, gửi ngay khi mở trang.
//
// So với ảnh mẫu ĐÃ BỎ (không có nguồn dữ liệu thật):
//   • "Mật độ khách: Bình thường", "Giờ vận hành cáp treo 06:00–18:00",
//     "Vé thắng cảnh 40.000đ/người": cần nguồn chính thức + người cập nhật; đưa
//     số cũ lên là bot và trang nói hai giá khác nhau. Thay bằng thời tiết, giờ
//     mặt trời lặn — đo thật, tự cập nhật.
//   • "iMob Local Engine 4.2", "thời gian phản hồi 0.62s", "Yên Tử Verified",
//     "100% dữ liệu đối soát", "Nghe đọc AI (giọng Hạ Long)": không có thật.
//   • Lộ trình đánh số, ảnh gợi ý trong câu trả lời: là việc của khung chat tự
//     vẽ — làm khi có API của nền tảng.
// ============================================================

const DS = diaPhuong.danhSach;
const laNgoai = (url) => /^https?:\/\//.test(url ?? "");

function The({ tieuDe, phai, children, className = "" }) {
  return (
    <section className={"rounded-2xl border border-line bg-panel p-5 " + className}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-ink">{tieuDe}</h2>
        {phai}
      </div>
      {children}
    </section>
  );
}

function ThucDia({ d, tt }) {
  const dong = tt
    ? [
        ["Nhiệt độ hiện tại", `${tt.nhietDo}°C`],
        ["Bầu trời", tt.moTa || "—"],
        ["Cao nhất / thấp nhất", `${tt.cao}° / ${tt.thap}°`],
        ["Độ ẩm", `${tt.doAm}%`],
        ["Mặt trời lặn", tt.hoangHon],
      ]
    : null;
  return (
    <The
      tieuDe="Thực địa hôm nay"
      phai={
        tt && (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 text-[0.6875rem] font-medium text-brand">
            <Radio className="h-3 w-3" aria-hidden="true" />
            Trực tiếp
          </span>
        )
      }
    >
      {tt === undefined && <p className="text-sm text-ink-faint">Đang lấy thời tiết…</p>}
      {tt === null && <p className="text-sm text-ink-faint">Chưa lấy được thời tiết lúc này.</p>}
      {dong && (
        <>
          <dl className="divide-y divide-line text-sm">
            {dong.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 py-2">
                <dt className="text-ink-soft">{k}</dt>
                <dd className="font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[0.6875rem] leading-relaxed text-ink-faint">
            Tại {d.toaDo.ten}. Số liệu Open-Meteo, cập nhật {tt.capNhat}. Thời tiết trên núi có thể đổi nhanh.
          </p>
        </>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {d.xem360 &&
          (laNgoai(d.xem360) ? (
            <a href={d.xem360} target="_blank" rel="noopener noreferrer" className={NUT_NHO}>
              <Rotate3d className="h-3.5 w-3.5" aria-hidden="true" /> Xem 360°
            </a>
          ) : (
            <Link to={d.xem360} className={NUT_NHO}>
              <Rotate3d className="h-3.5 w-3.5" aria-hidden="true" /> Xem 360°
            </Link>
          ))}
        {d.ungDung?.map((u) => (
          <a key={u.lienKet} href={u.lienKet} target="_blank" rel="noopener noreferrer" className={NUT_NHO}>
            {u.loai}
            <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
          </a>
        ))}
      </div>
    </The>
  );
}

const NUT_NHO =
  "inline-flex items-center gap-1.5 rounded-lg bg-mist px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-line";

// Chưa đăng nhập: bấm câu gợi ý thì sang trang đăng nhập, xong quay về đây
// và câu đó được gửi luôn (qua ?hoi=).
function GoiY({ d, daDangNhap }) {
  const [vaiTro, setVaiTro] = useState(VAI_TRO[0].khoa);
  const diTiep = useNavigate();
  const hoi = (cau) => {
    if (daDangNhap) return guiCauHoi(ghepVung(cau, d));
    const tiep = `/hoi-dap/${d.khoa}?hoi=${encodeURIComponent(cau)}`;
    diTiep(`/dang-nhap?tiep=${encodeURIComponent(tiep)}`);
  };
  return (
    <The tieuDe="Gợi ý câu hỏi">
      <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Chọn vai trò">
        {VAI_TRO.map(({ khoa, nhan }) => (
          <button
            key={khoa}
            type="button"
            onClick={() => setVaiTro(khoa)}
            aria-pressed={khoa === vaiTro}
            className={
              "rounded-full px-2.5 py-1 text-[0.75rem] font-medium transition-colors " +
              (khoa === vaiTro ? "bg-brand text-tren-brand" : "bg-mist text-ink-soft hover:text-ink")
            }
          >
            {nhan}
          </button>
        ))}
      </div>
      <ul className="space-y-2">
        {(d.cauHoi?.[vaiTro] ?? []).map((cau) => (
          <li key={cau}>
            <button
              type="button"
              onClick={() => hoi(cau)}
              className="group flex w-full items-start justify-between gap-3 rounded-xl border border-line px-3.5 py-3 text-left text-[0.8125rem] leading-snug text-ink-soft transition-colors hover:border-brand/40 hover:text-ink"
            >
              {cau}
              <ChevronRight
                className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </button>
          </li>
        ))}
      </ul>
    </The>
  );
}

function BanDo({ d }) {
  const { lat, lon, ten } = d.toaDo;
  const hop = [lon - 0.03, lat - 0.018, lon + 0.03, lat + 0.018].map((x) => x.toFixed(4)).join(",");
  return (
    <The
      tieuDe="Bản đồ"
      phai={
        <a
          href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=14/${lat}/${lon}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-ink-soft hover:text-brand"
        >
          Mở bản đồ lớn
        </a>
      }
    >
      <iframe
        title={`Bản đồ ${ten}`}
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${hop}&layer=mapnik&marker=${lat},${lon}`}
        loading="lazy"
        className="h-48 w-full rounded-xl border-0 bg-mist"
      />
      <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-soft">
        <MapIcon className="h-3.5 w-3.5" aria-hidden="true" />
        {ten}
      </p>
    </The>
  );
}

export default function HoiDapPage() {
  const { khoa } = useParams();
  const [thamSo, setThamSo] = useSearchParams();
  const diTiep = useNavigate();
  const d = DS.find((x) => x.khoa === khoa) ?? DS[0];
  // Thời tiết gắn với địa phương đã lấy: đổi địa phương thì coi như đang tải
  // lại (undefined) cho tới khi có kết quả mới. null = lấy không được.
  const [ttLuu, setTtLuu] = useState({ khoa: null, kq: undefined });
  const tt = ttLuu.khoa === d.khoa ? ttLuu.kq : undefined;
  const nguoi = useTaiKhoan();

  useDocumentTitle(`Hỏi đáp AI về ${d.ten} | iMob`);

  // Câu hỏi mang theo từ trang chủ. Đọc MỘT lần lúc mở trang.
  const [cauHoiDau] = useState(() => {
    const c = thamSo.get("hoi");
    return c ? ghepVung(c, d) : "";
  });
  const xoaThamSo = useCallback(() => setThamSo({}, { replace: true }), [setThamSo]);

  useEffect(() => {
    let huy = false;
    layThoiTiet(d.toaDo).then((kq) => !huy && setTtLuu({ khoa: d.khoa, kq }));
    return () => {
      huy = true;
    };
  }, [d.khoa, d.toaDo]);

  return (
    <div className="bg-paper pt-16">
      {/* ---------- Thanh địa phương ---------- */}
      <div className="border-b border-line bg-panel">
        <Container rong="max-w-6xl" className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <img src={d.anh} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
            <div className="min-w-0">
              <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                Đang hỏi về · {d.nhan}
              </p>
              <h1 className="truncate font-display text-xl font-semibold text-ink">
                {d.ten}
                <span className="font-sans text-sm font-normal text-ink-soft"> · {d.hanhChinh}</span>
              </h1>
            </div>
            <label className="relative ml-1 inline-flex items-center">
              <span className="sr-only">Đổi địa phương</span>
              <select
                value={d.khoa}
                onChange={(e) => diTiep(`/hoi-dap/${e.target.value}`)}
                className="cursor-pointer appearance-none rounded-lg bg-mist py-1.5 pl-3 pr-8 text-xs font-medium text-ink-soft outline-none hover:text-ink"
              >
                {DS.map((x) => (
                  <option key={x.khoa} value={x.khoa}>
                    {x.khoa === d.khoa ? "Đổi địa phương" : x.ten}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-ink-faint" aria-hidden="true" />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
            {tt && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1">
                <Cloud className="h-3.5 w-3.5" aria-hidden="true" />
                {tt.nhietDo}°C · {tt.moTa}
              </span>
            )}
            {tt?.hoangHon && (
              <span className="hidden items-center gap-1.5 rounded-full border border-line px-3 py-1 sm:inline-flex">
                <Sunset className="h-3.5 w-3.5" aria-hidden="true" />
                Hoàng hôn {tt.hoangHon}
              </span>
            )}
          </div>
        </Container>
      </div>

      {/* ---------- Dải giới thiệu ---------- */}
      <section className="relative overflow-hidden bg-brand-deep text-tren-brand">
        <img src={d.anh} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-deep via-brand-deep/85 to-brand-deep/40" />
        <Container rong="max-w-6xl" className="relative py-7">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-tren-brand/75">
            Trợ lý AI · {d.hanhChinh}
          </p>
          <p className="mt-2 font-display text-2xl font-semibold italic sm:text-3xl">“{d.tieuDePhu}”</p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-tren-brand/85">{d.moTa}</p>
        </Container>
      </section>

      {/* ---------- Chat + cột phải ---------- */}
      <Container rong="max-w-6xl" className="grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_21rem]">
        {/* Chưa đăng nhập: ô báo phải đăng nhập thay cho khung chat (giữ
            nguyên ?hoi= trên địa chỉ để đăng nhập xong gửi câu đó luôn). */}
        {nguoi ? <KhungChatCaTrang cauHoiDau={cauHoiDau} khiDaGui={xoaThamSo} /> : <CanDangNhap />}

        <aside className="space-y-5">
          <ThucDia d={d} tt={tt} />
          <GoiY key={d.khoa} d={d} daDangNhap={!!nguoi} />
          <section className="rounded-2xl bg-brand-deep p-5 text-tren-brand">
            <p className="inline-flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-accent-soft">
              <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
              Trả lời kèm nguồn
            </p>
            <p className="mt-3 text-sm leading-relaxed text-tren-brand/85">
              Dưới câu trả lời có thẻ nguồn: bấm vào để xem tài liệu trợ lý đã dựa vào. Thông tin quan trọng như giá
              vé, giờ mở cửa, hãy xác nhận lại với địa phương.
            </p>
            <Link
              to="/#nguon-tri-thuc"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent-soft hover:underline"
            >
              Trợ lý tìm câu trả lời thế nào
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
          <BanDo d={d} />
        </aside>
      </Container>
    </div>
  );
}
