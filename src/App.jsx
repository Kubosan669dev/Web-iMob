import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import UiKitPage from "./pages/UiKitPage.jsx";

// App: khai báo router tổng.
// ChatWidget toàn cục sẽ được thêm vào Layout ở Bước 6.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Các trang chính dùng chung Layout (Navbar + Footer) */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* Style-guide nội bộ — không Navbar/Footer */}
        <Route path="/ui-kit" element={<UiKitPage />} />
      </Routes>
    </BrowserRouter>
  );
}
