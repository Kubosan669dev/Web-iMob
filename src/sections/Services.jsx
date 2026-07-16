import { Layers, Smartphone, Cpu, GraduationCap, Check, ArrowRight } from "lucide-react";
import Container from "../components/ui/Container.jsx";
import SectionTitle from "../components/ui/SectionTitle.jsx";
import Card from "../components/ui/Card.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import AnimatedGridBackground from "../components/ui/AnimatedGridBackground.jsx";
import services from "../data/services.json";

// Map chuỗi icon trong services.json → component lucide
// (JSON không chứa được component nên lưu dạng chuỗi)
const SERVICE_ICONS = {
  smartphone: Smartphone,
  cpu: Cpu,
  "graduation-cap": GraduationCap,
};

// Card một dịch vụ — flex-col + mt-auto để nút luôn ghim đáy, 3 card đều nhau
function ServiceCard({ service }) {
  const Icon = SERVICE_ICONS[service.icon] ?? Layers;

  return (
    <Card hover className="flex h-full flex-col">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-500/25 to-blue-500/25">
        <Icon className="h-7 w-7 text-cyan-300" aria-hidden="true" />
      </div>

      <h3 className="mb-3 text-xl font-bold text-white">{service.title}</h3>
      <p className="mb-5 text-sm leading-relaxed text-gray-400">
        {service.description}
      </p>

      <ul className="mb-6 space-y-2.5">
        {service.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-300">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-400" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>

      <a
        href="#contact"
        className="group/link mt-auto inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-cyan-300 transition-colors hover:text-white"
      >
        Tìm hiểu thêm
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1"
          aria-hidden="true"
        />
      </a>
    </Card>
  );
}

export default function Services() {
  return (
    <section id="services" className="relative overflow-hidden py-24 lg:py-32">
      {/* Dùng lại nền grid của Hero nhưng dịu hơn (opacity thấp, không particles) */}
      <AnimatedGridBackground particles={false} className="opacity-60" />

      <Container className="relative space-y-14">
        <Reveal>
          <SectionTitle
            badge="Dịch vụ của chúng tôi"
            icon={Layers}
            title="COMPREHENSIVE"
            highlight="SOLUTIONS"
            description="Ba nhóm giải pháp cốt lõi — thiết kế may đo theo bài toán của bạn, triển khai nhanh và đồng hành dài hạn."
          />
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <Reveal key={service.id} delay={index * 0.12} className="h-full">
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
