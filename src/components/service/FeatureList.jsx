import Card from "../ui/Card.jsx";
import Reveal from "../ui/Reveal.jsx";
import ServiceSection from "./ServiceSection.jsx";

// FeatureList: danh sách tính năng đánh số (01, 02...) — mỗi thẻ có số thứ
// tự lớn, tiêu đề và mô tả. Dùng cho "Tính năng vượt trội" (Zalo) và
// "Nội dung đào tạo" (Chuyển đổi số).
export default function FeatureList({
  badge,
  title,
  highlight,
  description,
  items = [],
}) {
  return (
    <ServiceSection
      badge={badge}
      title={title}
      highlight={highlight}
      description={description}
      tinted
    >
      <div className="grid gap-5 md:grid-cols-2">
        {items.map((item, index) => (
          <Reveal key={item.title} delay={(index % 2) * 0.1} className="h-full">
            <Card hover className="flex h-full items-start gap-5">
              <span className="shrink-0 font-mono text-2xl font-black text-gradient">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="mb-1.5 text-base font-bold text-white">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-gray-400">
                  {item.desc}
                </p>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </ServiceSection>
  );
}
