import { Check } from "lucide-react";
import Card from "../ui/Card.jsx";
import Reveal from "../ui/Reveal.jsx";
import ServiceSection from "./ServiceSection.jsx";
import { iconOf } from "./icons.js";

// SolutionColumns: vài cột, mỗi cột là một danh mục (icon + tiêu đề + list
// gạch đầu dòng có dấu check). Dùng cho "3 nhóm ứng dụng" của Zalo Mini App
// và "phần mềm / phần cứng / lợi ích" của trang Software & Hardware.
export default function SolutionColumns({
  badge,
  title,
  highlight,
  description,
  columns = [],
}) {
  return (
    <ServiceSection
      badge={badge}
      title={title}
      highlight={highlight}
      description={description}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {columns.map((col, index) => {
          const Icon = iconOf(col.icon);
          return (
            <Reveal key={col.title} delay={index * 0.1} className="h-full">
              <Card hover className="flex h-full flex-col">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-500/25 to-blue-500/25">
                  <Icon className="h-7 w-7 text-cyan-300" aria-hidden="true" />
                </div>
                <h3 className="mb-4 text-lg font-bold text-white">{col.title}</h3>
                <ul className="space-y-2.5">
                  {col.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-gray-300"
                    >
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-green-400"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </ServiceSection>
  );
}
