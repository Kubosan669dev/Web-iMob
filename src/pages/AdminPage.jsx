import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Download,
  FileDown,
  FileText,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageCircle,
  Package,
  Palette,
  Phone,
  RefreshCw,
  RotateCcw,
  Save,
  Sparkles,
} from "lucide-react";
import useDocumentTitle from "../hooks/useDocumentTitle.js";
import { O, ODai, ODanhSach, OTuKhoa, locDongTrong } from "../components/admin/Fields.jsx";
import ManHinhDangNhap from "../components/admin/ManHinhDangNhap.jsx";
import * as api from "../services/adminService.js";
import { MAC_DINH } from "../context/NoiDungContext.jsx";
import { BANG_MAU } from "../data/bangMau.js";
import MucSanPham from "../components/admin/MucSanPham.jsx";
import MucTongQuan from "../components/admin/MucTongQuan.jsx";

// ============================================================
// AdminPage — trang quản trị nội dung (/admin).
//
// BA QUYẾT ĐỊNH THIẾT KẾ, và lý do:
//
// 1. ĐIỀU HƯỚNG DỌC BÊN TRÁI, XẾP THEO THỨ TỰ TRÊN TRANG CHỦ.
//    Các mục Hero → Giới thiệu → Liên hệ được đánh số 01/02/03 vì chúng THẬT SỰ
//    nằm theo thứ tự đó khi khách cuộn trang chủ — con số nói lên điều có thật
//    chứ không phải trang trí. Tin nhắn và Trang pháp lý không nằm trên trang
//    chủ nên tách nhóm riêng, KHÔNG đánh số. Rail dọc cũng đọc tên mục dễ hơn
//    hàng tab ngang khi có nhiều mục.
//    Lưu ý: giữa ba mục này trên trang chủ còn có Sản phẩm và Dịch vụ, nhưng
//    hai khối đó chưa đưa vào CMS (còn nằm trong src/data/). Số 01/02/03 vì
//    vậy là THỨ TỰ TƯƠNG ĐỐI, không phải vị trí thứ mấy trên trang.
//
// 2. THANH LƯU CHỈ HIỆN KHI CÓ THAY ĐỔI, và nói rõ đang sửa những gì.
//    Nút "Lưu" lúc nào cũng sáng thì không cho biết điều gì: bấm rồi cũng không
//    chắc mình vừa đổi cái gì, và đóng tab lúc đang sửa dở thì mất trắng mà
//    không được cảnh báo. Ở đây mỗi ô đã sửa có chấm vàng, thanh dưới đếm số
//    mục đang sửa, và rời trang khi chưa lưu thì trình duyệt hỏi lại.
//
// 3. MỖI MỤC CÓ LINK "XEM TRÊN WEB".
//    Đang sửa chữ mà không nhớ nó hiện ở chỗ nào trên trang là chuyện thường —
//    bấm một cái là nhảy thẳng tới đúng khối đó.
//
// Bảo vệ thật nằm ở máy chủ (đăng nhập + vé JWT, xem chatbot-python/auth.py).
// Đường dẫn /admin không có trong menu và bị robots.txt chặn, nhưng "giấu
// đường dẫn" KHÔNG phải là bảo mật.
// ============================================================

/* Mục nào sửa khoá nội dung nào, và nằm ở đâu trên website.
   Ba nhóm này chính là thứ tự trong cột điều hướng bên trái.

   Bản trước đánh số 01/02/03 cho các mục trang chủ. Bỏ số đi khi thêm biểu
   tượng: trong một danh sách DỌC thì vị trí trên dưới đã nói đúng thứ tự rồi,
   con số chỉ lặp lại điều mắt đã thấy. Biểu tượng thì ngược lại — nó giúp nhận
   ra mục cần tìm mà không phải đọc chữ. */
const MUC_CHINH = [
  { id: "tong-quan", nhan: "Tổng quan", khoa: null, icon: LayoutDashboard },
];

const MUC_TRANG_CHU = [
  { id: "hero", nhan: "Hero", khoa: "hero", icon: Sparkles, neo: "/#home" },
  { id: "san-pham", nhan: "Sản phẩm", khoa: "projects", icon: Package, neo: "/#projects" },
  { id: "about", nhan: "Giới thiệu", khoa: "about", icon: Building2, neo: "/#about" },
  { id: "lien-he", nhan: "Liên hệ", khoa: "company", icon: Phone, neo: "/#contact" },
];

const MUC_KHAC = [
  { id: "tin-nhan", nhan: "Tin nhắn", khoa: null, icon: Inbox },
  { id: "giao-dien", nhan: "Giao diện", khoa: "giaoDien", icon: Palette, neo: "/" },
  { id: "phap-ly", nhan: "Trang pháp lý", khoa: "legalPages", icon: FileText, neo: "/privacy-policy" },
];

const TAT_CA_MUC = [...MUC_CHINH, ...MUC_TRANG_CHU, ...MUC_KHAC];

