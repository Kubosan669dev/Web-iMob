import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowRight, ChevronLeft, ChevronRight, Image as HinhTrong } from "lucide-react";
import MaQR from "./MaQR.jsx";
import useManHinhRong from "../../hooks/useManHinhRong.js";
import { diaChiAnh } from "../../utils/anh.js";

// ============================================================
// HÀNG THẺ DỰ ÁN — ô bên phải khung hình đầu.
//
// ⚠️ DỰNG LẠI HẲN 21/08/2026 theo ảnh bố cục công ty gửi ("chỉ cần giống y
// hệt với giao diện như ảnh"). Bản trước là MỘT slide lớn: ảnh to bên trái,
// tên + mô tả bên phải, mã QR và nút "Mở thử ngay" ở dưới — mỗi lần chỉ khoe
// được một dự án.
//
// Nay là BỐN THẺ NHỎ MỘT HÀNG, đúng như ảnh mẫu. Được ba thứ cùng lúc:
//   · khách nhìn một cái thấy ngay bốn dự án chứ không phải đứng đợi vòng xoay
//   · hết mảng trắng chết ở góc dưới bên phải — chỗ trước đây chỉ có mã QR
//     nằm chơ vơ giữa một vùng trống to bằng nửa cái thẻ
//   · thẻ nhỏ thì cao vừa phải, nên ô này và cột 7 mục bên trái cao xấp xỉ
//     nhau, không bên nào bị kéo giãn theo bên nào
//
// VẪN CHUYỂN ĐỘNG, chỉ đổi cách: thay vì đổi nội dung tại chỗ, cả hàng TRƯỢT
// ngang sang thẻ tiếp theo. Công ty yêu cầu trang chủ có chuyển động, mà trượt
// hàng thì êm hơn hẳn việc bốn cái thẻ cùng nhấp nháy đổi ảnh một lúc.
//
// ---- Vì sao KHÔNG dùng grid + phân trang ----
// 6 dự án chia trang 4 thẻ thì trang cuối chỉ có 2 thẻ, để lại hai ô trống
// toang hoác — đúng cái lỗi vừa đi sửa. Trượt từng thẻ một thì hàng lúc nào
// cũng đủ bốn.
//
// ---- Số thẻ trong một hàng nằm ở JAVASCRIPT, không phải ở CSS ----
// Nhìn qua thì dùng `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` gọn hơn.
// Nhưng vị trí trượt tối đa = tổng số dự án − số thẻ hiện cùng lúc, tức là
// JavaScript BẮT BUỘC phải biết con số đó. Khai ở hai nơi thì đến lúc thu nhỏ
// cửa sổ hai bên lệch nhau: hàng trượt quá đà và để lộ khoảng trắng ở cuối.
// Nên `soThe` tính một lần bằng useManHinhRong rồi đưa xuống CSS qua style —
// một nguồn sự thật duy nhất.
// ============================================================

// ⚠️ ĐỪNG TỰ Ý ĐỔI LẠI — con số này ĐÃ đổi bốn lần, lần nào cũng do người
// dùng yêu cầu trực tiếp, và yêu cầu sau nhiều lần NGƯỢC với văn bản trước:
//   5000  bản đầu
//   8000  văn bản góp ý 19/08/2026: "chuyển động sau mỗi 7 đến 10 giây"
//   2500  yêu cầu trực tiếp cuối 19/08/2026: "nhanh hơn 1 chút, tầm 2 đến 3
//         giây chuyển sang 1 lần"
//   3500  21/08/2026, khi đổi từ băng chuyền MỘT dự án sang hàng BỐN thẻ. Tôi
//         tự nới ra vì nghĩ hàng thẻ trượt nhanh sẽ giật. Đây là suy đoán của
//         tôi, KHÔNG phải ý người dùng.
//   2000  21/08/2026, người dùng xem hàng thẻ thật rồi chốt: "cho chạy các
//         sản phẩm 2 giây 1 lần đi". Ý mới nhất, và là ý của người xem thật.
//
// 2 giây so với hiệu ứng trượt 500ms: một phần tư thời gian là đang trượt,
// ba phần tư là đứng yên cho mắt đọc. Vẫn thoáng.
// Ai đọc chậm thì rê chuột vào là cả hàng dừng lại ngay (xem onMouseEnter bên
// dưới) — đó mới là cái đỡ thật sự cho nhịp nhanh, chứ không phải con số này.
const NHIP_MS = 2000;

