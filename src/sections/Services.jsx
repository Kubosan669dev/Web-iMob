import { Link } from "react-router-dom";
import { Layers, Smartphone, Cpu, GraduationCap, Check, ChevronRight } from "lucide-react";
import Container from "../components/ui/Container.jsx";
import SectionTitle from "../components/ui/SectionTitle.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import services from "../data/services.json";

// Map chuỗi icon trong services.json → component lucide
// (JSON không chứa được component nên lưu dạng chuỗi)
const SERVICE_ICONS = {
  smartphone: Smartphone,
  cpu: Cpu,
  "graduation-cap": GraduationCap,
};

/* Thẻ dịch vụ kiểu Apple: bo góc lớn, nền xám nhạt, KHÔNG viền KHÔNG bóng.
   Liên kết cuối thẻ dùng dấu › thay cho mũi tên → và bỏ chữ IN HOA — đó là
   kiểu liên kết đặc trưng của apple.com, nhẹ hơn hẳn một cái nút.

   CỐ Ý KHÔNG đánh số 01/02/03 cho ba dịch vụ: đánh số ngụ ý có thứ tự phải đi
   qua, mà ba dịch vụ này song song, khách chọn cái nào cũng được. Số ở đó chỉ
   là trang trí giả vờ mang thông tin. (Khối Quy trình trên trang dịch vụ con
   thì có đánh số, vì đó mới thật sự là các bước nối tiếp nhau.) */
function TheDichVu({ service }) {
  const Icon = SERVICE_ICONS[service.icon] ?? Layers;

  return (
    <article className="flex h-full flex-col rounded-block bg-mist p-8 sm:p-9">
      <Icon className="h-9 w-9 text-brand" aria-hidden="true" />

      <h3 className="tieu-de-lon mt-6 text-2xl text-ink">{service.title}</h3>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">
        {service.description}
      </p>

      <ul className="mt-6 space-y-2.5">
        {service.features.map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2.5 text-[0.9375rem] text-ink-soft"
          >
            <Check className="mt-1 h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>

      {/* mt-auto ghim liên kết xuống đáy để ba thẻ cao bằng nhau vẫn thẳng hàng */}
      <Link
        to={service.route}
        className="group/link mt-auto inline-flex items-center pt-8 text-[1.0625rem] font-medium text-brand hover:underline"
      >
        Tìm hiểu thêm
        <ChevronRight
          className="h-5 w-5 transition-transform group-hover/link:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </article>
  );
}

export default function Services() {
  return (
    // Nền trắng — xen kẽ với dải nền xám của section Sản phẩm phía trên.
    <section id="services" className="border-t border-line py-24 lg:py-32">
      <Container className="space-y-14">
        <Reveal>
          <SectionTitle
            badge="Dịch vụ"
            title="Từ bài toán của bạn"
            highlight="đến hệ thống chạy thật."
            description="Ba nhóm giải pháp cốt lõi, thiết kế may đo theo quy mô và nghiệp vụ của từng đơn vị — không bán gói sẵn."
          />
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-3">
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
