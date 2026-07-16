import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import UiKitPage from "./pages/UiKitPage.jsx";

// App: khai báo router tổng.
// Layout chung (Navbar/Footer) sẽ được thêm ở Bước 2,
// ChatWidget toàn cục sẽ được thêm ở Bước 6.
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/* Style-guide nội bộ — duyệt design tokens & components */}
        <Route path="/ui-kit" element={<UiKitPage />} />
      </Routes>
    </BrowserRouter>
  );
}
