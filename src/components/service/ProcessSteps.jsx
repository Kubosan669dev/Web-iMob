import Reveal from "../ui/Reveal.jsx";
import ServiceSection from "./ServiceSection.jsx";

// ProcessSteps: các bước triển khai đánh số 01..05, nối bằng một đường dọc.
// QUY ƯỚC BẤT BIẾN: mô tả bước KHÔNG ghi mốc thời gian cụ thể (vd "2-4 tuần")
// — tiến độ luôn tuỳ quy mô dự án, cùng kỷ luật với kienThuc.json / guard cũ.
export default function ProcessSteps({
  badge,
  title,
  highlight,
  description,
  steps = [],
}) {
  return (
    <ServiceSection
      badge={badge}
      title={title}
      highlight={highlight}
      description={description}
    >
      <div className="relative mx-auto max-w-3xl">
        {/* Đường dọc nối các bước (ẩn ở mốc cuối nhờ last:hidden trên item) */}
        <ol className="space-y-6">
          {steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.08}>
              <li className="flex gap-5">
                {/* Cột số + đường nối */}
                <div className="flex flex-col items-center">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-soft font-mono text-sm font-black text-brand">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {index < steps.length - 1 && (
                    <span className="mt-2 w-px flex-1 bg-brand/30" />
                  )}
                </div>
                {/* Nội dung bước */}
                <div className="pb-2 pt-1.5">
                  <h3 className="text-base font-bold text-ink">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    {step.desc}
                  </p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </ServiceSection>
  );
}
