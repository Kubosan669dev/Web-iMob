import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MotionConfig } from "motion/react";
import Layout from "./components/layout/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";

// Style-guide nội bộ: tách khỏi bundle chính bằng lazy() vì khách
// truy cập trang chủ không bao giờ cần tới nó.
const UiKitPage = lazy(() => import("./pages/UiKitPage.jsx"));

// App: khai báo router tổng.
//
// MotionConfig reducedMotion="user" — MỘT dòng, áp cho MỌI component motion
// trong site: ai bật "giảm chuyển động" trong cài đặt hệ điều hành thì các
// hiệu ứng trượt/phóng to tự tắt (chỉ còn fade), không phải sửa từng file.
// (Hiệu ứng CSS thuần — float, glow-pulse, ping — chặn riêng trong index.css.)
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            {/* Các trang chính dùng chung Layout (Navbar + Footer) */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
            </Route>

            {/* Style-guide nội bộ — không Navbar/Footer */}
            <Route path="/ui-kit" element={<UiKitPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </MotionConfig>
  );
}
