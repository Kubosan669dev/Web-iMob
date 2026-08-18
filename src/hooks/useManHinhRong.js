import { useEffect, useState } from "react";

/**
 * Màn hình có rộng tối thiểu `min` pixel không? Theo dõi liên tục nên xoay máy
 * hay kéo cửa sổ là cập nhật ngay.
 *
 * VÌ SAO KHÔNG DÙNG CLASS `hidden lg:block`: ẩn bằng CSS thì component VẪN
 * được gắn, vẫn chạy effect, vẫn tải thư viện của riêng nó. Với mã QR thì đó
 * là tải cả thư viện qrcode về máy của đúng nhóm người không dùng được nó —
 * không ai quét được mã QR trên màn hình của chính máy mình.
 *
 * Trước đây hook này nằm riêng trong Projects.jsx. Tách ra khi khung hình đầu
 * cũng cần đúng phép thử đó, để hai chỗ không lệch nhau về mốc bề ngang.
 */
export default function useManHinhRong(min = 1024) {
  const cauTruyVan = `(min-width: ${min}px)`;

  const [rong, setRong] = useState(
    () => typeof window !== "undefined" && window.matchMedia(cauTruyVan).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(cauTruyVan);
    setRong(mq.matches); // mốc đổi giữa chừng thì đồng bộ lại ngay
    const doi = (e) => setRong(e.matches);
    mq.addEventListener("change", doi);
    return () => mq.removeEventListener("change", doi);
  }, [cauTruyVan]);

  return rong;
}
