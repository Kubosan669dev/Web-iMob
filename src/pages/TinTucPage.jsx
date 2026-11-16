import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { ArrowRight, BookOpen, Loader2, Newspaper } from "lucide-react";
import Container from "../components/ui/Container.jsx";
import Anh from "../components/ui/Anh.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import { NUT_DANG_KY } from "../utils/constants.js";
import { diaChiAnh } from "../utils/anh.js";
import {
  LOAI,
  LOAI_CAU_CHUYEN,
  LOAI_TIN_CONG_TY,
  danhSachBaiViet,
  duongDanBai,
  ngayViet,
} from "../services/baiVietService.js";

// ============================================================
// Trang TIN TỨC (16/11/2026) — gộp "Tin công ty" và "Câu chuyện khách hàng"
// vào MỘT trang, có mục riêng trên menu. Thay cho DanhSachBaiVietPage cũ (hai
// trang danh sách tách đôi, không còn đường vào từ menu sau khi web gọn lại).
//
//   /tin-tuc                    tất cả bài
//   /tin-tuc?muc=tin-cong-ty    chỉ tin công ty
//   /cau-chuyen                 chỉ câu chuyện khách hàng (giữ đường dẫn cũ)
//   /tin-tuc/:bai, /cau-chuyen/:bai — trang đọc bài, không đổi (BaiVietPage).
//
// Bài lấy từ /api/bai-viet (soạn ở /admin → Bài viết), tải MỘT lần rồi lọc ở
// trình duyệt: hai loại cộng lại vẫn ít bài, đổi tab không phải chờ máy chủ.
//
// Bố cục chịu được lúc ít bài: bài mới nhất nằm thẻ lớn ngang, phần còn lại
// xếp lưới; mục chưa có bài thì hiện một câu tử tế kèm lối đi tiếp, không bao
// giờ là lưới trống.
// ============================================================

const MUC = [
  { khoa: "tat-ca", nhan: "Tất cả", loai: null, den: "/tin-tuc" },
  { khoa: "tin-cong-ty", nhan: LOAI[LOAI_TIN_CONG_TY].nhan, loai: LOAI_TIN_CONG_TY, den: "/tin-tuc?muc=tin-cong-ty" },
  { khoa: "cau-chuyen", nhan: LOAI[LOAI_CAU_CHUYEN].nhan, loai: LOAI_CAU_CHUYEN, den: "/cau-chuyen" },
];

function NhanLoai({ loai, toi }) {
  const Icon = loai === LOAI_TIN_CONG_TY ? Newspaper : BookOpen;
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] " +
        (toi ? "text-accent-soft" : "text-accent")
      }
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {LOAI[loai]?.nhanNgan ?? "Bài viết"}
    </span>
  );
}

function DongNgay({ bai }) {
  return (
    <p className="text-xs text-ink-faint">
      {ngayViet(bai.dang_luc)}
      {bai.loai === LOAI_CAU_CHUYEN && bai.ten_khach ? ` · ${bai.ten_khach}` : ""}
    </p>
  );
}

