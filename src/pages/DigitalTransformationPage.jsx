import ServiceHero from "../components/service/ServiceHero.jsx";
import CardGrid from "../components/service/CardGrid.jsx";
import FeatureList from "../components/service/FeatureList.jsx";
import StatsBand from "../components/service/StatsBand.jsx";
import Contact from "../sections/Contact.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import pages from "../data/servicePages.json";

// Trang dịch vụ "Đào tạo Chuyển đổi số" (/digital-transformation).
const data = pages["digital-transformation"];

export default function DigitalTransformationPage() {
  useDocumentTitle(data.meta.title);

  return (
    <>
      <ServiceHero {...data.hero} />
      <CardGrid {...data.objectives} />
      <CardGrid {...data.audience} tinted />
      <FeatureList {...data.modules} />
      <CardGrid {...data.formats} />
      <StatsBand {...data.stats} />
      <Contact />
    </>
  );
}
