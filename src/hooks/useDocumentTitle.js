import { useEffect } from "react";

// useDocumentTitle: đổi <title> của tab theo trang, trả lại tiêu đề cũ khi
// rời trang. Website là SPA (một trang index.html) nên phải tự đổi title —
// không có react-helmet, chỉ cần vài dòng này là đủ cho vài trang tĩnh.
export default function useDocumentTitle(title) {
  useEffect(() => {
    if (!title) return;
    const truoc = document.title;
    document.title = title;
    return () => {
      document.title = truoc;
    };
  }, [title]);
}
