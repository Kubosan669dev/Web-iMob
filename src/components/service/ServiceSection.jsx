import Container from "../ui/Container.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import Reveal from "../ui/Reveal.jsx";

// ServiceSection: khung chung cho mọi khối trong trang dịch vụ — tiêu đề
// chuẩn (SectionTitle) + khoảng cách dọc + Container. Các khối nội dung
// (FeatureList, CardGrid, ProcessSteps...) chỉ lo phần thân, truyền vào children.
//   tinted=true → nền hơi tối hơn để xen kẽ nhịp giữa các section liền nhau.
export default function ServiceSection({
  badge,
  icon,
  title,
  highlight,
  description,
  tinted = false,
  children,
}) {
  return (
    <section
      className={
        "relative overflow-hidden py-20 lg:py-28 " +
        (tinted ? "bg-white/[0.015]" : "")
      }
    >
      <Container className="relative space-y-12">
        <Reveal>
          <SectionTitle
            badge={badge}
            icon={icon}
            title={title}
            highlight={highlight}
            description={description}
          />
        </Reveal>
        {children}
      </Container>
    </section>
  );
}
