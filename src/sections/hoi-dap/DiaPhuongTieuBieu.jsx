import { Link } from "react-router-dom";
import { ExternalLink, Map as MapIcon, MessageSquare, Rotate3d } from "lucide-react";
import Container from "../../components/ui/Container.jsx";
import { openChat } from "../../utils/chatBus.js";
import diaPhuong from "../../data/diaPhuong.json";

// ============================================================
// "Địa phương tiêu biểu" — thẻ LỚN cho địa phương đầu danh sách, các thẻ nhỏ
// cho phần còn lại (giao diện chốt 13/11/2026). Dữ liệu: data/diaPhuong.json.
//
// Mọi con số trên thẻ đều có nguồn ghi trong `_nguon` của file dữ liệu. Ảnh mẫu
// có "1,420+ tri thức xác thực", "780+ bản ghi số", "2 làng nghề OCOP" — không
// có nguồn, đã thay bằng số đếm được thật (số điểm 360°, số địa điểm trên bản
// đồ số). Ảnh thẻ là ảnh thật từ chính dự án iMob làm cho địa phương đó.
// ============================================================

const DS = diaPhuong.danhSach;

const laNgoai = (url) => /^https?:\/\//.test(url);

function NutXem360({ den, className, gon }) {
  const ruot = (
    <>
      <Rotate3d className="h-4 w-4" aria-hidden="true" />
      {gon ? "Xem không gian 360°" : "Khám phá không gian 360°"}
    </>
  );
  return laNgoai(den) ? (
    <a href={den} target="_blank" rel="noopener noreferrer" className={className}>
      {ruot}
    </a>
  ) : (
    <Link to={den} className={className}>
      {ruot}
    </Link>
  );
}

function AnhThe({ d, lon }) {
  return (
    <div className={"relative overflow-hidden " + (lon ? "aspect-[16/10] sm:aspect-[16/9]" : "aspect-[4/3]")}>
      <img
        src={d.anh}
        alt={d.anhMoTa}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
      <span className="absolute left-4 top-4 rounded-full bg-panel/90 px-3 py-1 text-xs font-medium text-ink">
        {d.nhan}
      </span>
      <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-white/85">
          {lon ? d.hanhChinh : d.hanhChinh.split(" · ")[0]}
        </p>
        <h3 className={"mt-1 font-display font-semibold leading-tight " + (lon ? "text-4xl" : "text-[1.75rem]")}>
          {d.ten}
        </h3>
        {lon && <p className="mt-1 text-sm text-white/90">{d.tieuDePhu}</p>}
      </div>
    </div>
  );
}

// Thẻ LỚN: một dải ô — số liệu trước, rồi mỗi ứng dụng iMob đã làm cho địa
// phương là một ô bấm được (tên loại to, tên riêng nhỏ, mở tab mới).
function DaiSoLieu({ d }) {
  return (
    <dl className="grid grid-cols-[repeat(auto-fit,minmax(8.5rem,1fr))] divide-line overflow-hidden rounded-xl bg-mist sm:divide-x">
      {d.soLieu?.map((s) => (
        <div key={s.nhan} className="flex flex-col-reverse items-center px-3 py-4 text-center">
          <dt className="text-xs text-ink-soft">{s.nhan}</dt>
          <dd className="font-display text-2xl font-semibold text-brand">{s.so}</dd>
        </div>
      ))}
      {d.ungDung?.map((u) => (
        <div key={u.lienKet} className="flex flex-col-reverse items-center px-3 py-4 text-center">
          <dt className="text-xs text-ink-soft">{u.loai}</dt>
          <dd>
            <a
              href={u.lienKet}
              target="_blank"
              rel="noopener noreferrer"
              title={`Mở ${u.loai} ${u.ten} (tab mới)`}
              className="whitespace-nowrap font-display text-[1.0625rem] font-semibold text-brand underline-offset-4 hover:underline"
            >
              {u.ten}
            </a>
          </dd>
        </div>
      ))}
    </dl>
  );
}

// Thẻ NHỎ: số liệu và ứng dụng xếp dòng, gọn.
function SoLieuNho({ d }) {
  return (
    <div className="space-y-3">
      {d.soLieu?.length > 0 && (
        <dl className="space-y-1">
          {d.soLieu.map((s) => (
            <div key={s.nhan} className="flex flex-row-reverse items-baseline justify-end gap-1.5">
              <dt className="text-xs text-ink-soft">{s.nhan}</dt>
              <dd className="font-display text-lg font-semibold text-brand">{s.so}</dd>
            </div>
          ))}
        </dl>
      )}
      {d.ungDung?.map((u) => (
        <a
          key={u.lienKet}
          href={u.lienKet}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-ink-soft underline-offset-4 hover:text-brand hover:underline"
        >
          <MapIcon className="h-3.5 w-3.5" aria-hidden="true" />
          {u.loai} {u.ten}
          <ExternalLink className="h-3 w-3 opacity-60" aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}

const NUT_CHINH =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-tren-brand transition-colors hover:bg-brand-deep";
const NUT_PHU =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-mist px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-line";

const hoiVe = (d) => () => openChat(`Giới thiệu cho tôi về ${d.ten}`);

export default function DiaPhuongTieuBieu() {
  const [dau, ...con] = DS;

  return (
    <section id="dia-phuong" className="bg-mist py-20 sm:py-24">
      <Container rong="max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-accent">
              <MapIcon className="h-3.5 w-3.5" aria-hidden="true" />
              Địa phương đã số hoá cùng iMob
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-brand-deep sm:text-5xl">
              Địa phương tiêu biểu
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-ink-soft">
            Những địa phương iMob đã làm bản đồ số, tour thực tế ảo 360° và ứng dụng cho du khách. Chọn một
            nơi để hỏi trợ lý AI.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.9fr_1fr_1fr]">
          {/* ---------- Thẻ lớn ---------- */}
          <article className="group flex flex-col overflow-hidden rounded-2xl bg-panel shadow-soft">
            <AnhThe d={dau} lon />
            <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
              <DaiSoLieu d={dau} />
              <p className="text-sm leading-relaxed text-ink-soft">{dau.moTa}</p>
              <div className="mt-auto flex flex-wrap gap-2.5">
                <button type="button" onClick={hoiVe(dau)} className={NUT_CHINH}>
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  Trò chuyện với AI về vùng này
                </button>
                {dau.xem360 && <NutXem360 den={dau.xem360} className={NUT_PHU} />}
              </div>
            </div>
          </article>

          {/* ---------- Thẻ nhỏ ---------- */}
          {con.map((d) => (
            <article key={d.khoa} className="group flex flex-col overflow-hidden rounded-2xl bg-panel shadow-soft">
              <AnhThe d={d} />
              <div className="flex flex-1 flex-col gap-4 p-5">
                <p className="text-sm leading-relaxed text-ink-soft">{d.moTa}</p>
                <SoLieuNho d={d} />
                <div className="mt-auto grid gap-2">
                  <button type="button" onClick={hoiVe(d)} className={NUT_PHU}>
                    <MessageSquare className="h-4 w-4" aria-hidden="true" />
                    Trò chuyện với AI
                  </button>
                  {d.xem360 && <NutXem360 den={d.xem360} gon className={NUT_PHU + " bg-transparent ring-1 ring-line"} />}
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
