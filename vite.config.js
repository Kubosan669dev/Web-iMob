import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Cấu hình Vite: React + Tailwind CSS v4 (plugin chính thức, không cần postcss/tailwind.config.js)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Chuẩn bị sẵn cho backend AI Python (chạy ở cổng 8000):
      // mọi request tới /api/* trong lúc dev sẽ được chuyển tiếp tự động.
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