/* ================= Mảnh dùng chung ================= */
function Bang({ loai, children }) {
  if (!children) return null;
  const kieu =
    loai === "loi"
      ? "bg-loi-nen text-loi"
      : "bg-brand-soft text-brand";
  const Icon = loai === "loi" ? AlertTriangle : CheckCircle2;
  return (
    <div
      role={loai === "loi" ? "alert" : "status"}
      className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm ${kieu}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

function TieuDeMuc({ children, ghiChu, neo }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-4">
      <div>
        <h2 className="tieu-de-lon text-xl text-ink">{children}</h2>
        {ghiChu && <p className="mt-1 text-sm text-ink-soft">{ghiChu}</p>}
      </div>
      {neo && (
        <Link
          to={neo}
          target="_blank"
          className="inline-flex items-center gap-1 text-sm text-ink-soft transition-colors hover:text-brand"
        >
          Xem trên web
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

/** Khung một mục: thẻ trắng bo góc lớn đặt trên nền xám nhạt của trang.
    Không viền, không bóng — chênh lệch sắc độ trắng/xám là đủ để tách. */
function Khung({ children }) {
  return (
    <section className="rounded-block bg-panel p-6 sm:p-8">
      {children}
    </section>
  );
}

const LUOI = "grid gap-x-6 gap-y-5 sm:grid-cols-2";

/* ================= Các mục nội dung ================= */
function MucHero({ d, doi, daSua }) {
  const s = (k) => (v) => doi({ ...d, [k]: v });
  return (
    <Khung>
      <TieuDeMuc ghiChu="Màn hình đầu tiên khách nhìn thấy" neo="/#home">
        Hero
      </TieuDeMuc>
      <div className="space-y-5">
        <O nhan="Nhãn nhỏ phía trên" giaTri={d.badge} doi={s("badge")} daSua={daSua} />

        {/* Nhãn đổi 19/08/2026 cho khớp bố cục tiêu đề mới. BA TRƯỜNG NÀY ĐÃ
            ĐỔI VAI, tên khoá giữ nguyên để không phải chuyển đổi dữ liệu cũ:
              tieuDeTruoc — trước là dòng chữ nhỏ dẫn vào, GIỜ là dòng to nhất
              tieuDeSau   — trước là đuôi câu, GIỜ là dòng to thứ hai
              tuKhoaDong  — trước là MỘT từ xoay vòng giữa câu, GIỜ là cả dải
                            mảng công nghệ hiện cùng lúc, sáng dần từng cụm */}
        <div className={LUOI}>
          <O nhan="Dòng tiêu đề LỚN" giaTri={d.tieuDeTruoc} doi={s("tieuDeTruoc")} daSua={daSua} />
          <O nhan="Dòng tiêu đề thứ hai" giaTri={d.tieuDeSau} doi={s("tieuDeSau")} daSua={daSua} />
        </div>

        <OTuKhoa
          nhan="Dải mảng công nghệ (hiện cùng lúc, sáng dần từng cụm)"
          danhSach={d.tuKhoaDong}
          doi={s("tuKhoaDong")}
          daSua={daSua}
        />

        <ODai nhan="Mô tả" giaTri={d.moTa} doi={s("moTa")} daSua={daSua} />

        <div className={LUOI}>
          <O nhan="Chữ trên nút chính" giaTri={d.nutChinh} doi={s("nutChinh")} daSua={daSua} />
          <O nhan="Chữ trên nút phụ" giaTri={d.nutPhu} doi={s("nutPhu")} daSua={daSua} />
        </div>

        <div className={LUOI}>
          <O
            nhan="Ảnh banner (ô bên phải)"
            giaTri={d.anh}
            doi={s("anh")}
            daSua={daSua}
            moTa="Bỏ file vào public/anh/ rồi gõ /anh/ten-file.png. Để TRỐNG thì ô đó chạy băng chuyền lần lượt qua các sản phẩm, kèm mã QR mở thử — thường là lựa chọn tốt hơn một ảnh minh hoạ."
          />
          <O
            nhan="Mô tả ảnh"
            giaTri={d.anhMoTa}
            doi={s("anhMoTa")}
            daSua={daSua}
            moTa="Câu tả nội dung ảnh, dành cho người khiếm thị và cho Google"
          />
        </div>

        <p className="rounded-xl bg-mist px-4 py-3 text-[0.8125rem] leading-relaxed text-ink-soft">
          Số điện thoại và email của khối này lấy từ mục{" "}
          <span className="font-medium text-ink">Liên hệ</span> — cố ý không cho nhập lại ở
          đây, vì cùng một thông tin để ở hai chỗ thì sớm muộn cũng lệch nhau.
        </p>
      </div>
    </Khung>
  );
}

function MucAbout({ d, doi, daSua }) {
  const s = (k) => (v) => doi({ ...d, [k]: v });
  return (
    <Khung>
      <TieuDeMuc ghiChu="Khối giới thiệu ở trang chủ" neo="/#about">
        Giới thiệu
      </TieuDeMuc>
      <div className="space-y-5">
        <div className={LUOI}>
          <O nhan="Nhãn nhỏ" giaTri={d.phuDe} doi={s("phuDe")} daSua={daSua} />
          <O nhan="Tiêu đề" giaTri={d.tieuDe} doi={s("tieuDe")} daSua={daSua} />
        </div>
        <O
          nhan="Phần tiêu đề tô màu"
          giaTri={d.tieuDeNhan}
          doi={s("tieuDeNhan")}
          daSua={daSua}
          moTa="Nối ngay sau Tiêu đề và được tô màu thương hiệu."
        />
        <ODai
          nhan="Mô tả"
          giaTri={d.moTa}
          doi={s("moTa")}
          daSua={daSua}
          moTa="Nối tiếp sau mô tả công ty, nên viết như phần sau của một câu."
        />
        <ODai
          nhan="Câu nói nổi bật"
          giaTri={d.philosophy}
          doi={s("philosophy")}
          daSua={daSua}
          dongToiThieu={4}
        />
        <p className="rounded-xl bg-mist px-4 py-3 text-[0.8125rem] leading-relaxed text-ink-soft">
          Ba con số thống kê, bốn giá trị cốt lõi và dải năng lực nổi bật bên
          dưới khối này chưa sửa được ở đây — còn nằm trong{" "}
          <span className="font-mono text-ink">src/data/about.json</span>.
        </p>
      </div>
    </Khung>
  );
}

const TRUONG_CONG_TY = [
  { khoa: "name", nhan: "Tên ngắn", moTa: "Hiện ở Navbar và Footer" },
  { khoa: "tagline", nhan: "Khẩu hiệu" },
  { khoa: "fullName", nhan: "Tên đầy đủ", rong: true },
  { khoa: "description", nhan: "Mô tả ngắn", dai: true },
  { khoa: "positioning", nhan: "Câu định vị", dai: true, moTa: "Hiện dưới tiêu đề Hero" },
  { khoa: "phone", nhan: "Điện thoại", moTa: "Chatbot cũng đọc số này" },
  { khoa: "email", nhan: "Email chính" },
  { khoa: "website", nhan: "Website" },
  { khoa: "address", nhan: "Địa chỉ văn phòng", dai: true, moTa: "Nơi khách tới gặp" },
  { khoa: "workingHours", nhan: "Giờ làm việc" },
  { khoa: "responseTime", nhan: "Thời gian phản hồi", moTa: 'Ví dụ: "trong vòng 24 giờ"' },
  { khoa: "suMenh", nhan: "Sứ mệnh", dai: true, moTa: "Hiện cuối khối Hero" },
  { khoa: "slogan", nhan: "Slogan", dai: true, moTa: "Hiện cuối khối Giới thiệu" },
];

function MucLienHe({ d, doi, daSua }) {
  return (
    <Khung>
      <TieuDeMuc
        ghiChu="Website và chatbot dùng chung — sửa một lần, cả hai cùng đổi"
        neo="/#contact"
      >
        Liên hệ
      </TieuDeMuc>
      <div className={LUOI}>
        {TRUONG_CONG_TY.map(({ khoa, nhan, moTa, dai, rong }) => {
          const O_ = dai ? ODai : O;
          return (
            <div key={khoa} className={dai || rong ? "sm:col-span-2" : ""}>
              <O_
                nhan={nhan}
                moTa={moTa}
                dongToiThieu={2}
                daSua={daSua}
                giaTri={d?.[khoa]}
                doi={(v) => doi({ ...d, [khoa]: v })}
              />
            </div>
          );
        })}
      </div>
    </Khung>
  );
}

/** Công tắc hai trạng thái.
    role="switch" chứ không phải checkbox: trình đọc màn hình sẽ đọc ra
    "bật / tắt" thay vì "đã chọn" — đúng với thứ mà nó điều khiển. */
function CongTac({ bat, doi, nhan, moTa, daSua = false }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-card bg-mist p-4">
      <div className="min-w-0">
        <span className="flex items-center gap-2 text-sm font-medium text-ink">
          {nhan}
          {daSua && (
            <span
              title="Đã sửa, chưa lưu"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-canhbao-cham"
            />
          )}
        </span>
        {moTa && (
          <span className="mt-1 block text-[0.8125rem] leading-relaxed text-ink-soft">
            {moTa}
          </span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={bat}
        aria-label={nhan}
        onClick={() => doi(!bat)}
        className={
          "relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors " +
          (bat ? "bg-brand" : "bg-line")
        }
      >
        <span
          className={
            "absolute top-0.5 h-5 w-5 rounded-full bg-panel shadow-lift transition-transform " +
            (bat ? "translate-x-[1.375rem]" : "translate-x-0.5")
          }
        />
      </button>
    </div>
  );
}

/* Chờ mấy giây rồi mới chào. Cho chọn trong vài mốc sẵn chứ không cho gõ số:
   chênh nhau 3 hay 4 giây thì không ai nhận ra, còn một ô số trống thì có
   người gõ vào 300. */
const MOC_TRE = [1, 3, 6, 10];

/**
 * Giao diện: bảng màu CHÍNH THỨC + cách khung chat chào khách.
 *
 * Bảng màu ở đây khác hẳn nút chọn màu ngoài trang chủ: nút đó chỉ đổi màu trên
 * máy người bấm để xem thử, còn ô chọn ở đây mới quyết định màu KHÁCH nhìn thấy.
 */
function MucGiaoDien({ d, goc, doi }) {
  const dangChon = d?.bangMau ?? "cham-tim";
  const suaMau = dangChon !== (goc?.bangMau ?? "cham-tim");

  // Database đã seed từ trước khi có khoá `chat` thì trường này thiếu — lấp
  // bằng bản mặc định trong bundle, không để người dùng nhìn thấy ô trống.
  const chuan = MAC_DINH.giaoDien.chat;
  const chat = { ...chuan, ...(d?.chat ?? {}) };
  const chatGoc = { ...chuan, ...(goc?.chat ?? {}) };
  const suaChat = JSON.stringify(chat) !== JSON.stringify(chatGoc);
  const doiChat = (v) => doi({ ...d, chat: { ...chat, ...v } });
  const tuMo = chat.tuMo !== false;

  return (
    <>
    <Khung>
      <TieuDeMuc ghiChu="Bảng màu khách nhìn thấy khi vào website" neo="/">
        Giao diện
      </TieuDeMuc>

      <div className="mb-5 flex items-center gap-2">
        <span className="text-sm font-medium text-ink-soft">Bảng màu chính thức</span>
        {suaMau && (
          <span
            title="Đã sửa, chưa lưu"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-canhbao-cham"
          />
        )}
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {BANG_MAU.map((b) => {
          const chon = b.khoa === dangChon;
          return (
            <button
              key={b.khoa}
              type="button"
              onClick={() => doi({ ...d, bangMau: b.khoa })}
              aria-pressed={chon}
              className={
                "flex items-center gap-3 rounded-card p-3.5 text-left transition-colors " +
                (chon ? "bg-brand-soft ring-1 ring-brand" : "bg-mist hover:bg-line/60")
              }
            >
              <span
                aria-hidden="true"
                className="flex h-7 w-12 shrink-0 overflow-hidden rounded-full ring-1 ring-inset ring-line"
              >
                <span
                  className="w-1/2"
                  style={{ backgroundColor: b.bien["--color-brand"] }}
                />
                <span
                  className="w-1/2"
                  style={{ backgroundColor: b.bien["--color-brand-soft"] }}
                />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={
                    "block truncate text-sm font-medium " +
                    (chon ? "text-brand" : "text-ink")
                  }
                >
                  {b.ten}
                </span>
                <span className="block truncate text-[0.8125rem] text-ink-soft">
                  {b.moTa}
                </span>
              </span>
              {chon && (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-6 rounded-xl bg-mist px-4 py-3 text-[0.8125rem] leading-relaxed text-ink-soft">
        Trang chủ có nút đổi màu ở góc dưới bên trái. Nút đó chỉ đổi màu{" "}
        <span className="font-medium text-ink">trên máy người bấm</span> để xem thử,
        không ảnh hưởng tới khách. Muốn đổi màu cho cả website thì chọn ở đây rồi bấm
        Lưu.
      </p>

      <p className="mt-3 rounded-xl bg-mist px-4 py-3 text-[0.8125rem] leading-relaxed text-ink-soft">
        Mọi bảng màu đều đã qua 15 phép đo tương phản, nên chữ ở bảng nào cũng đọc
        được. Thêm hoặc sửa màu thì sửa trong{" "}
        <span className="font-mono">scripts/kiem-tra-bang-mau.mjs</span> rồi chạy{" "}
        <span className="font-mono">npm run bangmau</span> — hụt chuẩn là script từ
        chối ghi file.
      </p>
    </Khung>

    <Khung>
      <TieuDeMuc ghiChu="Chatbot chào khách ngay khi họ vừa vào trang" neo="/">
        Khung chat
      </TieuDeMuc>

      <CongTac
        bat={tuMo}
        doi={(v) => doiChat({ tuMo: v })}
        nhan="Tự chào khách khi vào trang"
        moTa="Tắt đi thì khung chat chỉ mở khi khách tự bấm nút."
        daSua={suaChat}
      />

      {tuMo && (
        <div className="mt-5 space-y-5">
          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink-soft">
              Chờ bao lâu rồi mới chào
            </span>
            <div className="flex flex-wrap gap-2">
              {MOC_TRE.map((giay) => {
                const chon = Number(chat.tre) === giay;
                return (
                  <button
                    key={giay}
                    type="button"
                    onClick={() => doiChat({ tre: giay })}
                    aria-pressed={chon}
                    className={
                      "rounded-full px-4 py-2 text-sm font-medium transition-colors " +
                      (chon
                        ? "bg-brand text-tren-brand"
                        : "bg-mist text-ink-soft hover:text-ink")
                    }
                  >
                    {giay} giây
                  </button>
                );
              })}
            </div>
            <span className="mt-1.5 block text-[0.8125rem] leading-relaxed text-ink-faint">
              Chào ngay lúc trang vừa hiện thì khách chưa kịp đọc gì. Vài giây là đủ
              để họ nhìn qua trang chủ trước.
            </span>
          </div>

          <ODai
            nhan="Lời chào trên điện thoại"
            giaTri={chat.loiChao}
            doi={(v) => doiChat({ loiChao: v })}
            dongToiThieu={2}
            moTa="Một câu ngắn. Để trống thì trên điện thoại không chào gì cả."
          />
        </div>
      )}

      <p className="mt-6 flex items-start gap-2.5 rounded-xl bg-mist px-4 py-3 text-[0.8125rem] leading-relaxed text-ink-soft">
        <MessageCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          Máy tính và điện thoại chào{" "}
          <span className="font-medium text-ink">khác nhau</span>. Máy tính: mở sẵn
          khung chat ở góc phải, trang vẫn nhìn thấy gần hết. Điện thoại: chỉ hiện lời
          chào nhỏ cạnh nút — khung chat trên điện thoại chiếm trọn màn hình, tự mở là
          che sạch website ngay giây đầu tiên.
        </span>
      </p>

      <p className="mt-3 rounded-xl bg-mist px-4 py-3 text-[0.8125rem] leading-relaxed text-ink-soft">
        Khách tự tay đóng thì cả lần duyệt web đó sẽ không chào lại nữa, dù họ mở thêm
        bao nhiêu trang. Đóng tab rồi hôm sau quay lại vẫn được chào như thường.
      </p>
    </Khung>
    </>
  );
}

function MucPhapLy({ d, doi, daSua }) {
  const cacSlug = Object.keys(d ?? {});
  const [slug, setSlug] = useState(cacSlug[0] ?? "");
  const trang = d?.[slug];

  if (!trang) {
    return (
      <Khung>
        <p className="text-sm text-ink-soft">Chưa có dữ liệu trang pháp lý.</p>
      </Khung>
    );
  }

  const doiTrang = (phanMoi) => doi({ ...d, [slug]: { ...trang, ...phanMoi } });
  const doiMuc = (i, phanMoi) =>
    doiTrang({ sections: trang.sections.map((s, j) => (j === i ? { ...s, ...phanMoi } : s)) });

  return (
    <Khung>
      <TieuDeMuc ghiChu="Chính sách bảo mật và Điều khoản dịch vụ" neo={`/${slug}`}>
        Trang pháp lý
      </TieuDeMuc>

      <div className="mb-7 flex flex-wrap gap-1.5">
        {cacSlug.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSlug(s)}
            className={
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors " +
              (s === slug
                ? "bg-brand-soft text-brand"
                : "text-ink-soft hover:bg-mist hover:text-ink")
            }
          >
            {d[s].title ?? s}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        <div className={LUOI}>
          <O nhan="Tiêu đề" giaTri={trang.title} doi={(v) => doiTrang({ title: v })} daSua={daSua} />
          <O nhan="Tiêu đề phụ" giaTri={trang.subtitle} doi={(v) => doiTrang({ subtitle: v })} daSua={daSua} />
          <O nhan="Nhãn nhỏ" giaTri={trang.eyebrow} doi={(v) => doiTrang({ eyebrow: v })} daSua={daSua} />
          <O nhan="Ngày hiệu lực" giaTri={trang.effective} doi={(v) => doiTrang({ effective: v })} daSua={daSua} />
        </div>
        <ODai nhan="Mở đầu" giaTri={trang.intro} doi={(v) => doiTrang({ intro: v })} daSua={daSua} />
      </div>

      <div className="mt-8 space-y-4 border-t border-line pt-7">
        <h3 className="text-sm font-medium text-ink-soft">
          {trang.sections?.length ?? 0} mục nội dung
        </h3>

        {/* Hộp gộp mỗi mục dùng VIỀN chứ không dùng nền xám: ô nhập bên trong
            đã là nền xám (xem Fields.jsx), để hộp cũng nền xám thì hai thứ
            trùng màu và ô nhập biến mất. Đây là chỗ duy nhất trong trang quản
            trị có khối lồng khối nên cũng là chỗ duy nhất cần đường viền. */}
        {(trang.sections ?? []).map((muc, i) => (
          <div key={i} className="rounded-card border border-line p-5">
            <div className="mb-4 flex items-baseline gap-3">
              <span className="font-mono text-xs text-ink-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <O
                  nhan="Tiêu đề mục"
                  giaTri={muc.heading}
                  doi={(v) => doiMuc(i, { heading: v })}
                  daSua={daSua}
                />
              </div>
            </div>

            {/* Chỉ hiện ô cho những phần mục này THẬT SỰ có — mỗi mục dùng một
                kiểu khác nhau, hiện hết mọi ô sẽ rối và đẻ ra trường rỗng. */}
            <div className="space-y-4">
              {muc.intro !== undefined && (
                <ODai nhan="Dẫn nhập" dongToiThieu={2} giaTri={muc.intro} doi={(v) => doiMuc(i, { intro: v })} daSua={daSua} />
              )}
              {muc.items !== undefined && (
                <ODanhSach nhan="Gạch đầu dòng" danhSach={muc.items} doi={(v) => doiMuc(i, { items: v })} daSua={daSua} />
              )}
              {muc.paragraphs !== undefined && (
                <ODanhSach nhan="Đoạn văn" dongToiThieu={5} danhSach={muc.paragraphs} doi={(v) => doiMuc(i, { paragraphs: v })} daSua={daSua} moTa="Mỗi dòng là một đoạn." />
              )}
              {muc.note !== undefined && (
                <ODai nhan="Ghi chú" dongToiThieu={2} giaTri={muc.note} doi={(v) => doiMuc(i, { note: v })} daSua={daSua} />
              )}
            </div>
          </div>
        ))}
      </div>
    </Khung>
  );
}

/* ================= Tin nhắn ================= */
function MucTinNhan() {
  const [ds, setDs] = useState(null);
  const [loi, setLoi] = useState("");
  const [dangTai, setDangTai] = useState(false);

  const tai = useCallback(async () => {
    setDangTai(true);
    setLoi("");
    try {
      setDs(await api.danhSachLienHe());
    } catch (err) {
      setLoi(err.message);
    } finally {
      setDangTai(false);
    }
  }, []);

  useEffect(() => {
    tai();
  }, [tai]);

  const danhDau = async (ma, daXuLy) => {
    setDs((truoc) => truoc.map((r) => (r.id === ma ? { ...r, da_xu_ly: daXuLy } : r)));
    try {
      await api.danhDauLienHe(ma, daXuLy);
    } catch (err) {
      setLoi(err.message);
      tai(); // hỏng thì tải lại cho khớp thực tế trong database
    }
  };

  const chuaXuLy = (ds ?? []).filter((r) => !r.da_xu_ly).length;

  return (
    <Khung>
      <TieuDeMuc ghiChu="Khách để lại từ form liên hệ và từ chatbot">Tin nhắn</TieuDeMuc>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink-soft">
          {ds === null ? "Đang tải…" : `${ds.length} tin · ${chuaXuLy} chưa xử lý`}
        </p>
        <button
          type="button"
          onClick={tai}
          disabled={dangTai}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-ink-soft transition-colors hover:bg-mist hover:text-ink disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${dangTai ? "animate-spin" : ""}`} aria-hidden="true" />
          Tải lại
        </button>
      </div>

      <Bang loai="loi">{loi}</Bang>

      {ds !== null && ds.length === 0 && (
        <div className="rounded-card border border-dashed border-line px-6 py-14 text-center">
          <Inbox className="mx-auto h-7 w-7 text-ink-faint" aria-hidden="true" />
          <p className="mt-3 text-sm text-ink">Chưa có ai để lại thông tin</p>
          <p className="mx-auto mt-1.5 max-w-sm text-[0.8125rem] leading-relaxed text-ink-soft">
            Tin nhắn sẽ xuất hiện ở đây khi khách gửi form Liên hệ ở trang chủ,
            hoặc để lại số điện thoại cho chatbot.
          </p>
        </div>
      )}

      {ds !== null && ds.length > 0 && (
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-medium text-ink-faint">
                <th className="px-2 py-2.5 font-medium">Thời điểm</th>
                <th className="px-2 py-2.5 font-medium">Nguồn</th>
                <th className="px-2 py-2.5 font-medium">Họ tên</th>
                <th className="px-2 py-2.5 font-medium">Liên lạc</th>
                <th className="px-2 py-2.5 font-medium">Nội dung</th>
                <th className="px-2 py-2.5 font-medium">Xong</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {ds.map((r) => (
                <tr key={r.id} className={r.da_xu_ly ? "text-ink-faint" : "text-ink"}>
                  <td className="whitespace-nowrap px-2 py-3 font-mono text-xs text-ink-faint">
                    {new Date(r.tao_luc).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-2 py-3">
                    <span
                      className={
                        "rounded-md px-2 py-0.5 text-xs font-medium " +
                        (r.nguon === "chatbot"
                          ? "bg-brand-soft text-brand"
                          : "bg-mist text-ink-soft")
                      }
                    >
                      {r.nguon}
                    </span>
                  </td>
                  <td className="px-2 py-3">{r.ho_ten || "—"}</td>
                  <td className="px-2 py-3 text-xs">
                    {r.so_dien_thoai && <div>{r.so_dien_thoai}</div>}
                    {r.email && <div className="break-all text-ink-soft">{r.email}</div>}
                    {!r.so_dien_thoai && !r.email && "—"}
                  </td>
                  <td className="max-w-sm px-2 py-3 text-xs">
                    {r.dich_vu && <div className="mb-0.5 font-medium text-brand">{r.dich_vu}</div>}
                    {r.loi_nhan || (r.dich_vu ? "" : "—")}
                  </td>
                  <td className="px-2 py-3">
                    <input
                      type="checkbox"
                      checked={r.da_xu_ly}
                      onChange={(e) => danhDau(r.id, e.target.checked)}
                      aria-label={`Đánh dấu đã xử lý tin của ${r.ho_ten || r.id}`}
                      className="h-4 w-4 cursor-pointer accent-brand"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Khung>
  );
}

/* ================= Trang chính ================= */
export default function AdminPage() {
  useDocumentTitle("Quản trị nội dung — iMob");

  const [ten, setTen] = useState(api.layTenDangNhap());
  const [muc, setMuc] = useState("tong-quan");

  const [goc, setGoc] = useState(null); // bản đã lưu trên máy chủ
  const [noiDung, setNoiDung] = useState(null); // bản đang sửa
  const [dangTai, setDangTai] = useState(false);
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState("");
  const [xong, setXong] = useState("");

  // Chặn Google lập chỉ mục. robots.txt đã chặn, thẻ này là lớp thứ hai
  // (site tĩnh nên không đặt được thẻ riêng cho từng đường dẫn lúc dựng HTML).
  useEffect(() => {
    const the = document.createElement("meta");
    the.name = "robots";
    the.content = "noindex, nofollow";
    document.head.appendChild(the);
    return () => the.remove();
  }, []);

  const taiNoiDung = useCallback(async () => {
    setDangTai(true);
    setLoi("");
    try {
      const d = await api.docNoiDung();
      setGoc(d);
      setNoiDung(d);
    } catch (err) {
      setLoi(err.message);
    } finally {
      setDangTai(false);
    }
  }, []);

  useEffect(() => {
    if (ten) taiNoiDung();
  }, [ten, taiNoiDung]);

  // Khoá nào đang khác bản đã lưu.
  const khoaDaSua = useMemo(() => {
    if (!goc || !noiDung) return [];
    return Object.keys(noiDung).filter(
      (k) => JSON.stringify(noiDung[k]) !== JSON.stringify(goc[k])
    );
  }, [goc, noiDung]);

  // Đang sửa dở mà đóng tab / bấm back thì trình duyệt hỏi lại.
  useEffect(() => {
    if (khoaDaSua.length === 0) return;
    const canh = (e) => e.preventDefault();
    window.addEventListener("beforeunload", canh);
    return () => window.removeEventListener("beforeunload", canh);
  }, [khoaDaSua.length]);

  if (!ten) return <ManHinhDangNhap khiXong={setTen} />;

  /* --------- Lưu --------- */
  const donDep = (khoa, duLieu) => {
    // Người soạn hay để lại dòng Enter thừa ở cuối các danh sách.
    if (khoa !== "legalPages") return duLieu;
    return Object.fromEntries(
      Object.entries(duLieu).map(([slug, trang]) => [
        slug,
        {
          ...trang,
          sections: (trang.sections ?? []).map((m) => ({
            ...m,
            ...(m.items ? { items: locDongTrong(m.items) } : {}),
            ...(m.paragraphs ? { paragraphs: locDongTrong(m.paragraphs) } : {}),
          })),
        },
      ])
    );
  };

  const luuTatCa = async () => {
    setDangLuu(true);
    setLoi("");
    setXong("");
    try {
      const daLuu = { ...noiDung };
      for (const khoa of khoaDaSua) {
        const sach = donDep(khoa, noiDung[khoa]);
        await api.ghiNoiDung(khoa, sach);
        daLuu[khoa] = sach;
      }
      setNoiDung(daLuu);
      setGoc(daLuu);
      setXong(
        `Đã lưu ${khoaDaSua.length} mục. Tải lại trang chủ (F5) để xem thay đổi.`
      );
      setTimeout(() => setXong(""), 6000);
    } catch (err) {
      setLoi(err.message);
      if (err.ma === 401) setTen(null);
    } finally {
      setDangLuu(false);
    }
  };

  const boThayDoi = () => setNoiDung(goc);

  /**
   * Nạp lại toàn bộ nội dung từ file JSON gốc trong mã nguồn.
   *
   * VÌ SAO CẦN NÚT NÀY: database chỉ được đổ dữ liệu từ file JSON đúng MỘT
   * LẦN, lúc khóa đó còn trống (db.py dùng ON CONFLICT DO NOTHING, cố ý — để
   * khởi động lại máy chủ không xóa mất nội dung bạn vừa sửa ở đây). Hệ quả:
   * sau này sửa file JSON trong mã nguồn rồi deploy, database vẫn giữ bản cũ
   * và phủ đè lên bản mới — website hiện nội dung cũ dù mã nguồn đã đúng. Trước
   * khi có nút này, cách sửa duy nhất là chạy tay câu DELETE trong database.
   *
   * LẤY TỪ ĐÂU: MAC_DINH, tức file JSON nằm trong bundle của chính trang này.
   * KHÔNG nhờ máy chủ đọc file, dù nghe có vẻ đúng chỗ hơn. Lý do: website
   * được dựng lại ở MỌI lần deploy nên bundle luôn là bản JSON mới nhất, còn
   * dịch vụ API có buildFilter chỉ chạy khi thư mục chatbot-python/ đổi — sửa
   * src/data thì nó không deploy lại, file trên ổ đĩa của nó vẫn là bản cũ.
   *
   * KHÔNG tự lưu: chỉ đặt vào ô nhập để các chấm "chưa lưu" sáng lên đúng
   * những mục sắp bị thay, xem lại rồi mới bấm Lưu.
   */
  const napLaiTuFileGoc = () => {
    const dong = window.confirm(
      "Nạp lại nội dung từ file gốc trong mã nguồn?\n\n" +
        "Mọi chỉnh sửa bạn từng làm trong trang quản trị sẽ bị thay bằng bản " +
        "trong mã nguồn. Danh sách tin nhắn của khách KHÔNG bị ảnh hưởng.\n\n" +
        "Chưa lưu ngay — bạn xem lại rồi mới bấm Lưu thay đổi."
    );
    if (!dong) return;

    setNoiDung((t) => ({ ...t, ...MAC_DINH }));
    setLoi("");
    setXong(
      "Đã nạp bản trong mã nguồn vào các ô. Xem lại rồi bấm Lưu thay đổi. " +
        "Không mục nào sáng chấm vàng nghĩa là database vốn đã khớp sẵn."
    );
  };

  const xuatJson = () => {
    const blob = new Blob([JSON.stringify(noiDung, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `imob-noi-dung-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const thoat = () => {
    if (khoaDaSua.length && !window.confirm("Còn thay đổi chưa lưu. Thoát luôn?")) return;
    api.dangXuat();
    setTen(null);
  };

  const dat = (khoa) => (v) => setNoiDung((t) => ({ ...t, [khoa]: v }));
  const suaKhoa = (khoa) => khoaDaSua.includes(khoa);

  /* --------- Rail trái --------- */
  const NutMuc = ({ m }) => {
    const dangChon = muc === m.id;
    const Icon = m.icon;
    return (
      <button
        type="button"
        onClick={() => setMuc(m.id)}
        aria-current={dangChon ? "page" : undefined}
        className={
          "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors " +
          (dangChon
            ? "bg-brand-soft font-medium text-brand"
            : "text-ink-soft hover:bg-panel hover:text-ink")
        }
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 font-medium">{m.nhan}</span>
        {m.khoa && suaKhoa(m.khoa) && (
          <span className="h-1.5 w-1.5 rounded-full bg-canhbao-cham" title="Chưa lưu" />
        )}
      </button>
    );
  };

  return (
    // Nền xám nhạt cho khung trang, thẻ nội dung nền trắng — kiểu trang cài
    // đặt của Apple. Trước đây khu quản trị để nền tối theo lối "xưởng sau cửa
    // hàng"; bỏ đi để cả site chỉ còn MỘT hệ thiết kế, đỡ phải nhớ hai bộ quy
    // tắc và mắt không phải thích nghi lại mỗi lần chuyển giữa hai khu.
    <div className="min-h-screen bg-mist pb-28 text-ink">
      {/* ---------- Thanh trên ---------- */}
      <header className="sticky top-0 z-20 border-b border-line bg-paper/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
          <div className="flex items-baseline gap-3">
            <span className="text-[1.0625rem] font-semibold tracking-tight text-ink">iMob</span>
            <span className="text-sm text-ink-faint">
              Quản trị nội dung
            </span>
          </div>

          <div className="flex items-center gap-1">
            <span className="mr-2 hidden text-sm text-ink-faint sm:inline">{ten}</span>
            <button
              type="button"
              onClick={napLaiTuFileGoc}
              disabled={!noiDung}
              title="Thay nội dung đang lưu bằng bản JSON trong mã nguồn"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-ink-soft transition-colors hover:bg-mist hover:text-ink disabled:opacity-40"
            >
              <FileDown className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden lg:inline">Nạp lại từ file gốc</span>
            </button>
            <button
              type="button"
              onClick={xuatJson}
              disabled={!noiDung}
              title="Tải nội dung về máy để sao lưu"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-ink-soft transition-colors hover:bg-mist hover:text-ink disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Xuất JSON</span>
            </button>
            <button
              type="button"
              onClick={thoat}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-ink-soft transition-colors hover:bg-mist hover:text-loi"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Thoát</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl gap-8 px-5 py-8 lg:grid lg:grid-cols-[13rem_1fr]">
        {/* ---------- Rail trái ---------- */}
        <nav aria-label="Mục nội dung" className="mb-8 lg:mb-0">
          <div className="lg:sticky lg:top-24">
            <div className="mb-6 space-y-0.5">
              {MUC_CHINH.map((m) => (
                <NutMuc key={m.id} m={m} />
              ))}
            </div>

            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Trang chủ
            </p>
            <div className="space-y-0.5">
              {MUC_TRANG_CHU.map((m) => (
                <NutMuc key={m.id} m={m} />
              ))}
            </div>

            <p className="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-ink-faint">
              Khác
            </p>
            <div className="space-y-0.5">
              {MUC_KHAC.map((m) => (
                <NutMuc key={m.id} m={m} />
              ))}
            </div>
          </div>
        </nav>

        {/* ---------- Nội dung ---------- */}
        <main className="min-w-0 space-y-5">
          <Bang loai="loi">{loi}</Bang>
          <Bang loai="xong">{xong}</Bang>

          {muc === "tong-quan" ? (
            <MucTongQuan noiDung={noiDung} diChuyen={setMuc} />
          ) : muc === "tin-nhan" ? (
            <MucTinNhan />
          ) : dangTai ? (
            <p className="flex items-center gap-2 py-10 text-sm text-ink-soft">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Đang tải nội dung…
            </p>
          ) : !noiDung?.[TAT_CA_MUC.find((m) => m.id === muc)?.khoa] ? (
            <Khung>
              <p className="text-sm leading-relaxed text-canhbao">
                Máy chủ chưa có dữ liệu cho mục này. Kiểm tra database đã kết nối
                chưa — mở <span className="font-mono">/health</span> của API, trường{" "}
                <span className="font-mono">database</span> phải là{" "}
                <span className="font-mono">ok</span>.
              </p>
            </Khung>
          ) : (
            <>
              {muc === "hero" && (
                <MucHero d={noiDung.hero} doi={dat("hero")} daSua={suaKhoa("hero")} />
              )}
              {muc === "about" && (
                <MucAbout d={noiDung.about} doi={dat("about")} daSua={suaKhoa("about")} />
              )}
              {muc === "lien-he" && (
                <MucLienHe d={noiDung.company} doi={dat("company")} daSua={suaKhoa("company")} />
              )}
              {muc === "san-pham" && (
                <Khung>
                  <TieuDeMuc
                    ghiChu="Thêm, sửa, xoá và đổi thứ tự sản phẩm trên trang chủ"
                    neo="/#projects"
                  >
                    Sản phẩm
                  </TieuDeMuc>
                  <MucSanPham d={noiDung.projects} doi={dat("projects")} />
                </Khung>
              )}
              {muc === "giao-dien" && (
                <MucGiaoDien
                  d={noiDung.giaoDien}
                  goc={goc?.giaoDien}
                  doi={dat("giaoDien")}
                />
              )}
              {muc === "phap-ly" && (
                <MucPhapLy
                  d={noiDung.legalPages}
                  doi={dat("legalPages")}
                  daSua={suaKhoa("legalPages")}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* ---------- Thanh lưu: CHỈ hiện khi có thay đổi ---------- */}
      {khoaDaSua.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3.5">
            <p className="flex items-center gap-2 text-sm text-ink-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-canhbao-cham" aria-hidden="true" />
              Chưa lưu:{" "}
              <span className="font-medium text-ink">
                {khoaDaSua
                  .map((k) => TAT_CA_MUC.find((m) => m.khoa === k)?.nhan ?? k)
                  .join(", ")}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={boThayDoi}
                disabled={dangLuu}
                className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm text-ink-soft transition-colors hover:bg-mist hover:text-ink disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Bỏ thay đổi
              </button>
              <button
                type="button"
                onClick={luuTatCa}
                disabled={dangLuu}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-tren-brand transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
              >
                {dangLuu ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Đang lưu…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" aria-hidden="true" />
                    Lưu thay đổi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
