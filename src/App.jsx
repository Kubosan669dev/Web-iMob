import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MotionConfig } from "motion/react";
import Layout from "./components/layout/Layout.jsx";
import ScrollToTop from "./components/util/ScrollToTop.jsx";
import HomePage from "./pages/HomePage.jsx";
import { NoiDungProvider } from "./context/NoiDungContext.jsx";

// Các trang dịch vụ tách bundle bằng lazy() — khách vào trang chủ không tải
// kèm. Nội dung từng trang đọc từ data/servicePages.json.
const ZaloMiniAppPage = lazy(() => import("./pages/ZaloMiniAppPage.jsx"));
const SoftwareHardwarePage = lazy(() => import("./pages/SoftwareHardwarePage.jsx"));
const DigitalTransformationPage = lazy(() =>
  import("./pages/DigitalTransformationPage.jsx")
);

// Trang pháp lý (Chính sách bảo mật / Điều khoản dịch vụ) — cùng một component
// LegalPage, khác nhau ở prop slug. Nội dung đọc từ data/legalPages.json.
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
      </NoiDungProvider>
    </MotionConfig>
  );
}
