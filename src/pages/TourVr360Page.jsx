import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Building2,
  BusFront,
  CableCar,
  Droplets,
  Earth,
  Factory,
  Flag,
  Landmark,
  Mountain,
  PanelLeftClose,
  PanelLeftOpen,
  School,
  Search,
  Store,
  Utensils,
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
// Nhiều tour (Yên Tử, Quảng Tân…): nút chuyển ở đầu cột trái, tour đang chọn
// ghi lên địa chỉ (?tour=quang-tan) để gửi link thẳng cho khách được.
//
// Bấm một điểm = nạp lại khung tour ở đúng cảnh đó (đổi `key` của iframe).
// Đi lại bên trong tour thì cột trái không chạy theo — Panoee không báo ra
// ngoài khung nhúng đang ở cảnh nào.
//
// Dữ liệu: data/tourVr360.json. Nút chat nổi được tắt trên trang này (xem
// Layout.jsx) vì nó đè lên nút toàn màn hình ở góc phải của tour.
// ============================================================

const TOURS = duLieu.tours;

// Phải dùng dạng tour.panoee.net/<tour>/<cảnh>. Dạng /iframe/<tour>/<cảnh>
// trả về trang 404 của Panoee (đã thử 16/10/2026).
const linkCanh = (tour, canh) => `https://tour.panoee.net/${tour.id}/${canh}`;

const BIEU_TUONG = {
  "toan-canh": Earth,
  chua: Landmark,
  "thien-nhien": Mountain,
  nuoc: Droplets,
  "van-hoa": Building2,
  cho: Store,
  "an-uong": Utensils,
  "tien-ich": CableCar,
  "giao-thong": BusFront,
  "cong-nghiep": Factory,
  "co-quan": Flag,
  "truong-hoc": School,
};

// Danh sách chia mục theo `loai` (26/10/2026: tour Yên Tử lên hơn 40 điểm,
// một cột liền 40 dòng thì khó tìm). Thứ tự mục = thứ tự hiện; trong mỗi mục
// giữ thứ tự của file dữ liệu. Loại nào không có trong bảng này rơi vào "Khác".
const NHOM_HIEN_THI = [
  { ten: "Toàn cảnh", loai: ["toan-canh"] },
  { ten: "Chùa – đền – di tích", loai: ["chua"] },
  { ten: "Thiên nhiên", loai: ["thien-nhien", "nuoc"] },
  {
    ten: "Văn hoá – dịch vụ",
    loai: [
      "van-hoa",
      "cho",
      "an-uong",
      "tien-ich",
      "giao-thong",
      "cong-nghiep",
    ],
  },
  { ten: "Cơ quan", loai: ["co-quan"] },
  { ten: "Trường học", loai: ["truong-hoc"] },
];
const tenMuc = (loai) =>
  NHOM_HIEN_THI.find((n) => n.loai.includes(loai))?.ten ?? "Khác";

function chiaMuc(ds) {
  const muc = NHOM_HIEN_THI.map((n) => ({
    ten: n.ten,
    diem: ds.filter((d) => n.loai.includes(d.loai)),
  }));
  const khac = ds.filter(
    (d) => !NHOM_HIEN_THI.some((n) => n.loai.includes(d.loai)),
  );
  if (khac.length) muc.push({ ten: "Khác", diem: khac });
  return muc.filter((m) => m.diem.length);
}

const diemMacDinh = (tour) =>
  (tour.diemNgam.find((d) => d.canh === tour.canhMacDinh) ?? tour.diemNgam[0])
    .id;

// Tìm không phân biệt dấu: "chua dong" vẫn ra "Chùa Đồng".
const boDau = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase();

