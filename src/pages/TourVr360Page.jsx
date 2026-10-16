import { useMemo, useState } from "react";
import {
  Building2,
  CableCar,
  Landmark,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from "lucide-react";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import duLieu from "../data/tourVr360.json";

// ============================================================
// Trang /tour-360 — mục "VR360" riêng trên thanh menu (16/10/2026).
//
// Bố cục theo màn "Virtual Tour" của bandosoxaquangtan.vn: cột trái là danh
// sách điểm ngắm (tìm kiếm + danh sách + mô tả điểm đang xem), bên phải là
// tour 360° chiếm hết phần màn hình còn lại dưới thanh menu. Màu và chữ là của
// imob.vn, KHÔNG mang giao diện trang Quảng Tân.
//
// Bấm một điểm = nạp lại khung tour ở đúng cảnh đó (đổi `key` của iframe).
// Đi lại bên trong tour thì cột trái không chạy theo — Panoee không báo ra
// ngoài khung nhúng đang ở cảnh nào.
//
// Dữ liệu: data/tourVr360.json. Nút chat nổi được tắt trên trang này (xem
// Layout.jsx) vì nó đè lên nút toàn màn hình ở góc phải của tour.
// ============================================================

const { tour, diemNgam: DIEM } = duLieu;

// Phải dùng dạng tour.panoee.net/<tour>/<cảnh>. Dạng /iframe/<tour>/<cảnh>
// trả về trang 404 của Panoee (đã thử 16/10/2026).
const linkCanh = (canh) => `https://tour.panoee.net/${tour.id}/${canh}`;

const BIEU_TUONG = { chua: Landmark, "van-hoa": Building2, "tien-ich": CableCar };

// Tìm không phân biệt dấu: "chua dong" vẫn ra "Chùa Đồng".
const boDau = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase();

export default function TourVr360Page() {
  useDocumentTitle("VR360 Yên Tử — Tham quan thực tế ảo | iMob");
  const [chon, setChon] = useState(DIEM.find((d) => d.canh === tour.canhMacDinh)?.id ?? DIEM[0].id);
  const [tu, setTu] = useState("");
  const [moCot, setMoCot] = useState(true);

  const diem = DIEM.find((d) => d.id === chon) ?? DIEM[0];
  const danhSach = useMemo(() => {
    const q = boDau(tu.trim());
    return q ? DIEM.filter((d) => boDau(d.ten).includes(q)) : DIEM;
  }, [tu]);

  return (
    <section className="bg-mist pt-16">
      <div className="flex flex-col lg:h-[calc(100svh-4rem)] lg:flex-row">
        {/* ---------- Cột danh sách điểm ngắm ---------- */}
        <aside
          className={
            "order-2 flex min-h-0 flex-col border-line bg-paper lg:order-1 lg:w-[380px] lg:shrink-0 lg:border-r " +
            (moCot ? "" : "lg:hidden")
          }
        >
          <div className="border-b border-line px-5 pt-7 pb-5 sm:px-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                  Hệ thống Virtual Tour
                </p>
                <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-ink">VR360 Yên Tử</h1>
              </div>
              <button
                type="button"
                onClick={() => setMoCot(false)}
                className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-brand hover:text-brand lg:flex"
                aria-label="Thu gọn danh sách để xem tour rộng hơn"
              >
                <PanelLeftClose className="h-4.5 w-4.5" aria-hidden="true" />
              </button>
            </div>
            <label className="relative mt-4 block">
              <span className="sr-only">Tìm điểm ngắm</span>
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-faint"
                aria-hidden="true"
              />
              <input
                type="search"
                value={tu}
                onChange={(e) => setTu(e.target.value)}
                placeholder="Tìm chùa, điểm tham quan…"
                className="w-full rounded-xl border border-line bg-mist/50 py-2.5 pr-3 pl-10 text-[0.9375rem] text-ink placeholder:text-ink-faint focus:border-brand focus:bg-paper focus:outline-none"
              />
            </label>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-5 pb-4 sm:px-5">
            <p className="px-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
              Danh sách điểm ngắm ({danhSach.length})
            </p>
            <ul className="mt-3 space-y-2">
              {danhSach.map((d) => {
                const Icon = BIEU_TUONG[d.loai] ?? Landmark;
                const dangChon = d.id === chon;
                return (
                  <li key={d.id}>
                    <button
                      type="button"
                      onClick={() => setChon(d.id)}
                      aria-current={dangChon ? "true" : undefined}
                      className={
                        "flex w-full items-center gap-3 rounded-xl border-l-[3px] px-4 py-3 text-left text-[0.9375rem] transition-colors focus-visible:outline-2 focus-visible:outline-brand " +
                        (dangChon
                          ? "border-brand bg-brand-soft font-semibold text-ink"
                          : "border-transparent bg-mist/60 text-ink-soft hover:bg-mist hover:text-ink")
                      }
                    >
                      <Icon
                        className={"h-4.5 w-4.5 shrink-0 " + (dangChon ? "text-brand" : "text-ink-faint")}
                        aria-hidden="true"
                      />
                      {d.ten}
                    </button>
                  </li>
                );
              })}
              {danhSach.length === 0 && (
                <li className="px-1 py-4 text-sm text-ink-faint">
                  Không có điểm nào khớp “{tu}”. Thử gõ ngắn hơn, ví dụ “Hoa Yên”.
                </li>
              )}
            </ul>
          </div>

          {/* Mô tả điểm đang xem — luôn nằm đáy cột */}
          <div className="border-t border-line bg-mist px-5 py-5 sm:px-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">{diem.ten}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{diem.moTa}</p>
          </div>
        </aside>

        {/* ---------- Khung tour ---------- */}
        <div className="relative order-1 h-[70svh] min-h-[420px] bg-ink lg:order-2 lg:h-auto lg:min-h-0 lg:flex-1">
          <iframe
            key={diem.canh}
            title={`Tour 360°: ${diem.ten}`}
            src={linkCanh(diem.canh)}
            className="absolute inset-0 h-full w-full border-0"
            allow="autoplay; accelerometer; gyroscope; fullscreen; xr-spatial-tracking"
            allowFullScreen
          />
          {!moCot && (
            <button
              type="button"
              onClick={() => setMoCot(true)}
              className="absolute top-4 left-4 hidden items-center gap-2 rounded-full bg-paper/95 px-4 py-2 text-sm font-semibold text-ink shadow-lift transition-colors hover:text-brand lg:flex"
            >
              <PanelLeftOpen className="h-4.5 w-4.5" aria-hidden="true" />
              Danh sách điểm ngắm
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
