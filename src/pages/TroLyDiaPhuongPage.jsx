import { DauTrang, DoiTuong, GiaiPhap, QuyTrinh, ThucTrang } from "../sections/tro-ly/KhoiTroLy.jsx";
import DangKyDiaPhuong from "../sections/hoi-dap/DangKyDiaPhuong.jsx";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import pages from "../data/servicePages.json";

// Trang dịch vụ "Trợ lý AI địa phương" — đích "Tìm hiểu thêm" của thẻ cùng tên
// ở /ve-chung-toi. Nội dung: servicePages.json → "local-ai".
//
// 16/11/2026: dựng lại theo 4 ảnh mẫu công ty gửi (Thực trạng, Giải pháp,
// Đối tượng phục vụ, Quy trình 5 bước) bằng các khối riêng trong
// sections/tro-ly/, thay cho khuôn trang dịch vụ chung (ServiceHero,
// SolutionColumns…). Cuối trang dùng form "Đăng ký cho địa phương" (gửi về
// /api/dang-ky-dia-phuong) thay cho form liên hệ chung, vì người đọc trang này
// là đại diện địa phương.
const data = pages["local-ai"];

export default function TroLyDiaPhuongPage() {
  useDocumentTitle(data.meta.title);

  return (
    <>
      <DauTrang hero={data.hero} />
      <ThucTrang d={data.thucTrang} />
      <GiaiPhap d={data.giaiPhap} />
      <DoiTuong d={data.solutions} />
      <QuyTrinh d={data.process} />
      <DangKyDiaPhuong />
    </>
  );
}
