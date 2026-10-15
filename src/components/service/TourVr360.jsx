import { useState } from "react";
import { Expand, Rotate3d } from "lucide-react";
import Container from "../ui/Container.jsx";
import SectionTitle from "../ui/SectionTitle.jsx";

// ============================================================
// Khối "trải nghiệm thử tour 360°" trên trang /vr360.
//
// Tour do iMob dựng trên Panoee (dịch vụ ngoài). Website chỉ NHÚNG bằng iframe:
// không lưu gì, Panoee đổi/gỡ tour thì khung này trống theo. Panoee không chặn
// nhúng (đã kiểm tra: không có X-Frame-Options/CSP).
//
// TẢI TRỄ: ban đầu chỉ hiện ẢNH BÌA + nút; bấm mới gắn iframe. Panoee kéo theo
// vài MB JS/ảnh panorama, tải ngay sẽ làm trang ì — mà phần lớn khách chỉ lướt
// qua. Ảnh bìa nhẹ (~50KB) cho họ thấy trước tour trông thế nào.
//
// Đổi tour: chỉ sửa 3 hằng số dưới. Khi Panoee gắn tên miền riêng thì đổi SRC.
// ============================================================
const TEN_TOUR = "VR360 Phường Yên Tử";
const SRC =
  "https://tour.panoee.net/iframe/6acde696a04f4c000852045c?embedFullscreen=1&embedVr=1&embedGyro=1";
// Ảnh og:image của tour. Hỏng (Panoee đổi) thì tự về nền chuyển màu (onError).
const ANH_BIA =
  "https://assets.panoee.com/statics/uploads/user/68216d642ef77c3ea9b39c3f/media/asset/kHriCCukn012YAmO59qq.jpg";

export default function TourVr360() {
  const [dangXem, setDangXem] = useState(false);
  const [anhHong, setAnhHong] = useState(false);

  return (
    <section className="py-20 lg:py-28">
      <Container>
        <SectionTitle
          badge="Trải nghiệm thử"
          title="Bước vào tour"
          highlight="360°"
          description="Đây là một tour do iMob thực hiện. Kéo để nhìn quanh, bấm toàn màn hình, hoặc mở trên điện thoại rồi xoay máy để xem như đang đứng tại chỗ."
        />

        {/* Khung tỉ lệ: điện thoại cao hơn (4/5) cho dễ nhìn, máy tính 16:9. */}
        <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-block bg-mist shadow-lift">
          <div className="relative aspect-[4/5] w-full sm:aspect-video">
            {dangXem ? (
              <iframe
                title={TEN_TOUR}
                src={SRC}
                className="absolute inset-0 h-full w-full border-0"
                allow="autoplay; accelerometer; gyroscope; fullscreen; xr-spatial-tracking"
                allowFullScreen
                loading="lazy"
              />
            ) : (
              <button
                type="button"
                onClick={() => setDangXem(true)}
                aria-label={`Xem tour 360 độ: ${TEN_TOUR}`}
                className="group absolute inset-0 flex flex-col items-center justify-center gap-5 bg-gradient-to-br from-brand via-brand-deep to-accent text-tren-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tren-brand"
              >
                {/* Ảnh bìa phủ kín, mờ nhẹ để chữ và nút nổi lên */}
                {!anhHong && (
                  <img
                    src={ANH_BIA}
                    alt=""
                    onError={() => setAnhHong(true)}
                    className="absolute inset-0 h-full w-full object-cover opacity-55 transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <span className="pointer-events-none relative flex h-20 w-20 items-center justify-center rounded-full bg-tren-brand/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none">
                  <Rotate3d className="h-9 w-9" aria-hidden="true" />
                </span>
                <span className="pointer-events-none relative flex items-center gap-2 rounded-full bg-tren-brand px-6 py-3 text-[1.0625rem] font-semibold text-brand shadow-lift">
                  <Expand className="h-4.5 w-4.5" aria-hidden="true" />
                  Xem tour 360°
                </span>
                <span className="pointer-events-none relative text-sm font-medium text-tren-brand/90">
                  {TEN_TOUR}
                </span>
              </button>
            )}
          </div>
        </div>

        <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-ink-faint">
          Tour được dựng và lưu trên nền tảng Panoee. Lần tải đầu có thể mất vài giây tuỳ đường truyền.
        </p>
      </Container>
    </section>
  );
}
