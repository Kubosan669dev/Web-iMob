import ServiceHero from "../components/service/ServiceHero.jsx";
import SolutionColumns from "../components/service/SolutionColumns.jsx";
import FeatureList from "../components/service/FeatureList.jsx";
import ProcessSteps from "../components/service/ProcessSteps.jsx";
import Contact from "../sections/Contact.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import pages from "../data/servicePages.json";

// Trang dùng chung các khối dịch vụ; nội dung riêng được cấu hình trong servicePages.json.
const data = pages["local-ai"];

export default function TroLyDiaPhuongPage() {
  useDocumentTitle(data.meta.title);

  return (
    <>
      <ServiceHero {...data.hero} />
      <SolutionColumns {...data.solutions} />
      <FeatureList {...data.features} />
      <ProcessSteps {...data.process} />
      <Contact />
    </>
  );
}