function TheLon({ bai }) {
  return (
    <Link
      to={duongDanBai(bai)}
      className="group grid overflow-hidden rounded-2xl bg-panel shadow-soft transition hover:shadow-lift md:grid-cols-[1.35fr_1fr]"
    >
      <Anh
        src={diaChiAnh(bai.anh_bia)}
        alt=""
        boc="aspect-[16/10] overflow-hidden bg-mist md:aspect-auto md:min-h-[20rem]"
        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
      />
      <div className="flex flex-col justify-center gap-3 p-6 sm:p-8">
        <NhanLoai loai={bai.loai} />
        <h2 className="font-display text-2xl font-semibold leading-snug text-brand-deep group-hover:text-brand sm:text-3xl">
          {bai.tieu_de}
        </h2>
        {bai.tom_tat && <p className="leading-relaxed text-ink-soft">{bai.tom_tat}</p>}
        <DongNgay bai={bai} />
        <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
          Đọc bài
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

function TheNho({ bai }) {
  return (
    <Link
      to={duongDanBai(bai)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-panel shadow-soft transition hover:shadow-lift"
    >
      <Anh
        src={diaChiAnh(bai.anh_bia)}
        alt=""
        boc="aspect-[16/10] overflow-hidden bg-mist"
        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
      />
      <div className="flex flex-1 flex-col gap-2 p-5">
        <NhanLoai loai={bai.loai} />
        <h3 className="font-display text-lg font-semibold leading-snug text-ink group-hover:text-brand">
          {bai.tieu_de}
        </h3>
        {bai.tom_tat && <p className="line-clamp-3 text-sm leading-relaxed text-ink-soft">{bai.tom_tat}</p>}
        <div className="mt-auto pt-2">
          <DongNgay bai={bai} />
        </div>
      </div>
    </Link>
  );
}

function ChuaCoBai({ muc, loi }) {
  const cauChuyen = muc.loai === LOAI_CAU_CHUYEN;
  return (
    <div className="rounded-2xl border border-dashed border-line bg-panel px-6 py-14 text-center">
      <p className="font-display text-xl font-semibold text-ink">
        {loi
          ? "Chưa tải được bài viết."
          : cauChuyen
            ? "Những câu chuyện đầu tiên đang được viết."
            : "Chưa có bài nào ở mục này."}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
        {loi
          ? "Bạn tải lại trang sau ít phút giúp mình nhé."
          : cauChuyen
            ? "Trong lúc chờ, bạn có thể xem các địa phương đã số hoá cùng iMob."
            : "Mời bạn quay lại sau ít hôm."}
      </p>
      <Link
        to={cauChuyen ? "/#dia-phuong" : "/ve-chung-toi#projects"}
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
      >
        {cauChuyen ? "Xem các địa phương" : "Xem dự án đã làm"}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

export default function TinTucPage() {
  const { pathname } = useLocation();
  const [thamSo] = useSearchParams();
  const khoaMuc = pathname.startsWith("/cau-chuyen") ? "cau-chuyen" : (thamSo.get("muc") ?? "tat-ca");
  const muc = MUC.find((m) => m.khoa === khoaMuc) ?? MUC[0];

  useDocumentTitle(`${muc.khoa === "tat-ca" ? "Tin tức & Câu chuyện khách hàng" : muc.nhan} | iMob`);

  const [tatCa, setTatCa] = useState(null); // null = đang tải
  const [loi, setLoi] = useState(false);

  useEffect(() => {
    let conHieuLuc = true;
    danhSachBaiViet()
      .then((ds) => conHieuLuc && setTatCa(Array.isArray(ds) ? ds : []))
      .catch(() => {
        if (!conHieuLuc) return;
        setLoi(true);
        setTatCa([]);
      });
    return () => {
      conHieuLuc = false;
    };
  }, []);

  const ds = tatCa ? tatCa.filter((b) => !muc.loai || b.loai === muc.loai) : null;
  const [dau, ...conLai] = ds ?? [];
  const dem = (loai) => tatCa?.filter((b) => !loai || b.loai === loai).length;

  return (
    <>
      <section className="bg-paper pb-16 pt-28 sm:pt-32">
        <Container rong="max-w-6xl">
          <p className="inline-flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-accent">
            <Newspaper className="h-3.5 w-3.5" aria-hidden="true" />
            Tin tức
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-brand-deep sm:text-5xl">
            Tin tức &amp; <em>Câu chuyện khách hàng</em>
          </h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
            Việc iMob đang làm cùng các địa phương, và những sản phẩm đã bàn giao kể từ góc nhìn của người dùng
            thật.
          </p>

          <nav className="mt-8 flex flex-wrap gap-2 border-b border-line pb-5" aria-label="Chọn mục">
            {MUC.map((m) => {
              const chon = m.khoa === muc.khoa;
              const so = dem(m.loai);
              return (
                <Link
                  key={m.khoa}
                  to={m.den}
                  aria-current={chon ? "page" : undefined}
                  className={
                    "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors " +
                    (chon ? "bg-brand text-tren-brand" : "bg-mist text-ink-soft hover:text-ink")
                  }
                >
                  {m.nhan}
                  {so !== undefined && (
                    <span className={"text-xs " + (chon ? "text-tren-brand/75" : "text-ink-faint")}>{so}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-10">
            {ds === null ? (
              <p className="flex items-center gap-2 py-16 text-sm text-ink-soft">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Đang tải bài viết…
              </p>
            ) : ds.length === 0 ? (
              <ChuaCoBai muc={muc} loi={loi} />
            ) : (
              <div className="space-y-8">
                <TheLon bai={dau} />
                {conLai.length > 0 && (
                  <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {conLai.map((bai) => (
                      <li key={bai.id}>
                        <TheNho bai={bai} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Lời mời cuối trang — câu chuyện khách hàng sinh ra từ đây */}
      <section className="bg-mist py-14">
        <Container rong="max-w-6xl" className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold text-brand-deep">
              Địa phương của bạn muốn có trợ lý AI riêng?
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              Câu chuyện tiếp theo trên trang này có thể là của bạn.
            </p>
          </div>
          <a
            href={NUT_DANG_KY.href}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-tren-brand transition-colors hover:bg-brand-deep"
          >
            {NUT_DANG_KY.label}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </Container>
      </section>
    </>
  );
}
