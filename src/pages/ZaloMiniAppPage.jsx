import ServiceHero from "../components/service/ServiceHero.jsx";
import SolutionColumns from "../components/service/SolutionColumns.jsx";
import FeatureList from "../components/service/FeatureList.jsx";
import CardGrid from "../components/service/CardGrid.jsx";
import ProcessSteps from "../components/service/ProcessSteps.jsx";
import StatsBand from "../components/service/StatsBand.jsx";
import Contact from "../sections/Contact.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import pages from "../data/servicePages.json";

// Trang dịch vụ "Phát triển Zalo Mini App" (/zalo-miniapp).
// Nội dung đọc từ data/servicePages.json → chỉ ghép các khối theo thứ tự,
// không viết nội dung cứng trong component (một nguồn dữ liệu duy nhất).
const data = pages["zalo-miniapp"];

export default function ZaloMiniAppPage() {
  useDocumentTitle(data.meta.title);

  return (
    <>
      <ServiceHero {...data.hero} />
      <SolutionColumns {...data.solutions} />
      <FeatureList {...data.features} />
      <CardGrid {...data.benefits} />
      <ProcessSteps {...data.process} />
      <StatsBand {...data.stats} />
      <Contact />
    </>
  );
}
