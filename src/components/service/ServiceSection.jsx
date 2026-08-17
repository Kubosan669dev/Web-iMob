import Container from "../ui/Container.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";
import Reveal from "../ui/Reveal.jsx";

// ServiceSection: khung chung cho mọi khối trong trang dịch vụ — tiêu đề
// chuẩn (SectionTitle) + khoảng cách dọc + Container. Các khối nội dung
// (FeatureList, CardGrid, ProcessSteps...) chỉ lo phần thân, truyền vào children.
//   tinted=true → nền sương (thay vì nền giấy) để xen kẽ nhịp giữa các
//   section liền nhau — cách phân tách của bản giao diện sáng, không dùng
//   đường kẻ ngang.
export default function ServiceSection({
  badge,
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
        (tinted ? "bg-mist" : "")
      }
    >
      <Container className="relative space-y-12">
        <Reveal>
          <SectionTitle
            badge={badge}
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
