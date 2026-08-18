import { createContext, useContext, useEffect, useState } from "react";
import companyMacDinh from "../data/company.json";
import legalPagesMacDinh from "../data/legalPages.json";
import heroMacDinh from "../data/hero.json";
import aboutMacDinh from "../data/about.json";
import giaoDienMacDinh from "../data/giaoDien.json";
import { API_BASE_URL } from "../utils/constants.js";

// ============================================================
// NoiDungContext — nguồn nội dung cho cả website.
//
// NGUYÊN TẮC QUAN TRỌNG NHẤT: website KHÔNG ĐƯỢC CHẾT THEO DATABASE.
//
// Cách làm là "phủ lớp":
//   1. Khởi tạo bằng file JSON đóng gói sẵn trong bundle  -> hiện NGAY, luôn có
//   2. Chạy nền: gọi GET /api/noi-dung
//   3. Gọi được  -> thay bằng nội dung trong database (thứ bạn sửa ở /admin)
//      Gọi hỏng  -> im lặng giữ nguyên bản mặc định, khách không thấy lỗi gì
//
// Vì sao không lấy 100% từ API: backend gói free trên Render NGỦ sau 15 phút
// không ai dùng. Nếu website phụ thuộc hẳn vào API thì mỗi lần backend ngủ,
// khách vào sẽ thấy trang trống 30-50 giây. Cách phủ lớp giữ nguyên được tính
// chất "website chạy độc lập" vốn có, và Google vẫn đọc được nội dung thật
// trong bundle (tốt cho SEO).
//
// Đánh đổi: sửa trong /admin xong, khách đang mở sẵn trang phải tải lại mới
// thấy. Chấp nhận được với website giới thiệu.
// ============================================================

const NoiDungContext = createContext(null);

// Nội dung mặc định = đúng các file JSON mà trước đây từng component import
// trực tiếp. Giữ nguyên hình dạng để component không phải sửa cách đọc.
const MAC_DINH = {
  company: companyMacDinh,
  legalPages: legalPagesMacDinh,
  hero: heroMacDinh,
  about: aboutMacDinh,
  giaoDien: giaoDienMacDinh,
};

// Không để khách chờ lâu vì nội dung: quá hạn này thì dùng bản mặc định.
// Backend đang ngủ có thể mất 30-50s — ta KHÔNG chờ lâu như vậy, cứ hiện nội
// dung mặc định trước, lần vào sau (backend đã thức) sẽ có bản mới nhất.
const HET_GIO_MS = 6000;

export function NoiDungProvider({ children }) {
  const [noiDung, setNoiDung] = useState(MAC_DINH);

  useEffect(() => {
    // API_BASE_URL rỗng -> gọi đường dẫn tương đối "/api/noi-dung".
    // Lúc `npm run dev` thì vite.config.js chuyển tiếp sang cổng 8000 (backend
    // chạy ở máy). Trên Render thì render.yaml đã điền VITE_API_URL nên gọi
    // thẳng sang tên miền của API. Cả hai trường hợp hỏng đều rơi vào catch
    // bên dưới và dùng bản mặc định.
    const controller = new AbortController();
    const hetGio = setTimeout(() => controller.abort(), HET_GIO_MS);

    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/noi-dung`, {
          signal: controller.signal,
        });
        if (!res.ok) return;

        const duLieu = await res.json();

        // Chỉ ghi đè những khóa mà server THẬT SỰ có dữ liệu. Server trả {}
        // (chưa cấu hình database) hoặc thiếu khóa nào thì khóa đó giữ bản
        // mặc định — không bao giờ để website trống vì thiếu dữ liệu.
        //
        // TRỘN THEO TỪNG TRƯỜNG, không thay nguyên khối (sửa 17/08/2026).
        // Bản trước gán `moi[khoa] = v` nên dữ liệu database che sạch bản mặc
        // định. Hậu quả: mỗi lần thêm một trường mới vào file JSON (vd sứ mệnh,
        // slogan), website đã chạy với database seed từ trước sẽ KHÔNG có
        // trường đó — component đọc ra undefined và khối nội dung biến mất.
        // Lỗi này rất khó lần ra vì ở máy (chưa có database) mọi thứ vẫn đúng.
        //
        // Trộn nông là đủ: các khóa đều là object một tầng, còn legalPages là
        // map slug → trang nên trộn nông cũng cho kết quả đúng (trang nào
        // database có thì lấy của database, trang mới thêm vẫn còn).
        setNoiDung((truoc) => {
          const moi = { ...truoc };
          for (const khoa of Object.keys(MAC_DINH)) {
            const v = duLieu?.[khoa];
            if (v && typeof v === "object" && Object.keys(v).length > 0) {
              moi[khoa] = { ...MAC_DINH[khoa], ...v };
            }
          }
          return moi;
        });
      } catch {
        // Mạng hỏng / hết giờ / backend đang ngủ — im lặng dùng bản mặc định.
        // CỐ Ý không hiện lỗi: khách xem website không cần biết chuyện này.
      } finally {
        clearTimeout(hetGio);
      }
    })();

    return () => {
      clearTimeout(hetGio);
      controller.abort();
    };
  }, []);

  return (
    <NoiDungContext.Provider value={noiDung}>{children}</NoiDungContext.Provider>
  );
}

// Hook dùng chung. Gọi ngoài Provider thì trả bản mặc định thay vì ném lỗi —
// để những chỗ như trang admin (nằm ngoài Layout) vẫn hoạt động.
export function useNoiDung() {
  return useContext(NoiDungContext) ?? MAC_DINH;
}

/**
 * Thông tin công ty (tên, SĐT, email, địa chỉ, giờ làm việc...).
 * Thay cho `import { SITE } from "../utils/constants.js"` ở các component.
 */
export function useCongTy() {
  const noiDung = useNoiDung();
  return noiDung.company ?? companyMacDinh;
}

/** Nội dung các trang pháp lý, khóa theo slug (privacy-policy / terms-of-service). */
export function useTrangPhapLy() {
  const noiDung = useNoiDung();
  return noiDung.legalPages ?? legalPagesMacDinh;
}

/** Nội dung khối Hero ở đầu trang chủ. */
export function useHero() {
  const noiDung = useNoiDung();
  return noiDung.hero ?? heroMacDinh;
}

/** Nội dung khối Giới thiệu. */
export function useAbout() {
  const noiDung = useNoiDung();
  return noiDung.about ?? aboutMacDinh;
}

/**
 * Cài đặt giao diện — hiện chỉ có khoá bảng màu.
 *
 * Đây là khoá nội dung DUY NHẤT có mặt ngay ở lần vẽ đầu tiên và ảnh hưởng tới
 * TOÀN BỘ màu của trang. Vì vậy nó lấy từ bản JSON đóng gói sẵn trước, rồi mới
 * để API ghi đè — nếu chờ API thì người xem thấy trang đổi màu giữa chừng.
 */
export function useGiaoDien() {
  const noiDung = useNoiDung();
  return noiDung.giaoDien ?? giaoDienMacDinh;
}

export { NoiDungContext, MAC_DINH };
