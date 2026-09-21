import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Loader2, MessageCircle, ArrowRight } from "lucide-react";
import Container from "../components/ui/Container.jsx";
import Anh from "../components/ui/Anh.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import { useCongTy } from "../context/NoiDungContext.jsx";
import { diaChiAnh } from "../utils/anh.js";
import { docBaiViet, tachDoan, ngayViet } from "../services/baiVietService.js";

// ============================================================
// BaiVietPage — trang đọc một câu chuyện.
//
// BA TRẠNG THÁI, và cả ba đều phải vẽ được: đang tải, không tìm thấy, và có
// bài. Thiếu trạng thái "không tìm thấy" thì gõ sai một chữ trong đường dẫn sẽ
// ra màn hình trắng vĩnh viễn — không báo lỗi, không lối quay lại.
//
// CUỐI BÀI LUÔN CÓ MỘT VIỆC CỤ THỂ để làm tiếp (hỏi chatbot hoặc liên hệ).
// Bài hay mà hết bài không có lối đi tiếp thì người đọc đóng tab, và công viết
// coi như bỏ.
// ============================================================
export default function BaiVietPage() {
  const { duongDan } = useParams();
  const congTy = useCongTy();

  const [bai, setBai] = useState(null);
  const [trangThai, setTrangThai] = useState("dang-tai"); // dang-tai | xong | khong-thay

  useDocumentTitle(bai ? `${bai.tieu_de} — ${congTy.name}` : congTy.name);

  useEffect(() => {
    let conHieuLuc = true;
    setTrangThai("dang-tai");
    docBaiViet(duongDan)
      .then((kq) => {
        if (!conHieuLuc) return;
        setBai(kq);
        setTrangThai("xong");
      })
      .catch(() => {
        // Gộp mọi lỗi thành "không tìm thấy": với người đọc thì bài chưa đăng,
        // đường dẫn gõ sai và máy chủ trục trặc đều dẫn tới cùng một việc phải
        // làm — quay lại danh sách. Phân biệt ba câu chỉ làm rối.
        if (!conHieuLuc) return;
        setTrangThai("khong-thay");
      });
    return () => {
      conHieuLuc = false;
    };
  }, [duongDan]);

  const doan = tachDoan(bai?.noi_dung);

  return (
    <section className="relative overflow-hidden py-28 lg:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl"
      />

      <Container rong="max-w-3xl" className="relative">
        <Link
          to="/cau-chuyen"
          className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-ink-soft transition hover:text-brand"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Tất cả câu chuyện
        </Link>

        {trangThai === "dang-tai" ? (
          <p className="flex items-center gap-2 py-16 text-sm text-ink-soft">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Đang tải…
          </p>
        ) : trangThai === "khong-thay" ? (
          <div className="rounded-2xl border border-line bg-paper/40 px-6 py-14 text-center">
            <p className="text-base font-semibold text-ink">
              Không tìm thấy câu chuyện này.
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              Có thể đường dẫn đã đổi, hoặc bài chưa được đăng.
            </p>
            <Link
              to="/cau-chuyen"
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
            >
              Xem các câu chuyện khác
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <article>
            <header className="mb-8 border-b border-line pb-8">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-ink-faint">
                {ngayViet(bai.dang_luc)}
                {bai.ten_khach ? ` · ${bai.ten_khach}` : ""}
              </p>
              <h1 className="text-3xl font-black leading-tight tracking-tight text-ink sm:text-4xl">
                {bai.tieu_de}
              </h1>
              {bai.tom_tat && (
                <p className="mt-4 text-base leading-relaxed text-ink-soft">
                  {bai.tom_tat}
                </p>
              )}
            </header>

            <Anh
              src={diaChiAnh(bai.anh_bia)}
              alt={bai.tieu_de}
              boc="mb-10 overflow-hidden rounded-2xl border border-line bg-brand-soft"
              className="w-full object-cover"
            />

            {/* Mỗi đoạn một thẻ <p>. React tự thoát ký tự đặc biệt nên nội dung
                người dùng gõ không bao giờ chạy được như mã. */}
            <div className="space-y-5">
              {doan.map((d, i) => (
                <p key={i} className="text-base leading-relaxed text-ink-soft">
                  {d}
                </p>
              ))}
            </div>

            {/* ---------- Việc để làm tiếp ---------- */}
            <div className="mt-14 rounded-2xl border border-brand/25 bg-brand-soft px-6 py-7">
              <p className="text-base font-bold text-ink">
                Bạn đang có bài toán tương tự?
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                Hỏi trợ lý ảo ở góc màn hình, hoặc để lại thông tin — {congTy.name}{" "}
                sẽ liên hệ lại.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-4">
                <Link
                  to="/#contact"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-tren-brand transition hover:opacity-90"
                >
                  Nhận tư vấn
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <span className="inline-flex items-center gap-1.5 text-sm text-ink-soft">
                  <MessageCircle className="h-4 w-4 text-brand" aria-hidden="true" />
                  Trợ lý ảo ở góc phải màn hình
                </span>
              </div>
            </div>
          </article>
        )}
      </Container>
    </section>
  );
}
