import ServiceHero from "../components/service/ServiceHero.jsx";
import SolutionColumns from "../components/service/SolutionColumns.jsx";
import FeatureList from "../components/service/FeatureList.jsx";
import CardGrid from "../components/service/CardGrid.jsx";
import ProcessSteps from "../components/service/ProcessSteps.jsx";
import DaiKhachHang from "../components/service/DaiKhachHang.jsx";
import Contact from "../sections/Contact.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import pages from "../data/servicePages.json";

// Trang dịch vụ "Ứng dụng robot theo yêu cầu" (/robot).
//
// Vì sao trang này ra đời (21/08/2026): mục thứ 4 trong bảy mục ở trang chủ —
// "Ứng dụng các loại robot tuần tra/lễ tân, UAV, Drone theo yêu cầu" — là mục
// DUY NHẤT chưa có chỗ để đi tới. Bấm vào nó chỉ nhảy xuống form liên hệ, tức
// là bắt khách để lại số điện thoại trước khi được biết bên mình làm được gì.
// Nay công ty đã gửi hồ sơ kỹ thuật hai loại robot nên dựng được trang thật.
//
// ⚠️ UAV/DRONE CHƯA CÓ TRÊN TRANG NÀY và đó là cố ý: bốn tài liệu công ty gửi
// không có tài liệu nào về thiết bị bay. Viết thêm vào thì phải bịa thông số.
// Có tài liệu thì thêm một khối nữa vào servicePages.json là xong, không phải
// sửa file này.
//
// Nội dung đọc từ data/servicePages.json — component chỉ ghép khối theo thứ tự.
const data = pages["robot"];

export default function RobotPage() {
  useDocumentTitle(data.meta.title);

  return (
    <>
      <ServiceHero {...data.hero} />
      <SolutionColumns {...data.loai} />
      {/* FeatureList luôn có nền xám nhạt, CardGrid dưới nó để nền trắng —
          hai khối liền nhau khác nền thì mắt tự tách được, không cần kẻ ngang.
          Đổi thứ tự thì nhớ kiểm lại nhịp nền này. */}
      <FeatureList {...data.letan} />
      <CardGrid {...data.tuantra} />
      <SolutionColumns {...data.dieuKien} />
      <ProcessSteps {...data.process} />
      <DaiKhachHang />
      <Contact />
    </>
  );
}