// Khe giữa hai thẻ. Phải là MỘT con số dùng chung cho cả bề rộng thẻ lẫn quãng
// trượt (xem công thức bên dưới), nên để thành biến CSS thay vì gõ lại hai chỗ.
const KHE = "1rem";

/**
 * Dòng phụ dưới tên dự án.
 *
 * Mô tả trong CMS đôi khi nhắc lại NGUYÊN tên sản phẩm — ví dụ dự án "Bảo tàng
 * – Thư viện tỉnh Quảng Ninh" có mô tả "Zalo Mini App của Bảo tàng – Thư viện
 * tỉnh Quảng Ninh." Thẻ nhỏ mà hai dòng liền nhau gần như giống hệt thì nhìn
 * như lỗi lặp chữ. Gặp trường hợp đó thì lấy loại sản phẩm — ngắn, luôn khác
 * tên, và vẫn là thông tin thật.
 */
function phuDe(s) {
  const ten = (s.title ?? "").trim();
  const mo = (s.description ?? "").trim();
  if (ten && mo.toLowerCase().includes(ten.toLowerCase())) {
    return (s.loai ?? "").trim();
  }
  return mo;
}

/* ================= Một thẻ dự án ================= */
function TheDuAn({ sp, hienQR }) {
  const Tag = sp.lienKet ? "a" : "div";

  return (
    <Tag
      href={sp.lienKet || undefined}
      target={sp.lienKet ? "_blank" : undefined}
      rel={sp.lienKet ? "noopener noreferrer" : undefined}
      className="group/the flex h-full flex-col"
    >
      {/* ---------- Ảnh ----------
          ⚠️ TRÊN MÀN RỘNG, Ô ẢNH KHÔNG CÓ TỈ LỆ CỐ ĐỊNH — nó NỞ RA lấp hết
          chỗ còn thừa (lg:flex-1). Đây là cách chữa tận gốc cho việc thẻ phải
          lúc nào cũng thấp hơn cột 7 mục bên trái: lưới kéo hai thẻ cao bằng
          nhau, mà hàng bốn thẻ dự án tính theo nội dung thì chỉ cao chừng
          370px so với 490px bên kia — chênh 120px đọng lại thành mảng trắng.

          Đã thử cách gõ tay: đổi 16:10 -> 4:3 rồi cho mô tả xuống 3 dòng. Ăn
          được chừng 40px, còn 115px vẫn nằm đó, mà mỗi lần đổi bề ngang cửa sổ
          là con số lại khác. Để ảnh tự nở thì không còn phải canh: thừa bao
          nhiêu ảnh ăn hết bấy nhiêu, ở MỌI cỡ màn hình.

          Ba cái chốt chặn để nó không nở bậy:
            · dưới lg giữ nguyên aspect-[4/3] — ở đó thẻ đứng một mình, không
              bị ai kéo cao, nên flex-1 sẽ co ảnh về 0.
            · lg:min-h-[7rem]  — sàn, phòng khi cột trái bỗng ngắn lại.
            · lg:max-h-[11rem] — trần. Rút từ 13rem xuống 11rem ngày
              22/08/2026, cùng lúc với việc đổi sang object-contain, và con số
              này là kết quả của việc ĐO RỒI NHÌN chứ không phải ước lượng:
              ảnh 16:10 nằm trong ô rộng 179px thì luôn cao đúng 112px, bao
              nhiêu chiều cao dôi ra cũng chỉ thành vành nền nhoè chứ ảnh không
              to thêm được. 13rem cho vành 48px mỗi bên — ảnh nhìn như lọt
              thỏm. 9rem cho vành 16px, ảnh sắc nét nhưng đáy thẻ hụt hẳn một
              mảng trắng ~110px. 11rem là chỗ giao: vành 32px trông như một
              lớp nền có chủ ý, mảng trắng còn ~70px thì vừa bằng khoảng thở
              trước dòng "Được tin tưởng bởi…".

          Hai khối chữ bên dưới bị ghim min-h đúng hai dòng CŨNG LÀ VÌ VIỆC
          NÀY: bốn thẻ phải có phần chữ cao bằng nhau thì bốn ô ảnh mới nở ra
          bằng nhau. Không ghim thì thẻ tên một dòng có ảnh cao hơn thẻ tên hai
          dòng, hàng ảnh nhấp nhô như răng cưa. */}
      <div className="relative aspect-[4/3] min-h-0 overflow-hidden rounded-card bg-mist lg:aspect-auto lg:min-h-[7rem] lg:max-h-[11rem] lg:flex-1">
        {sp.anh ? (
          /* HAI LỚP CÙNG MỘT TẤM ẢNH — nền nhoè phủ kín, ảnh thật lọt trọn.
             Trình duyệt chỉ tải MỘT lần rồi dùng lại, không tốn thêm mạng.

             ⚠️ ĐÂY LÀ BẢN SỬA MỘT LỖI ĐÃ LÊN WEB THẬT (22/08/2026).
             Chỗ này từng là một tấm object-cover, và ghi chú cũ khẳng định
             "đã soi từng ảnh, không ảnh nào mất chữ". Sai. Đo lại mới ra con
             số thật: ô ảnh ở màn 1440 là 179x208 (tỉ lệ 0,86 — KHỔ DỌC), còn
             cả sáu ảnh đều 16:10 (tỉ lệ 1,60 — KHỔ NGANG). object-cover khớp
             theo chiều CAO nên ảnh bị phóng lên 333px rồi cắt còn 179 —
             tức là MẤT 46% BỀ NGANG, xén 23% mỗi bên. Công ty nhìn ra ngay ở
             hai ảnh có chữ chạy rộng: "KHÁM PHÁ QUẢNG TÂN" và web phường Yên
             Tử, cả hai bị cụt đầu cụt đuôi.

             Vì sao chữa bằng nền nhoè chứ không chỉnh tỉ lệ ô:
             tỉ lệ ô KHÔNG CỐ ĐỊNH — ô cao 208px không đổi còn bề ngang thẻ co
             theo cửa sổ, nên tỉ lệ chạy từ khoảng 0,58 (màn 1024) tới 0,86
             (màn 1440). Không có một tỉ lệ ảnh nào khớp được cả dải đó. Ghim
             ô về đúng 16:10 thì hết xén, nhưng mảng trắng dưới đáy thẻ quay
             lại — đúng thứ đã mất công chữa. object-contain trên nền nhoè
             được cả hai: ô vẫn nở lấp hết chỗ thừa, mà ảnh không mất một chữ,
             ở MỌI cỡ màn hình và với MỌI tỉ lệ ảnh công ty gửi sau này. */
          <>
            <img
              src={diaChiAnh(sp.anh)}
              alt=""
              aria-hidden="true"
              loading="lazy"
              /* scale-110 để mép ảnh sau khi làm nhoè không lòi ra viền nhạt. */
              className="absolute inset-0 h-full w-full scale-110 object-cover blur-lg"
            />
            <img
              src={diaChiAnh(sp.anh)}
              alt={`Giao diện ${sp.title}`}
              loading="lazy"
              className="relative h-full w-full object-contain transition-transform duration-500 group-hover/the:scale-[1.04]"
            />
          </>
        ) : (
          /* Dự án mới thêm trong /admin chưa kịp có ảnh: vẫn giữ đúng chỗ để
             bốn thẻ trong hàng bằng nhau, thay vì thẻ đó tụt lên trên. */
          <div className="flex h-full w-full items-center justify-center">
            <HinhTrong className="h-6 w-6 text-ink-faint" aria-hidden="true" />
          </div>
        )}

        {/* ---------- Mã QR ----------
            Ảnh mẫu công ty gửi KHÔNG có mã QR. Nhưng mã QR là thứ chính người
            dùng đặt làm trước đó, và nó có việc thật: ba dự án Zalo Mini App
            mở bằng máy tính chỉ ra một trang bảo "hãy mở trên điện thoại" —
            quét mã là vào thẳng. Nên giữ, chỉ đổi chỗ: nấp ở góc ảnh, rê chuột
            (hoặc chuyển tới bằng bàn phím) mới hiện.
            Chỉ trên máy tính — không ai quét mã QR trên màn hình của chính cái
            điện thoại mình đang cầm (xem hooks/useManHinhRong.js). */}
        {hienQR && sp.lienKet && (
          <span className="pointer-events-none absolute bottom-2 right-2 rounded-xl bg-white p-1.5 opacity-0 shadow-lift transition-opacity duration-300 group-hover/the:opacity-100 group-focus-visible/the:opacity-100">
            <MaQR
              noiDung={sp.lienKet}
              alt={`Mã QR mở ${sp.title}`}
              className="block h-20 w-20"
            />
            <span className="mt-1 block text-center text-[0.625rem] leading-none text-ink-faint">
              Quét để mở
            </span>
          </span>
        )}
      </div>

      {/* ---------- Chữ ----------
          line-clamp-2 + min-h đúng hai dòng: mọi thẻ có khối chữ cao y hệt
          nhau, dù tên dự án một dòng hay hai. Cắt cụt ở ĐÂY thì chấp nhận được
          (khác hẳn 7 mục bên trái, chỗ đó công ty cấm chỉnh một chữ): tên đầy
          đủ vẫn nằm trong nội dung thẻ cho máy đọc màn hình, và bấm vào là mở
          ra chính sản phẩm đó.
          min-h tính từ cỡ chữ: 15px × leading-snug (1,375) × 2 dòng ≈ 41px,
          13px × leading-relaxed (1,625) × 2 dòng ≈ 42px. Đổi cỡ chữ thì phải
          tính lại hai con số này. */}
      <h3 className="mt-4 line-clamp-2 min-h-[2.6rem] text-[0.9375rem] font-bold leading-snug text-ink transition-colors group-hover/the:text-brand">
        {sp.title}
      </h3>

      {/* BA dòng chứ không phải hai (22/08/2026). Mô tả mới của dự án Yên Tử
          Số — "Zalo Mini App phục vụ chính quyền, người dân và du khách", do
          công ty gửi nguyên văn — dài đúng 3 dòng ở bề ngang thẻ này; để 2
          dòng thì nó cụt ở "và du…", mất mất nhóm khách quan trọng nhất của
          một khu di tích. Nới ra còn ăn thêm được ~21px mảng trắng dưới đáy
          thẻ. min-h: 13px × leading-relaxed (1,625) × 3 dòng ≈ 63px. */}
      <p className="mt-1.5 line-clamp-3 min-h-[3.95rem] text-[0.8125rem] leading-relaxed text-ink-soft">
        {phuDe(sp)}
      </p>

      {/* KHÔNG dùng mt-auto ở đây nữa. Nó từng cần thiết để bốn dòng "Khám
          phá" thẳng hàng, nhưng từ khi hai khối chữ trên bị ghim min-h thì bốn
          thẻ đã có phần chữ cao y hệt nhau rồi — mt-auto chỉ còn tác dụng đẩy
          dòng này xuống tận đáy, tách nó khỏi cụm tên + mô tả bằng một khoảng
          trống ~50px lửng lơ. Bỏ đi thì chỗ trống dồn xuống dưới cùng, nhập
          làm một với khoảng cách phía trên dòng "Được tin tưởng bởi…" — một
          khoảng thở đặt đúng chỗ thay vì hai khoảng nhỏ đặt sai chỗ. */}
      {sp.lienKet && (
        <span className="inline-flex items-center gap-1.5 pt-4 text-[0.8125rem] font-semibold text-brand">
          Khám phá
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover/the:translate-x-1"
            aria-hidden="true"
          />
        </span>
      )}
    </Tag>
  );
}

