import {
  Bot,
  Calendar,
  CreditCard,
  Cpu,
  FileText,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Ticket,
} from "lucide-react";

/* ================= MinhHoaThietBi =================
   Hình minh hoạ cho cột phải khối đầu trang: MỘT màn hình website, MỘT màn
   hình bản đồ số, MỘT điện thoại chạy app, cộng mấy ô biểu tượng nổi.
   TẤT CẢ vẽ bằng mã — không có một tấm ảnh chụp nào.

   ---- Ba câu công ty dặn về đúng chỗ này ----
     · "đoạn này dùng hình minh họa khác đi em, ở dưới có rồi trông nó thừa ra"
     · "1 màn hiện website, 1 màn hiện bản đồ số, điện thoại thì hiện app"
     · "Lấy hình chung chung thôi nhé đừng lấy cửa dự án nào cả"  (nhắc lại
       lần hai ngày 23/08/2026, sau khi tôi thử lắp ảnh chụp dự án thật vào)

   ---- BA BẢN DỰNG, VÀ VÌ SAO BẢN NÀY KHÁC HAI BẢN TRƯỚC ----
   Bản 1–2: vẽ bằng mã, ruột màn hình là mấy vạch xám nhạt. Công ty chê "nhìn
            như v không chuyên nghiệp".
   Bản 3:   lắp ảnh chụp thật của ba dự án vào ruột. Công ty nhắc lại "Lấy hình
            chung chung thôi nhé" — tức là KHÔNG dùng ảnh dự án.
   Bản 4 (bản này): vẽ bằng mã, nhưng ĐỘ CHI TIẾT CAO.

   Hai yêu cầu đó không mâu thuẫn, và chỗ tôi làm sai ở bản 1–2 không phải là
   "vẽ thay vì chụp" mà là VẼ QUÁ SƠ SÀI. Thứ làm một maket trông nghiệp dư
   không phải nét vẽ, mà là:
     · toàn vạch xám thay cho nội dung  -> đọc ra "chưa có gì để khoe"
     · tương phản thấp, màu nhợt        -> đọc ra "bản nháp"
     · thưa thớt, nhiều khoảng trống    -> đọc ra "giao diện chưa làm xong"
   Phần mềm thật thì DÀY và CÓ MÀU: thanh điều hướng có logo và nút bấm, trang
   chủ có dải bìa chuyển sắc, thẻ dịch vụ có ô biểu tượng màu, app có lưới
   chức năng nhiều màu, bản đồ có nước xanh cây xanh đường trắng.

   Nên bản này giữ nguyên nguyên tắc "vẽ bằng mã, chung chung, không của dự án
   nào", chỉ nâng độ chi tiết lên mức của một giao diện thật.

   ---- Vì sao VẼ BẰNG MÃ chứ không mua một tấm maket ----
   1. Đổi bảng màu là hình đổi theo. Site có 10 bảng; một tấm ảnh cố định màu
      sẽ chỏi ở chín bảng còn lại.
   2. Không vướng bản quyền, không phải nhớ hạn dùng giấy phép.
   3. Nặng ~5KB thay vì 200–500KB một tấm maket.

   ⚠️ NGOẠI LỆ MÀU DUY NHẤT: nền bản đồ (đất, nước, cây, nhà) dùng mã màu ghim
   cứng chứ không dùng token — xem ghi chú ở khối bản đồ. Mọi chỗ khác chỉ dùng
   token.

   ---- ĐỌC TRƯỚC KHI SỬA KÍCH THƯỚC ----
   · Ba thiết bị đặt bằng position:absolute theo PHẦN TRĂM của ô cha, nên ô cha
     BẮT BUỘC phải có chiều cao xác định (Hero đang cho aspect-[2/1], và
     aspect-[21/9] trên màn thấp). Bỏ tỉ lệ đó đi thì ô cha cao 0 và cả hình
     biến mất.

   · Cả ba đều neo theo ĐÁY (bottom-…), không neo theo đỉnh. Bản dựng đầu neo
     theo đỉnh và ảnh chụp cho thấy ngay hậu quả: ba thiết bị cao thấp khác
     nhau nên chân chúng lơ lửng ở ba mức. Neo theo đáy thì chúng đứng trên
     cùng một mặt phẳng như đồ vật thật đặt trên bàn, phần chênh lệch dồn hết
     lên trên — chỗ đó dành cho quầng sáng và mấy ô biểu tượng nổi.

   · Ruột màn hình tính bằng `em`, KHÔNG bằng px — xem ghi chú ở lớp đặt cỡ chữ
     theo cqw trong phần dựng hình. Quy tắc đọc: nhân 10 ra px (0.9em là 9px ở
     khổ tham chiếu 484px).

   · TỔNG CHIỀU CAO CỤM PHẢI LỌT KHUNG HẸP NHẤT, không phải khung ở màn 1440.
     Các khổ đã đo (rộng × cao của khung): 1024→375×161 · 1152→429×184 ·
     1440→484×207 · 1920→477×239. Khổ 1024 chật nhất theo chiều cao so với
     ruột. Thêm một hàng vào màn hình lớn thì đo lại đúng khổ đó.

   Toàn bộ khối là TRANG TRÍ — aria-hidden, không có chữ nào cần đọc. Nội dung
   thật nằm ở cột chữ bên trái.
*/

