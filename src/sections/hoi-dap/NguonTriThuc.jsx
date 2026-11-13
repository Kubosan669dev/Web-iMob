import { BookOpenCheck, CheckCircle2, Landmark, RefreshCw, ShieldCheck, Store } from "lucide-react";
import Container from "../../components/ui/Container.jsx";

// ============================================================
// "Nguồn tri thức địa phương" — giải thích RAG bằng lời thường (giao diện chốt
// 13/11/2026), kèm dải "trả lời có nguồn" ở cuối.
//
// ĐÃ VIẾT LẠI CHỮ CỦA ẢNH MẪU cho khỏi hứa quá lời:
//   • "Sở Văn hoá & UBND", "Ban Quản lý Di tích kiểm chứng", "thẩm định pháp
//     lý": chưa có cơ quan nào xác nhận việc đó với iMob → nói chung là "tài
//     liệu do địa phương cung cấp".
//   • "Mật độ du khách thời điểm thực", "đồng bộ cảm biến": không có nguồn dữ
//     liệu nào như vậy → thay bằng việc thật làm được: địa phương tự sửa tài
//     liệu, trợ lý trả lời theo bản mới.
//   • "Zero-Hallucination", số công văn mẫu "CV-249/UBND-VHTT-2024": bỏ. AI nào
//     cũng có thể nhầm; số công văn bịa lại mang tên cơ quan nhà nước.
//
// "Trả lời kèm nguồn" là THẬT: đã thử khung chat trên imob.vn ngày 13/11/2026,
// câu trả lời có thẻ nguồn bấm xem được (lớp .imob-source-tag).
// ============================================================

const LOP = [
  {
    so: "01",
    icon: Landmark,
    mau: "bg-brand text-tren-brand",
    nhom: "Tài liệu chính thống",
    ten: "Hồ sơ di tích & thủ tục",
    moTa: "Hồ sơ di tích, quy định tham quan, thủ tục hành chính… do chính quyền và ban quản lý địa phương cung cấp.",
    chot: "Nguồn rõ ràng, ghi được xuất xứ",
  },
  {
    so: "02",
    icon: Store,
    mau: "bg-accent text-tren-brand",
    nhom: "Văn hoá & dịch vụ",
    ten: "Câu chuyện, lễ hội, đặc sản",
    moTa: "Câu chuyện di tích, lễ hội, ẩm thực, hộ kinh doanh và điểm dịch vụ, gắn với bản đồ số và tour 360° của địa phương.",
    chot: "Kết nối bản đồ số, tour 360°",
  },
  {
    so: "03",
    icon: RefreshCw,
    mau: "bg-ink-soft text-tren-brand",
    nhom: "Thông tin cập nhật",
    ten: "Giờ mở cửa, giá vé, lịch",
    moTa: "Địa phương tự cập nhật tài liệu trong trang quản trị, không cần lập trình. Trợ lý trả lời theo bản mới nhất.",
    chot: "Sửa tài liệu, trợ lý trả lời theo bản mới",
  },
];

export default function NguonTriThuc() {
  return (
    <section id="nguon-tri-thuc" className="bg-paper py-20 sm:py-24">
      <Container rong="max-w-6xl">
        <p className="inline-flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-accent">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Công nghệ hỏi đáp RAG
        </p>
        <h2 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight text-brand-deep sm:text-5xl">
          Nguồn tri thức địa phương tin cậy
          <br />
          <em className="text-accent">thay vì trí nhớ chung của AI</em>
        </h2>
        <p className="mt-5 max-w-2xl leading-relaxed text-ink-soft">
          AI thông thường trả lời theo những gì nó “nhớ” được trên mạng, nên dễ nói sai về một địa phương cụ thể.
          Trợ lý của iMob tìm trong kho tài liệu riêng của từng địa phương trước, rồi mới viết câu trả lời, từ ba
          lớp dữ liệu:
        </p>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {LOP.map(({ so, icon: Icon, mau, nhom, ten, moTa, chot }) => (
            <article key={so} className="flex flex-col rounded-2xl bg-mist p-7">
              <span className={"flex h-11 w-11 items-center justify-center rounded-lg " + mau}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="mt-6 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-faint">
                {so} · {nhom}
              </p>
              <h3 className="mt-2 font-display text-[1.375rem] font-semibold text-brand-deep">{ten}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">{moTa}</p>
              <p className="mt-6 inline-flex items-center gap-2 text-xs text-ink-soft">
                <CheckCircle2 className="h-4 w-4 text-brand" aria-hidden="true" />
                {chot}
              </p>
            </article>
          ))}
        </div>

        {/* ---------- Dải "trả lời có nguồn" ---------- */}
        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-line bg-panel p-5 sm:flex-row sm:items-center sm:p-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
            <BookOpenCheck className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-display text-xl font-semibold text-ink">Trả lời kèm nguồn tài liệu</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              Dưới mỗi câu trả lời có thẻ nguồn để bạn mở ra đối chiếu. AI vẫn có thể nhầm: với thông tin quan
              trọng như giá vé, giờ mở cửa, hãy xác nhận lại với địa phương.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
