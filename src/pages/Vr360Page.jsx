import ServiceHero from "../components/service/ServiceHero.jsx";
import FeatureList from "../components/service/FeatureList.jsx";
import CardGrid from "../components/service/CardGrid.jsx";
import SolutionColumns from "../components/service/SolutionColumns.jsx";
import ProcessSteps from "../components/service/ProcessSteps.jsx";
import DaiKhachHang from "../components/service/DaiKhachHang.jsx";
import Contact from "../sections/Contact.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import pages from "../data/servicePages.json";

// Trang dịch vụ "Thực tế ảo 360° & số hoá di tích" (/vr360).
//
// Vì sao trang này ra đời (21/08/2026): đây là một mảng dịch vụ công ty ĐANG
// CHÀO BÁN — có báo giá do giám đốc ký — mà cả website lẫn chatbot đều không
// nhắc một chữ nào. Khách vào trang không có cách nào biết iMob làm được việc
// này, trừ khi tự hỏi.
//
// ⚠️ KHÔNG CÓ GIÁ TRÊN TRANG NÀY. Tài liệu nguồn là báo giá gửi RIÊNG cho một
// khách; đơn giá từng hạng mục và tổng hợp đồng là thông tin thương mại. Cũng
// không hứa mốc thời gian: "45 ngày" trong báo giá là của đúng gói 11 điểm ấy,
// gói khác số điểm khác thì con số đó sai.
//
// Nội dung đọc từ data/servicePages.json — component chỉ ghép khối theo thứ tự.
const data = pages["vr360"];

export default function Vr360Page() {
  useDocumentTitle(data.meta.title);

  return (
    <>
      <ServiceHero {...data.hero} />
      <FeatureList {...data.goiGom} />
      <CardGrid {...data.loiIch} />
      <SolutionColumns {...data.banDoSo} />
      <ProcessSteps {...data.process} />
      <DaiKhachHang />
      <Contact />
    </>
  );
}