/* ---- Các ô biểu tượng nổi quanh cụm thiết bị ----

   ⚠️ CỐ Ý KHÔNG CÓ CHỮ, dù ảnh mẫu công ty gửi thì ô nào cũng kèm nhãn
   ("Zalo Mini App", "AI Chatbot", "GIS & Bản đồ số"…). Hai lý do, cả hai đều
   đo được chứ không phải sở thích:

   1. TRÙNG CHỮ. Ngay bên trái hình này, cách chừng 300px, đã có hàng viên
      thuốc DaiCongNghe liệt kê đúng những cụm đó: AI · Zalo Mini App · GIS ·
      Website · IoT · Digital Platform (hero.json → tuKhoaDong).
   2. KHÔNG ĐỌC ĐƯỢC. Cột này rộng 420–500px. Một ô "GIS & Bản đồ số" phải co
      chữ xuống ~9px mới vừa — dưới ngưỡng đọc của chính site này, mà lại là
      khối aria-hidden nên trình đọc màn hình cũng không lấy được gì bù lại.

   Vậy nên các ô ở đây chỉ mang HÌNH, và cố ý chọn đúng những mảng mà ba màn
   hình KHÔNG cho thấy được — trợ lý AI, an toàn thông tin, IoT. */
const CHIP = [
  // Cả ba nằm ở BĂNG TRÊN — dải trống duy nhất còn lại sau khi ba thiết bị neo
  // hết xuống đáy. Ba mức top khác nhau (6% · 0 · 10%) cho một đường vòng cung
  // nhẹ; cùng một mức thì thành một hàng ngang cứng đờ.
  //
  // nhip/tre lệch nhau cố ý: cùng chu kỳ thì ba ô nhấp nhô đồng loạt như một
  // khối, mất hẳn cảm giác từng ô trôi độc lập.
  { Icon: Bot, mau: "text-brand", viTri: "left-[1%] top-[6%]", nhip: "6.5s", tre: "0s" },
  { Icon: ShieldCheck, mau: "text-accent", viTri: "left-[36%] top-0", nhip: "7.5s", tre: "1.7s" },
  { Icon: Cpu, mau: "text-accent", viTri: "right-[4%] top-[10%]", nhip: "7s", tre: "0.9s" },
];

function ChipNoi({ Icon, mau, viTri, nhip, tre }) {
  return (
    <span
      className={
        "absolute z-40 flex h-[3em] w-[3em] items-center justify-center rounded-[1em] " +
        "bg-paper shadow-lift ring-1 ring-ink/5 animate-troi motion-reduce:animate-none " +
        viTri
      }
      style={{ animationDuration: nhip, animationDelay: tre }}
    >
      <Icon className={"h-[1.5em] w-[1.5em] " + mau} aria-hidden="true" />
    </span>
  );
}

