import { Check } from "lucide-react";
import Card from "../ui/Card.jsx";
import Reveal from "../ui/Reveal.jsx";
import ServiceSection from "./ServiceSection.jsx";
import { iconOf } from "./icons.js";

// Số cột theo cấu hình data → class grid tương ứng (Tailwind cần class tĩnh,
// không ghép chuỗi động được nên map sẵn).
const COLS_CLASS = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

// CardGrid: lưới thẻ icon + tiêu đề + mô tả, kèm danh sách gạch đầu dòng
// (items) tuỳ chọn. Một component lo nhiều khối: lợi thế, ưu điểm, giải pháp
// theo ngành, mục tiêu, đối tượng, hình thức triển khai.
export default function CardGrid({
  badge,
  title,
  highlight,
  description,
  columns = 3,
  cards = [],
  tinted = false,
}) {
  return (
    <ServiceSection
      badge={badge}
      title={title}
      highlight={highlight}
      description={description}
      tinted={tinted}
    >
      <div className={`grid gap-6 ${COLS_CLASS[columns] ?? COLS_CLASS[3]}`}>
        {cards.map((card, index) => {
          const Icon = iconOf(card.icon);
          return (
            <Reveal key={card.title} delay={(index % 3) * 0.1} className="h-full">
              <Card
                hover
                className={
                  "flex h-full flex-col " + (tinted ? "bg-panel" : "")
                }
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft">
                  <Icon className="h-6 w-6 text-brand" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-base font-bold text-ink">
                  {card.title}
                </h3>
                {card.desc && (
                  <p className="text-sm leading-relaxed text-ink-soft">
                    {card.desc}
                  </p>
                )}
                {card.items && (
                  <ul className="mt-4 space-y-2">
                    {card.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-ink-soft"
                      >
                        <Check
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand"
                          aria-hidden="true"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </Reveal>
          );
        })}
      </div>
    </ServiceSection>
  );
}
