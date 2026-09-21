import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Loader2, ArrowRight, Newspaper } from "lucide-react";
import Container from "../components/ui/Container.jsx";
import Anh from "../components/ui/Anh.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import { useCongTy } from "../context/NoiDungContext.jsx";
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
// DanhSachBaiVietPage — MỘT component cho CẢ HAI mục:
//   /cau-chuyen  câu chuyện khách hàng
//   /tin-tuc     tin công ty
//
// VÌ SAO DÙNG CHUNG chứ không viết hai trang: hai mục giống hệt nhau, chỉ
// khác cái tên và câu dẫn. Hai file song song thì sớm muộn cũng có một bên
// được sửa mà bên kia quên — và cái quên đó không báo lỗi, chỉ là hai mục
// trên cùng một web bỗng trông khác nhau.
//
// VỀ CÁI TÊN "CÂU CHUYỆN": mục chuyện khách hàng cố ý KHÔNG gọi là "tin tức".
// Chữ "tin tức" ngầm hứa có bài mới thường xuyên; ba tháng không đăng là khách
// đọc thành "công ty này đang ảm đạm". Mục "Tin công ty" thì đúng là tin tức
// nên gọi thẳng như vậy.
//
// VỀ TRẠNG THÁI TRỐNG: chưa có bài nào thì KHÔNG hiện lưới rỗng mà hiện một
// câu tử tế kèm lối đi tiếp. Một mục mở ra thấy trắng trơn còn tệ hơn là chưa
// có mục nào.
// ============================================================
export default function DanhSachBaiVietPage({ loai = LOAI_CAU_CHUYEN }) {
  const congTy = useCongTy();
  const muc = LOAI[loai] ?? LOAI[LOAI_CAU_CHUYEN];
  const Icon = loai === LOAI_TIN_CONG_TY ? Newspaper : BookOpen;

  useDocumentTitle(`${muc.nhan} — ${congTy.name}`);

  const [baiViet, setBaiViet] = useState(null); // null = đang tải
  const [loi, setLoi] = useState("");

  useEffect(() => {
    let conHieuLuc = true;
    // Đổi mục là phải xoá danh sách cũ đi: không xoá thì trong lúc chờ máy chủ
    // trả lời, khách vẫn đang nhìn bài của mục vừa rời khỏi.
    setBaiViet(null);
    setLoi("");

    danhSachBaiViet(loai)
      .then((ds) => conHieuLuc && setBaiViet(Array.isArray(ds) ? ds : []))
      .catch((err) => {
        if (!conHieuLuc) return;
        setLoi(err.message);
        setBaiViet([]);
      });
    // Rời trang trước khi máy chủ trả lời thì đừng gọi setState nữa — React sẽ
    // kêu "cập nhật state của component đã gỡ", và lỗi đó không chỉ ra được
    // dòng nào gây ra.
    return () => {
      conHieuLuc = false;
    };
  }, [loai]);

  return (
    <section className="relative overflow-hidden py-28 lg:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl"
      />

      <Container rong="max-w-5xl" className="relative">
        <header className="mb-12 border-b border-line pb-8">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {muc.nhanNgan}
          </span>
          <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">
            {muc.nhan}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">
            {muc.moTa}
          </p>

          {/* Chuyển qua lại giữa hai mục ngay tại đây. Khách vào được trang này
              từ menu, nhưng đọc xong một bài thì quay lại danh sách chứ không
              quay lên menu — chỗ này là nơi họ đang đứng. */}
          <nav className="mt-6 flex flex-wrap gap-2" aria-label="Chọn mục">
            {[LOAI_CAU_CHUYEN, LOAI_TIN_CONG_TY].map((ma) => (
              <Link
                key={ma}
                to={LOAI[ma].duongDan}
                aria-current={ma === loai ? "page" : undefined}
                className={
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition " +
                  (ma === loai
                    ? "bg-brand text-tren-brand"
                    : "border border-line text-ink-soft hover:border-brand hover:text-brand")
                }
              >
                {LOAI[ma].nhan}
              </Link>
            ))}
          </nav>
        </header>

        {baiViet === null ? (
          <p className="flex items-center gap-2 py-16 text-sm text-ink-soft">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Đang tải bài viết…
          </p>
        ) : baiViet.length === 0 ? (
          <div className="rounded-2xl border border-line bg-paper/40 px-6 py-14 text-center">
            <p className="text-base font-semibold text-ink">
              {loai === LOAI_TIN_CONG_TY
                ? "Chưa có tin nào ở mục này."
                : "Chúng tôi đang viết những câu chuyện đầu tiên."}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
              {loi
                ? "Hiện chưa tải được danh sách bài viết. Bạn quay lại sau giúp mình nhé."
                : "Mời bạn quay lại sau ít hôm. Trong lúc chờ, xem thử các dự án đã bàn giao nhé."}
            </p>
            <Link
              to="/#projects"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
            >
              Xem dự án đã làm
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2">
            {baiViet.map((bai) => (
              <li key={bai.id}>
                <Link
                  to={duongDanBai(bai)}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-paper/40 transition hover:border-brand/40 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                >
                  <Anh
                    src={diaChiAnh(bai.anh_bia)}
                    alt=""
                    boc="aspect-[16/9] overflow-hidden bg-brand-soft"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />

                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <p className="text-xs font-medium uppercase tracking-widest text-ink-faint">
                      {ngayViet(bai.dang_luc)}
                      {bai.ten_khach ? ` · ${bai.ten_khach}` : ""}
                    </p>
                    <h2 className="text-lg font-bold leading-snug text-ink group-hover:text-brand">
                      {bai.tieu_de}
                    </h2>
                    {bai.tom_tat && (
                      <p className="text-sm leading-relaxed text-ink-soft">
                        {bai.tom_tat}
                      </p>
                    )}
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-sm font-semibold text-brand">
                      Đọc tiếp
                      <ArrowRight
                        className="h-4 w-4 transition group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