/** Một thẻ dịch vụ trong màn hình website: ô biểu tượng màu + hai vạch chữ.

    Ô biểu tượng CÓ MÀU ĐẶC là chi tiết quan trọng nhất của cả cái thẻ. Bản
    trước để một chấm nhỏ nhạt và hàng thẻ đọc ra thành ba ô xám — mắt bắt
    mảng màu trước khi kịp nhận ra hình gì. */
function TheDichVu({ Icon, nen }) {
  return (
    <div className="rounded-[0.4em] bg-paper p-[0.5em] ring-1 ring-ink/8">
      <span
        className={"flex h-[1.5em] w-[1.5em] items-center justify-center rounded-[0.35em] " + nen}
      >
        <Icon className="h-[0.9em] w-[0.9em] text-tren-brand" strokeWidth={2.6} aria-hidden="true" />
      </span>
      <span className="mt-[0.45em] block h-[0.28em] w-full rounded-full bg-ink/22" />
      <span className="mt-[0.25em] block h-[0.28em] w-3/5 rounded-full bg-ink/12" />
    </div>
  );
}

/** Một ô chức năng trong lưới của Zalo Mini App: vuông bo góc, màu đặc, hình
    trắng ở giữa. Đây là hình dáng ai cũng nhận ra ngay là một mini app. */
function ONhoApp({ Icon, nen }) {
  return (
    <span className={"flex aspect-square items-center justify-center rounded-[0.28em] " + nen}>
      <Icon className="h-[0.62em] w-[0.62em] text-tren-brand" strokeWidth={2.8} aria-hidden="true" />
    </span>
  );
}

/** Ghim bản đồ hình giọt nước, mũi ghim đặt đúng vào (x, y) của viewBox.

    Vẽ giọt nước chứ không vẽ chấm tròn là có lý do: bản dựng đầu dùng chấm
    tròn ở các ngã ba, ảnh chụp ra một thứ giống sơ đồ mạng máy tính hơn là bản
    đồ. Hình giọt nước thì không lẫn vào đâu được — nhìn phát biết ngay. */
function GhimBanDo({ x, y, mauNhan = false }) {
  return (
    <g transform={`translate(${x} ${y}) scale(0.72)`}>
      <path
        d="M0 0 C-4 -6 -7.5 -9.5 -7.5 -13.5 A7.5 7.5 0 1 1 7.5 -13.5 C7.5 -9.5 4 -6 0 0 Z"
        className={mauNhan ? "fill-accent" : "fill-brand"}
        stroke="#ffffff"
        strokeWidth="1.8"
      />
      <circle cx="0" cy="-13.5" r="2.6" fill="#ffffff" />
    </g>
  );
}