export default function TourVr360Page() {
  const [thamSo, setThamSo] = useSearchParams();
  const tour = TOURS.find((t) => t.khoa === thamSo.get("tour")) ?? TOURS[0];
  const DIEM = tour.diemNgam;
  useDocumentTitle(`VR360 ${tour.ten} — Tham quan thực tế ảo | iMob`);

  // `chon` nhớ theo từng tour: chuyển tour qua lại không mất điểm đang xem.
  const [chonTheoTour, setChonTheoTour] = useState({});
  const chon = chonTheoTour[tour.khoa] ?? diemMacDinh(tour);
  const setChon = (id) => setChonTheoTour((c) => ({ ...c, [tour.khoa]: id }));
  const [tu, setTu] = useState("");
  const [moCot, setMoCot] = useState(true);

  const diem = DIEM.find((d) => d.id === chon) ?? DIEM[0];
  const danhSach = useMemo(() => {
    const q = boDau(tu.trim());
    return q ? DIEM.filter((d) => boDau(d.ten).includes(q)) : DIEM;
  }, [tu, DIEM]);

  const doiTour = (khoa) => {
    setTu("");
    // replace: chuyển tour không chồng thêm lịch sử — bấm Quay lại là rời trang.
    setThamSo(khoa === TOURS[0].khoa ? {} : { tour: khoa }, { replace: true });
  };

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
                <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-ink">
                  VR360 {tour.ten}
                </h1>
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
            {TOURS.length > 1 && (
              <div
                className="mt-4 flex rounded-xl bg-mist p-1"
                role="group"
                aria-label="Chọn tour"
              >
                {TOURS.map((t) => (
                  <button
                    key={t.khoa}
                    type="button"
                    onClick={() => doiTour(t.khoa)}
                    aria-pressed={t.khoa === tour.khoa}
                    className={
                      "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-brand " +
                      (t.khoa === tour.khoa
                        ? "bg-paper text-brand shadow-soft"
                        : "text-ink-soft hover:text-ink")
                    }
                  >
                    {t.ten}
                  </button>
                ))}
              </div>
            )}
            <label className="relative mt-3 block">
              <span className="sr-only">Tìm điểm ngắm</span>
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-ink-faint"
                aria-hidden="true"
              />
              <input
                type="search"
                value={tu}
                onChange={(e) => setTu(e.target.value)}
                placeholder="Tìm điểm ngắm…"
                className="w-full rounded-xl border border-line bg-mist/50 py-2.5 pr-3 pl-10 text-[0.9375rem] text-ink placeholder:text-ink-faint focus:border-brand focus:bg-paper focus:outline-none"
              />
            </label>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-5 pb-4 sm:px-5">
            <p className="px-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
              Danh sách điểm ngắm ({danhSach.length})
            </p>
            {chiaMuc(danhSach).map((muc) => (
              <div key={muc.ten} className="mt-4 first:mt-3">
                <p className="px-1 pb-2 text-[0.8125rem] font-semibold text-ink">
                  {muc.ten}{" "}
                  <span className="font-normal text-ink-faint">
                    · {muc.diem.length}
                  </span>
                </p>
                <ul className="space-y-2">
                  {muc.diem.map((d) => {
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
                            className={
                              "h-4.5 w-4.5 shrink-0 " +
                              (dangChon ? "text-brand" : "text-ink-faint")
                            }
                            aria-hidden="true"
                          />
                          {d.ten}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            {danhSach.length === 0 && (
              <p className="px-1 py-4 text-sm text-ink-faint">
                Không có điểm nào khớp “{tu}”. Thử gõ ngắn hơn, ví dụ “Hoa Yên”.
              </p>
            )}
          </div>

          {/* Mô tả điểm đang xem — luôn nằm đáy cột */}
          <div className="border-t border-line bg-mist px-5 py-5 sm:px-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">
              {diem.ten}
            </p>
            {/* Điểm chưa có mô tả: chỉ ghi mục + cách xem, KHÔNG tự bịa nội dung. */}
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              {diem.moTa ??
                `${tenMuc(diem.loai)} · Kéo để nhìn quanh, bấm các mũi tên trong tour để đi sang cảnh khác.`}
            </p>
          </div>
        </aside>

        {/* ---------- Khung tour ---------- */}
        <div className="relative order-1 h-[70svh] min-h-[420px] bg-ink lg:order-2 lg:h-auto lg:min-h-0 lg:flex-1">
          <iframe
            key={`${tour.khoa}/${diem.canh}`}
            title={`Tour 360° ${tour.tenDayDu}: ${diem.ten}`}
            src={linkCanh(tour, diem.canh)}
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
