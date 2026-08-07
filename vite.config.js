import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Cấu hình Vite: React + Tailwind CSS v4 (plugin chính thức, không cần postcss/tailwind.config.js)
//
// Không còn mục `server.proxy`: dự án từng chuyển tiếp /api/* sang backend
// Python ở cổng 8000, nhưng chatbot giờ chạy hẳn trong trình duyệt nên không
// gọi API nào cả. Khi nào form Liên hệ cần backend thật thì thêm proxy lại.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
