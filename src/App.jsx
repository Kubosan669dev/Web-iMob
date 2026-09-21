import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MotionConfig } from "motion/react";
import Layout from "./components/layout/Layout.jsx";
import ScrollToTop from "./components/util/ScrollToTop.jsx";
import HomePage from "./pages/HomePage.jsx";
import { NoiDungProvider } from "./context/NoiDungContext.jsx";
import { BangMauProvider } from "./context/BangMauContext.jsx";
import { TaiKhoanProvider } from "./context/TaiKhoanContext.jsx";

// Các trang dịch vụ tách bundle bằng lazy() — khách vào trang chủ không tải
// kèm. Nội dung từng trang đọc từ data/servicePages.json.
const ZaloMiniAppPage = lazy(() => import("./pages/ZaloMiniAppPage.jsx"));
const SoftwareHardwarePage = lazy(
  () => import("./pages/SoftwareHardwarePage.jsx"),
);
const DigitalTransformationPage = lazy(
  () => import("./pages/DigitalTransformationPage.jsx"),
);
// Hai trang thêm 21/08/2026 từ tài liệu công ty gửi. /robot là đích thật cho
// mục thứ 4 trong bảy mục ở trang chủ — trước đó mục đó chỉ dẫn về form liên
// hệ vì chưa có trang nào để đi tới.
const RobotPage = lazy(() => import("./pages/RobotPage.jsx"));
const Vr360Page = lazy(() => import("./pages/Vr360Page.jsx"));

// Bài viết: hai mục "Câu chuyện khách hàng" và "Tin công ty" dùng CHUNG một
// component danh sách, khác nhau ở prop `loai`. Nội dung nằm trong bảng
// bai_viet, soạn ở /admin. Cùng lazy() — khách vào trang chủ không tải kèm.
const DanhSachBaiVietPage = lazy(() => import("./pages/DanhSachBaiVietPage.jsx"));
const BaiVietPage = lazy(() => import("./pages/BaiVietPage.jsx"));

// Trang pháp lý (Chính sách bảo mật / Điều khoản dịch vụ) — cùng một component
// LegalPage, khác nhau ở prop slug. Nội dung đọc từ data/legalPages.json.
// Tài khoản thành viên (21/09/2026): đăng ký, đăng nhập, hồ sơ. Cùng lazy()
// — phần lớn khách vào xem website không bao giờ mở tới ba trang này.
const DangNhapPage = lazy(() => import("./pages/DangNhapPage.jsx"));
const DangKyPage = lazy(() => import("./pages/DangKyPage.jsx"));
const TaiKhoanPage = lazy(() => import("./pages/TaiKhoanPage.jsx"));

const LegalPage = lazy(() => import("./pages/LegalPage.jsx"));

// Style-guide nội bộ: tách khỏi bundle chính bằng lazy() vì khách
// truy cập trang chủ không bao giờ cần tới nó.
const UiKitPage = lazy(() => import("./pages/UiKitPage.jsx"));

// Trang quản trị nội dung. Cũng lazy() — khách vào xem website không bao giờ
// cần tới, và bundle của nó khá nặng (nhiều form). Không có trong menu;
// public/robots.txt chặn Google lập chỉ mục đường dẫn này.
const AdminPage = lazy(() => import("./pages/AdminPage.jsx"));

// App: khai báo router tổng.
//
// MotionConfig reducedMotion="user" — MỘT dòng, áp cho MỌI component motion
// trong site: ai bật "giảm chuyển động" trong cài đặt hệ điều hành thì các
// hiệu ứng trượt/phóng to tự tắt (chỉ còn fade), không phải sửa từng file.
// (Hiệu ứng CSS thuần — float, drift — chặn riêng trong index.css.)
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      {/* NoiDungProvider bọc NGOÀI router: nội dung (thông tin công ty, trang
          pháp lý) chỉ tải một lần cho cả site, chuyển trang không tải lại. */}
      <NoiDungProvider>
        {/* BangMauProvider nằm TRONG NoiDungProvider vì nó đọc bảng màu chính
            thức từ nội dung, và nằm NGOÀI router vì màu áp cho cả site — kể cả
            trang /admin, để không phải nhớ hai bộ màu. */}
        <BangMauProvider>
          {/* TaiKhoanProvider bọc NGOÀI router vì thanh menu (luôn hiện) và
              trang /tai-khoan phải nhìn cùng một sự thật về "ai đang đăng
              nhập". Để mỗi nơi tự đọc trình duyệt thì bấm Đăng xuất xong,
              thanh menu vẫn hiện tên cho tới lúc tải lại trang. */}
          <TaiKhoanProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={null}>
              <Routes>
                {/* Các trang chính dùng chung Layout (Navbar + Footer) */}
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/zalo-miniapp" element={<ZaloMiniAppPage />} />
                  <Route
                    path="/software-hardware"
                    element={<SoftwareHardwarePage />}
                  />
                  <Route
                    path="/digital-transformation"
                    element={<DigitalTransformationPage />}
                  />
                  <Route path="/robot" element={<RobotPage />} />
                  <Route path="/vr360" element={<Vr360Page />} />
                  {/* Chuỗi "cau_chuyen"/"tin_cong_ty" viết thẳng ở đây thay
                      vì import hằng số từ services/baiVietService.js: import
                      sẽ kéo cả module dịch vụ vào bundle chính, trong khi hai
                      trang kia đang cố ý tách ra bằng lazy(). */}
                  <Route
                    path="/cau-chuyen"
                    element={<DanhSachBaiVietPage loai="cau_chuyen" />}
                  />
                  <Route
                    path="/cau-chuyen/:duongDan"
                    element={<BaiVietPage mucMacDinh="cau_chuyen" />}
                  />
                  <Route
                    path="/tin-tuc"
                    element={<DanhSachBaiVietPage loai="tin_cong_ty" />}
                  />
                  <Route
                    path="/tin-tuc/:duongDan"
                    element={<BaiVietPage mucMacDinh="tin_cong_ty" />}
                  />
                  <Route path="/dang-nhap" element={<DangNhapPage />} />
                  <Route path="/dang-ky" element={<DangKyPage />} />
                  <Route path="/tai-khoan" element={<TaiKhoanPage />} />
                  <Route
                    path="/privacy-policy"
                    element={<LegalPage slug="privacy-policy" />}
                  />
                  <Route
                    path="/terms-of-service"
                    element={<LegalPage slug="terms-of-service" />}
                  />
                </Route>

                {/* Style-guide nội bộ — không Navbar/Footer */}
                <Route path="/ui-kit" element={<UiKitPage />} />

                {/* Trang quản trị nội dung — không Navbar/Footer, không có trong menu */}
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          </TaiKhoanProvider>
        </BangMauProvider>
      </NoiDungProvider>
    </MotionConfig>
  );
}
