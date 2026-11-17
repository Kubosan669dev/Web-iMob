import { Link } from "react-router-dom";
import { Layers, Smartphone, Cpu, GraduationCap, Bot, Check, ChevronRight } from "lucide-react";
import Container from "../components/ui/Container.jsx";
import SectionTitle from "../components/ui/SectionTitle.jsx";
import Reveal from "../components/ui/Reveal.jsx";
// services.json dùng chung cho thẻ ở đây và lựa chọn dịch vụ trong form liên hệ.
import services from "../data/services.json";

// Map chuỗi icon trong services.json → component lucide
// (JSON không chứa được component nên lưu dạng chuỗi)
const SERVICE_ICONS = {
  smartphone: Smartphone,
  cpu: Cpu,
  "graduation-cap": GraduationCap,
  bot: Bot,
};

/* 17/11/2026: thẻ trắng viền mảnh trên nền kem, tiêu đề chữ có chân —
   cùng kiểu khối "Giải pháp AI của iMob" ở trang Trợ lý AI địa phương.

   Trước đó (kiểu Apple): bo góc lớn, nền xám nhạt, không viền không bóng.
   Liên kết cuối thẻ dùng dấu › thay cho mũi tên → và bỏ chữ IN HOA — đó là
   kiểu liên kết đặc trưng của apple.com, nhẹ hơn hẳn một cái nút.

   CỐ Ý KHÔNG đánh số các dịch vụ: đánh số ngụ ý có thứ tự phải đi qua, mà các
   dịch vụ này song song, khách chọn cái nào cũng được. Số ở đó chỉ là trang trí
   giả vờ mang thông tin. (Khối Quy trình trên trang dịch vụ con
   thì có đánh số, vì đó mới thật sự là các bước nối tiếp nhau.) */
function TheDichVu({ service }) {
  const Icon = SERVICE_ICONS[service.icon] ?? Layers;

  return (
    <article className="flex h-full flex-col rounded-xl border border-line bg-panel p-7">
      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mist text-ink">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>

      <h3 className="mt-6 font-display text-xl font-semibold leading-snug text-ink">{service.title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        {service.description}
      </p>

      <ul className="mt-6 space-y-2.5">
        {service.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-soft"
          >
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>

      {/* mt-auto ghim liên kết xuống đáy để các thẻ cao bằng nhau vẫn thẳng hàng */}
      <Link
        to={service.route}
        className="group/link mt-auto inline-flex items-center gap-1 border-t border-line pt-4 text-[0.8125rem] font-medium text-ink hover:text-brand"
      >
        Tìm hiểu thêm
        <ChevronRight
          className="h-4 w-4 transition-transform group-hover/link:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </article>
  );
}

export default function Services() {
  return (
    // Nền trắng — xen kẽ với dải nền xám của section Sản phẩm phía trên.
    <section id="services" className="border-t border-line bg-paper py-24 lg:py-28">
      <Container className="space-y-14">
        <Reveal>
          <SectionTitle
            badge="Dịch vụ"
            title="Từ bài toán của bạn"
            highlight="đến hệ thống chạy thật."
            description="Bốn nhóm giải pháp cốt lõi, thiết kế may đo theo quy mô và nghiệp vụ của từng đơn vị — không bán gói sẵn."
          />
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service, index) => (
            <Reveal key={service.id} delay={index * 0.1} className="h-full">
              <TheDichVu service={service} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