/* ================= Hàng thẻ ================= */
export default function SlideSanPham({ danhSach }) {
  const tong = danhSach?.length ?? 0;

  // Hai mốc bề ngang, cùng một hook với ô mã QR nên không bao giờ lệch nhau.
  const rong = useManHinhRong(1024);
  const vua = useManHinhRong(640);
  const soThe = rong ? 4 : vua ? 2 : 1;

  // Trượt được tối đa tới đâu. Còn đúng 4 dự án trở xuống thì không trượt gì
  // cả — hàng đứng yên, hai nút mũi tên tự ẩn.
  const gioiHan = Math.max(0, tong - soThe);

  const [i, setI] = useState(0);
  const [dung, setDung] = useState(false);
  const giamChuyenDong = useReducedMotion();

  // Danh sách đổi (sửa trong /admin) hoặc kéo nhỏ cửa sổ -> vị trí cũ có thể
  // trỏ quá cuối hàng. Kẹp lại ngay lúc vẽ, đồng thời đưa về đầu.
  useEffect(() => {
    setI(0);
  }, [tong, soThe]);

  useEffect(() => {
    if (gioiHan < 1 || dung) return;
    const timer = setInterval(
      () => setI((k) => (k >= gioiHan ? 0 : k + 1)),
      NHIP_MS
    );
    return () => clearInterval(timer);
  }, [gioiHan, dung]);

  if (tong === 0) return null;

  const viTri = Math.min(i, gioiHan);

  const di = (buoc) => {
    const n = viTri + buoc;
    setI(n < 0 ? gioiHan : n > gioiHan ? 0 : n);
  };

  const nutMuiTen =
    "flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-brand hover:bg-brand hover:text-tren-brand";

  /* Quãng trượt cho MỖI bước.
       bề ngang một thẻ = (100% − (n−1) × khe) / n
       một bước         = bề ngang thẻ + khe = (100% + khe) / n
     Phần trăm trong translateX tính theo bề ngang của CHÍNH hàng, mà hàng rộng
     đúng bằng ô chứa nó, nên 25% ở đây là 25% ô chứa — đúng thứ ta cần. */
  const buocTruot = `calc(-1 * ${viTri} * (100% + ${KHE}) / ${soThe})`;
  const rongThe = `calc((100% - (${soThe} - 1) * ${KHE}) / ${soThe})`;

  return (
    <div
      className="flex min-w-0 flex-1 flex-col"
      onMouseEnter={() => setDung(true)}
      onMouseLeave={() => setDung(false)}
      onFocusCapture={() => setDung(true)}
      onBlurCapture={() => setDung(false)}
    >
      {/* ---------- Tiêu đề + hai nút ---------- */}
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="text-base font-bold text-ink">Dự án nổi bật</p>

        {gioiHan > 0 && (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => di(-1)}
              aria-label="Dự án trước"
              className={nutMuiTen}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => di(1)}
              aria-label="Dự án tiếp theo"
              className={nutMuiTen}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* ---------- Hàng trượt ----------
          ⚠️ TỪNG DÙNG `items-center` Ở ĐÂY VÀ ĐÓ LÀ LỰA CHỌN SAI (21/08/2026).
          Ý định là "ô phải bị kéo cao hơn nội dung thì căn giữa cho cân". Chụp
          màn hình ra mới thấy: nó chia đôi phần dôi ra thành HAI mảng trắng,
          một mảng ~100px giữa dòng tiêu đề và hàng ảnh, một mảng nữa ở dưới.
          Hai khoảng trống nhỏ nhìn như lỗi; một khoảng trống lớn dồn về đáy —
          ngay trên dòng "Được tin tưởng bởi…" có đường kẻ ngăn — thì đọc ra là
          cố ý. Nên hàng thẻ bám sát tiêu đề, phần dôi dồn hết xuống dưới. */}
      <div
        role="group"
        aria-label="Dự án nổi bật"
        className="flex-1 overflow-hidden"
      >
        <div
          className={
            "flex h-full w-full " +
            (giamChuyenDong ? "" : "transition-transform duration-500 ease-out")
          }
          style={{ gap: KHE, transform: `translateX(${buocTruot})` }}
        >
          {danhSach.map((sp, k) => {
            // Thẻ đã trôi ra ngoài ô nhìn: inert khoá luôn cả chuột lẫn bàn
            // phím. Không có nó thì bấm Tab sẽ nhảy vào một thẻ vô hình, trình
            // duyệt cuộn ngang ô chứa để đuổi theo và cả hàng lệch khỏi vị trí
            // mà transform đang đặt.
            const ngoaiTam = k < viTri || k >= viTri + soThe;
            return (
              <div
                key={sp.id ?? k}
                inert={ngoaiTam}
                aria-hidden={ngoaiTam}
                className="h-full shrink-0"
                style={{ width: rongThe }}
              >
                <TheDuAn sp={sp} hienQR={rong} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