export default function MinhHoaThietBi({ className = "" }) {
  return (
    // @container biến khung này thành MỐC ĐO cho đơn vị cqw bên trong.
    <div className={"@container relative " + className} aria-hidden="true">
      {/* ---- Lớp đặt CỠ CHỮ cho cả hình — đọc trước khi sửa bất kỳ số nào ----

          Cả hình không có một chữ nào, nhưng vẫn phải đặt cỡ chữ ở đây, vì mọi
          kích thước bên dưới đều tính bằng `em` — tức là theo cỡ chữ này.

          2.0661cqw = 2,0661% bề ngang khung. Ở khung 484px (màn 1440) ra đúng
          10px, nên QUY TẮC ĐỌC SỐ rất dễ: 0.9em là 9px, 3em là 30px.

          ⚠️ Vì sao KHÔNG dùng thẳng px: khung này rộng 375px ở màn 1024 và
          484px ở màn 1440. Ghim px thì ruột không co theo, và ở 1024 màn hình
          website cao hơn cả khung — đo ra tràn 22px, bị overflow-hidden của
          Hero cắt cụt mất đỉnh. Lỗi này chỉ lộ khi đo.

          ⚠️ Lớp đặt cỡ chữ phải là lớp CON, không đặt lên chính thẻ mang
          @container: đơn vị cqw đặt trên chính phần tử làm mốc thì nó không
          đo được bản thân nó, mà nhảy lên đo phần tử mốc ở ngoài. */}
      <div className="absolute inset-0 text-[2.0661cqw]">
        {/* ============ QUẦNG SÁNG ============
            Hai vệt mờ nằm SAU tất cả (z-0). Không có chúng thì ba thiết bị
            dán phẳng lên nền. Dùng brand và accent chứ không dùng mã màu:
            bảng nào cũng ra quầng đúng tông của bảng đó. */}
        <div className="pointer-events-none absolute -left-6 top-[-8%] z-0 h-[55%] w-[45%] rounded-full bg-brand/20 blur-2xl" />
        <div className="pointer-events-none absolute -right-4 bottom-[-12%] z-0 h-[70%] w-[55%] rounded-full bg-accent/25 blur-2xl" />

        {/* ============ MÀN 1 — WEBSITE ============
            Thiết bị to nhất và đặt giữa: website là mảng việc chính của công
            ty nên nó phải là thứ mắt chạm vào trước.

            Ruột là BỘ KHUNG CỦA MỌI TRANG GIỚI THIỆU — thanh điều hướng, dải
            bìa, hàng thẻ dịch vụ, chân trang — không mô phỏng trang của khách
            nào. */}
        <div className="absolute bottom-[8%] left-[12%] z-10 w-[52%]">
          <div className="rounded-[0.96em] bg-paper p-[0.4em] shadow-lift ring-1 ring-ink/10">
            <div className="overflow-hidden rounded-[0.64em] bg-mist">
              {/* thanh trình duyệt */}
              <div className="flex items-center gap-[0.35em] bg-line/70 px-[0.7em] py-[0.5em]">
                <span className="h-[0.42em] w-[0.42em] rounded-full bg-ink/25" />
                <span className="h-[0.42em] w-[0.42em] rounded-full bg-ink/25" />
                <span className="h-[0.42em] w-[0.42em] rounded-full bg-ink/25" />
                <span className="ml-[0.5em] h-[0.62em] flex-1 rounded-full bg-paper" />
              </div>

              <div className="bg-paper p-[0.7em]">
                {/* --- thanh điều hướng: ô logo, tên, bốn mục, một nút --- */}
                <div className="flex items-center gap-[0.4em]">
                  <span className="h-[0.85em] w-[0.85em] rounded-[0.22em] bg-brand" />
                  <span className="h-[0.34em] w-[1.5em] rounded-full bg-ink/45" />
                  <span className="ml-[0.5em] h-[0.26em] w-[1.1em] rounded-full bg-ink/18" />
                  <span className="h-[0.26em] w-[0.9em] rounded-full bg-ink/18" />
                  <span className="h-[0.26em] w-[1.2em] rounded-full bg-ink/18" />
                  <span className="ml-auto h-[0.85em] w-[2.2em] rounded-full bg-accent" />
                </div>

                {/* --- Dải bìa. CHUYỂN SẮC NGANG (to-r) chứ không chéo
                        (to-br): ô này rất rộng mà rất thấp, chuyển sắc chéo
                        thì điểm dừng cuối rơi vào góc dưới phải nên gần như
                        không thấy màu nhấn, cả dải đọc ra một sắc chàm. Ngang
                        thì đủ ba màu trải hết bề ngang.
                        Cố ý dùng lại đúng cặp màu
                        của dải đầu trang thật (Hero.jsx) để hình minh hoạ
                        trông như sản phẩm của chính site này.
                        Hai nút bên dưới tiêu đề — một nút đặc, một nút viền —
                        là chi tiết làm dải bìa đọc ra là TRANG CHỦ THẬT chứ
                        không phải một mảng màu. --- */}
                <div className="relative mt-[0.6em] overflow-hidden rounded-[0.45em] bg-gradient-to-r from-brand-deep via-brand to-accent px-[0.75em] py-[0.7em]">
                  {/* quầng sáng trong dải bìa, y như dải đầu trang thật */}
                  <span className="pointer-events-none absolute -right-[0.6em] -top-[1.2em] h-[2.4em] w-[2.4em] rounded-full bg-tren-brand/12 blur-[0.5em]" />
                  <span className="relative block h-[0.5em] w-[7em] rounded-full bg-tren-brand/90" />
                  <span className="relative mt-[0.3em] block h-[0.34em] w-[4.6em] rounded-full bg-tren-brand/55" />
                  <span className="relative mt-[0.55em] flex gap-[0.35em]">
                    <span className="block h-[0.8em] w-[2.1em] rounded-full bg-tren-brand" />
                    <span className="block h-[0.8em] w-[1.9em] rounded-full ring-1 ring-tren-brand/70" />
                  </span>
                </div>

                {/* --- hàng thẻ dịch vụ --- */}
                <div className="mt-[0.6em] grid grid-cols-3 gap-[0.45em]">
                  <TheDichVu Icon={MapPin} nen="bg-brand" />
                  <TheDichVu Icon={Ticket} nen="bg-accent" />
                  <TheDichVu Icon={FileText} nen="bg-brand-deep" />
                </div>

                {/* --- chân trang --- */}
                <div className="mt-[0.6em] flex gap-[0.6em] border-t border-line pt-[0.45em]">
                  <span className="h-[0.24em] w-1/4 rounded-full bg-ink/12" />
                  <span className="h-[0.24em] w-1/5 rounded-full bg-ink/12" />
                  <span className="h-[0.24em] w-1/6 rounded-full bg-ink/12" />
                </div>
              </div>
            </div>
          </div>

          {/* Chân đế màn hình. Dùng tren-brand mờ chứ không dùng bg-paper: chân
              đế nằm đè lên dải màu thương hiệu, để trắng đặc thì nó nặng hơn
              cả cái màn hình nó đỡ. */}
          <div className="mx-auto h-[0.8em] w-[12%] bg-tren-brand/25" />
          <div className="mx-auto h-[0.4em] w-[22%] rounded-full bg-tren-brand/25" />
        </div>

        {/* ============ MÀN 2 — BẢN ĐỒ SỐ, trên một chiếc laptop ============
            Đứng TRƯỚC màn hình lớn và lệch phải: ba thiết bị chỉ đọc được
            thành MỘT cụm khi chúng đè lên nhau, và thêm một dáng thiết bị thứ
            ba thì cụm giàu hơn hai khung chữ nhật giống nhau. */}
        <div className="absolute bottom-[5%] right-0 z-20 w-[40%]">
          {/* nắp máy */}
          <div className="rounded-[0.72em] bg-paper p-[0.4em] shadow-lift ring-1 ring-ink/10">
            <div className="relative overflow-hidden rounded-[0.48em]">
              {/* ⚠️ NGOẠI LỆ MÀU DUY NHẤT CỦA CẢ FILE.
                  Nền bản đồ ghim mã màu thay vì dùng token, và đây là chủ ý:
                  một tấm bản đồ phải có nước XANH LAM, cây XANH LỤC, đường
                  TRẮNG — đổi theo bảng màu thì sang bảng hồng sẽ ra bản đồ
                  nước hồng, nhìn là sai chứ không phải là "đổi tông".
                  Cách các sản phẩm GIS thật làm cũng vậy: NỀN bản đồ trung
                  tính, còn LỚP DỮ LIỆU vẽ đè lên (ghim, tuyến, thẻ số liệu)
                  mới mang màu thương hiệu. Ở đây làm đúng thế: mọi thứ trong
                  <svg> là nền, mọi thứ ngoài nó dùng token.
                  Hệ quả đã cân nhắc: ở bảng màu NỀN TỐI, màn này vẫn sáng —
                  đúng, vì ứng dụng bản đồ ngoài đời cũng sáng ở chế độ tối. */}
              <svg viewBox="0 0 120 76" className="block h-auto w-full" style={{ background: "#eceae4" }}>
                {/* mặt nước */}
                <path d="M120 0v24l-22 5-10-29z" fill="#bfdcee" />
                {/* công viên */}
                <path d="M0 76v-19l28 4 5 15z" fill="#cbe3c4" />
                <rect x="49" y="8" width="20" height="14" rx="2" fill="#cbe3c4" />

                {/* khối nhà — thứ làm khoảng trống giữa hai con đường trông
                    có người ở */}
                {[
                  [6, 26, 15, 8],
                  [24, 24, 9, 10],
                  [52, 30, 12, 7],
                  [96, 44, 14, 8],
                  [54, 46, 15, 9],
                  [10, 46, 16, 6],
                  [74, 12, 8, 8],
                ].map(([x, y, w, h]) => (
                  <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx="1.2" fill="#dcd8cf" />
                ))}

                {/* Đường có VIỀN: vẽ nét xám dày trước, nét trắng mảnh hơn đè
                    lên. Đây là thứ tách "một tấm bản đồ" khỏi "mấy cái gạch" —
                    bản trước chỉ có nét xám trơn nên nhìn ra bàn cờ. */}
                {[
                  ["M-2 40 L122 34", 7],
                  ["M42 -2 L46 78", 6],
                  ["M72 -2 L118 66", 5.5],
                ].map(([d, w]) => (
                  <path key={d} d={d} stroke="#d3cec3" strokeWidth={w} fill="none" />
                ))}
                {[
                  ["M-2 40 L122 34", 4.6],
                  ["M42 -2 L46 78", 3.8],
                  ["M72 -2 L118 66", 3.4],
                ].map(([d, w]) => (
                  <path key={`t${d}`} d={d} stroke="#ffffff" strokeWidth={w} fill="none" />
                ))}
                {/* đường nhánh — mảnh hẳn để có phân cấp */}
                {["M-2 13 L122 8", "M-2 62 L122 57", "M88 -2 L84 78"].map((d) => (
                  <path key={d} d={d} stroke="#ffffff" strokeWidth="2.2" fill="none" />
                ))}

                {/* --- LỚP DỮ LIỆU: từ đây trở xuống mới dùng màu thương hiệu --- */}
                <path
                  d="M60 46 L82 66 L99 31"
                  className="stroke-accent"
                  strokeWidth="1.7"
                  strokeDasharray="3 2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <GhimBanDo x={60} y={46} />
                <GhimBanDo x={99} y={31} mauNhan />
                <GhimBanDo x={82} y={66} />
              </svg>

              {/* ---- Thẻ số liệu đè lên bản đồ ----
                  Thứ duy nhất trong cả hình nói "có dữ liệu ở đây", và là chi
                  tiết nói "công ty công nghệ" nhanh hơn mọi hình khác. Ở khổ
                  này một thẻ bốn cột là vừa; vẽ nguyên trang dashboard ở bề
                  ngang ~190px chỉ ra một mảng lấm tấm. */}
              <div className="absolute bottom-[0.45em] left-[0.45em] rounded-[0.35em] bg-paper/95 p-[0.45em] shadow-soft ring-1 ring-ink/8">
                <span className="block h-[0.24em] w-[1.7em] rounded-full bg-ink/25" />
                <span className="mt-[0.35em] flex h-[1.3em] items-end gap-[0.22em]">
                  {[45, 68, 100, 56, 82].map((c, i) => (
                    <span
                      key={c}
                      className={
                        "block w-[0.34em] rounded-t-[0.08em] " +
                        (i === 2 ? "bg-accent" : "bg-brand/45")
                      }
                      style={{ height: `${c}%` }}
                    />
                  ))}
                </span>
              </div>
            </div>
          </div>

          {/* Đế laptop: rộng hơn nắp một chút và mỏng, đúng dáng nhìn từ phía
              trước. Không có nó thì cái nắp chỉ là một khung ảnh nữa. */}
          <div className="-ml-[5%] h-[0.6em] w-[110%] rounded-b-[0.5em] bg-paper shadow-lift ring-1 ring-ink/10" />
        </div>

        {/* ============ ĐIỆN THOẠI — ZALO MINI APP ============
            Đứng TRƯỚC cùng. Thiết bị nhỏ nhất đặt gần mắt nhất là cách cụm ba
            món có chiều sâu mà không phải vẽ phối cảnh. */}
        <div className="absolute bottom-[3%] left-0 z-30 w-[14%]">
          <div className="rounded-[0.96em] bg-paper p-[0.28em] shadow-lift ring-1 ring-ink/10">
            <div className="overflow-hidden rounded-[0.72em] bg-mist">
              {/* đầu app: dải màu thương hiệu, rãnh loa, một dòng tiêu đề */}
              <div className="bg-gradient-to-b from-brand-deep to-brand px-[0.4em] pb-[0.4em] pt-[0.35em]">
                <span className="mx-auto block h-[0.2em] w-[35%] rounded-full bg-tren-brand/50" />
                <span className="mt-[0.35em] flex items-center gap-[0.25em]">
                  <span className="h-[0.6em] w-[0.6em] rounded-full bg-tren-brand/85" />
                  <span className="h-[0.24em] w-[1.7em] rounded-full bg-tren-brand/70" />
                </span>
              </div>

              <div className="space-y-[0.42em] bg-mist p-[0.4em]">
                {/* thẻ nổi đầu app — chuyển sắc, đúng chỗ mọi mini app đặt
                    banner hoặc thẻ thời tiết */}
                <div className="rounded-[0.3em] bg-gradient-to-r from-brand to-accent p-[0.35em]">
                  <span className="block h-[0.22em] w-[70%] rounded-full bg-tren-brand/80" />
                  <span className="mt-[0.22em] block h-[0.5em] w-[45%] rounded-full bg-tren-brand" />
                </div>

                {/* lưới chức năng — hình dáng ai cũng nhận ra là mini app */}
                <div className="grid grid-cols-4 gap-[0.28em] rounded-[0.3em] bg-paper p-[0.32em]">
                  <ONhoApp Icon={FileText} nen="bg-brand" />
                  <ONhoApp Icon={Ticket} nen="bg-accent" />
                  <ONhoApp Icon={CreditCard} nen="bg-brand-deep" />
                  <ONhoApp Icon={Calendar} nen="bg-accent/75" />
                  <ONhoApp Icon={MapPin} nen="bg-brand/70" />
                  <ONhoApp Icon={MessageSquare} nen="bg-accent" />
                  <ONhoApp Icon={ShieldCheck} nen="bg-brand" />
                  <ONhoApp Icon={Bot} nen="bg-brand-deep/80" />
                </div>

                {/* hai dòng danh sách — có ảnh đại diện tròn, đúng dáng một
                    danh sách tin tức hoặc thủ tục */}
                {[1, 2].map((n) => (
                  <div key={n} className="flex items-center gap-[0.28em] rounded-[0.28em] bg-paper p-[0.28em]">
                    <span className="h-[0.75em] w-[0.75em] shrink-0 rounded-[0.18em] bg-brand-soft" />
                    <span className="min-w-0 flex-1">
                      <span className="block h-[0.2em] w-full rounded-full bg-ink/20" />
                      <span className="mt-[0.18em] block h-[0.2em] w-3/5 rounded-full bg-ink/10" />
                    </span>
                  </div>
                ))}
              </div>

              {/* thanh điều hướng dưới */}
              <div className="flex items-center justify-around bg-paper px-[0.3em] pb-[0.35em] pt-[0.3em]">
                <span className="h-[0.42em] w-[0.42em] rounded-[0.12em] bg-brand" />
                <span className="h-[0.42em] w-[0.42em] rounded-[0.12em] bg-ink/18" />
                <span className="h-[0.42em] w-[0.42em] rounded-[0.12em] bg-ink/18" />
                <span className="h-[0.42em] w-[0.42em] rounded-[0.12em] bg-ink/18" />
              </div>
            </div>
          </div>
        </div>

        {/* ============ Ô BIỂU TƯỢNG NỔI ============ */}
        {CHIP.map((c) => (
          <ChipNoi key={c.viTri} {...c} />
        ))}
      </div>
    </div>
  );
}
