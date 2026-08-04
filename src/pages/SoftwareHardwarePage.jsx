import ServiceHero from "../components/service/ServiceHero.jsx";
import SolutionColumns from "../components/service/SolutionColumns.jsx";
import CardGrid from "../components/service/CardGrid.jsx";
import ProcessSteps from "../components/service/ProcessSteps.jsx";
import StatsBand from "../components/service/StatsBand.jsx";
import Contact from "../sections/Contact.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import pages from "../data/servicePages.json";

// Trang dịch vụ "Giải pháp Phần mềm & Phần cứng" (/software-hardware).
const data = pages["software-hardware"];

export default function SoftwareHardwarePage() {
  useDocumentTitle(data.meta.title);

  return (
    <>
      <ServiceHero {...data.hero} />
      <SolutionColumns {...data.solutions} />
      <CardGrid {...data.benefits} />
      <CardGrid {...data.industries} tinted />
      <ProcessSteps {...data.process} />
      <StatsBand {...data.stats} />
      <Contact />
    </>
  );
}
