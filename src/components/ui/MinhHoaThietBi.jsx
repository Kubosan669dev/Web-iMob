import { Bot, Cpu, ShieldCheck } from "lucide-react";

/* ================= MinhHoaThietBi =================
   Hình minh hoạ cho cột phải khối đầu trang: MỘT màn hình website, MỘT màn
   hình bản đồ số, MỘT điện thoại chạy app — cộng thêm mấy ô biểu tượng nổi
   quanh cụm.

   ---- Vì sao có file này (22/08/2026) ----
   Công ty nhắn ba câu, cả ba đều nói về đúng chỗ này:
     · "đoạn này dùng hình minh họa khác đi em, ở dưới có rồi trông nó thừa ra"
     · "1 màn hiện website, 1 màn hiện bản đồ số, điện thoại thì hiện app"
     · "Lấy hình chung chung thôi nhé đừng lấy cửa dự án nào cả"

   Trước đây chỗ này mượn ẢNH CHỤP của một dự án thật. Hàng thẻ dự án ngay bên
   dưới lại trượt qua đúng ảnh đó, nên hai bên đụng nhau — chính là lỗi tôi đã
   ghi trong Hero.jsx là "không xử lý được bằng mã". Nay công ty chốt hướng
   khác hẳn: hình phải CHUNG CHUNG, không của dự án nào.

   ---- BẢN 2 (22/08/2026): làm dày lên theo ảnh mẫu công ty gửi ----
   Bản 1 chỉ có ba khung xám nhạt với mấy vạch placeholder. Công ty xem rồi
   nhắn kèm một ảnh maket nền xanh đậm: "hãy thiết kế phần ảnh này trám vào
   đây chứ để mỗi máy tính minh hoạ không nhìn trông chán lắm".

   Soi ảnh mẫu đó thì thấy cái làm nó KHÔNG chán gồm bốn thứ, xếp theo mức
   đóng góp:
     1. ruột màn hình có nội dung THẬT — thanh điều hướng, dải ảnh bìa có
        chuyển sắc, hàng thẻ có chấm màu — chứ không phải mấy vạch xám;
     2. một thiết bị hiện SỐ LIỆU (biểu đồ cột), thứ nói "đây là công ty công
        nghệ" nhanh hơn mọi hình khác;
     3. chiều sâu: thiết bị đè lên nhau, có quầng sáng phía sau;
     4. các ô biểu tượng nổi rải quanh.
   Bản này làm cả bốn. Ba thứ đầu không tốn gì; thứ tư thì phải cân nhắc, xem
   khối CHIP bên dưới.

   ---- Vì sao VẼ BẰNG MÃ chứ không dùng một tấm ảnh minh hoạ ----
   1. Ảnh nào cũng là một tấm ảnh CỐ ĐỊNH màu. Site có 10 bảng màu đổi được
      lúc chạy; một tấm ảnh xanh tím sẽ chỏi ngay khi đổi sang bảng cam. Vẽ
      bằng token thì đổi bảng màu là hình đổi theo.
   2. Không vướng bản quyền, không phải nhớ hạn dùng giấy phép.
   3. Nặng khoảng 3KB thay vì 150KB một tấm .webp.

   ⚠️ KHÔNG ghim mã màu nào ở đây, kể cả để "giống ảnh mẫu hơn". Ảnh mẫu nền
   xanh navy; ghim màu đó vào thì chín bảng màu còn lại chỏi, và riêng bảng
   NỀN TỐI (midnight-crimson) thì hỏng hẳn vì ở bảng đó --color-paper là gần
   đen còn --color-brand lại là hồng SÁNG. Mọi thứ ở đây phải đúng ở cả hai
   chiều sáng/tối, nên chỉ dùng token.

   ---- ĐỌC TRƯỚC KHI SỬA KÍCH THƯỚC ----
   · Ba thiết bị đặt bằng position:absolute theo PHẦN TRĂM của ô cha, nên ô cha
     BẮT BUỘC phải có chiều cao xác định (Hero đang cho aspect-[2/1], và
     aspect-[21/9] trên màn thấp). Bỏ tỉ lệ đó đi thì ô cha cao 0 và cả hình
     biến mất.

   · Cả ba đều neo theo ĐÁY (bottom-…), không neo theo đỉnh. Bản dựng đầu neo
     theo đỉnh và ảnh chụp cho thấy ngay hậu quả: ba thiết bị cao thấp khác
     nhau nên chân chúng lơ lửng ở ba mức, cả cụm dồn lên góc trên bên trái và
     để trống hẳn hai góc dưới. Neo theo đáy thì chúng đứng trên cùng một mặt
     phẳng như đồ vật thật đặt trên bàn, phần chênh lệch dồn hết lên trên —
     chỗ đó dành cho quầng sáng và mấy ô biểu tượng nổi.

   · Ruột từng màn hình tính bằng `em`, KHÔNG bằng px — xem ghi chú ở lớp đặt
     cỡ chữ theo cqw trong phần dựng hình. Quy tắc đọc: nhân 10 ra px (0.9em
     là 9px ở khổ tham chiếu). Bản trước ghim px, đo ra tràn khung ở màn 1024.

   · TỔNG CHIỀU CAO CỤM PHẢI LỌT KHUNG HẸP NHẤT, không phải khung ở màn 1440.
     Bốn khổ đã đo (rộng × cao của khung): 1024→375×161 · 1152→429×184 ·
     1440→484×207 · 1920→477×239. Khổ 1024 là khổ chật nhất theo chiều cao so
     với ruột. Thêm một hàng vào màn hình website thì đo lại đúng khổ đó.

   Toàn bộ khối là TRANG TRÍ — aria-hidden, không có chữ nào cần đọc. Nội dung
   thật nằm ở cột chữ bên trái.
*/

/* ---- Các ô biểu tượng nổi quanh cụm thiết bị ----

   ⚠️ CỐ Ý KHÔNG CÓ CHỮ, dù ảnh mẫu công ty gửi thì ô nào cũng kèm nhãn
   ("Zalo Mini App", "AI Chatbot", "GIS & Bản đồ số"…). Hai lý do, cả hai đều
   đo được chứ không phải sở thích:

   1. TRÙNG CHỮ. Ngay bên trái hình này, cách chừng 300px, đã có hàng viên
      thuốc DaiCongNghe liệt kê đúng những cụm đó: AI · Zalo Mini App · GIS ·
      Website · IoT · Digital Platform (hero.json → tuKhoaDong). Ảnh mẫu cần
      nhãn vì nó là một tấm ảnh đứng một mình, không có hàng viên thuốc nào
      bên cạnh; bê nguyên nhãn sang đây là nói hai lần trong cùng một khung
      hình — đúng thứ công ty đã chê một lần rồi ("ở dưới có rồi trông nó
      thừa ra").
   2. KHÔNG ĐỌC ĐƯỢC. Cột này rộng 420–500px. Một ô "GIS & Bản đồ số" phải co
      chữ xuống ~9px mới vừa. Dưới ngưỡng đọc của chính site này, mà lại là
      khối aria-hidden nên trình đọc màn hình cũng không lấy được gì bù lại.

   Vậy nên các ô ở đây chỉ mang HÌNH, và cố ý chọn đúng những mảng mà ba thiết
   bị KHÔNG diễn tả được — trợ lý AI, an toàn thông tin, IoT. Màn hình lo phần
   "trông ra sao", ô biểu tượng lo phần "còn làm được gì nữa"; không mảng nào
   bị nói hai lần.

   ---- BA ô, không phải bốn ----
   Bản thử đầu có thêm một ô biểu đồ cột. Ảnh chụp cho thấy nó rơi ngay cạnh
   thẻ số liệu trên bản đồ — hai cái biểu đồ cột nằm cách nhau 40px, thành ra
   nhìn như lỗi lặp. Thẻ số liệu đã lo phần "có dữ liệu" rồi nên ô đó thừa.

   Muốn có nhãn chữ như ảnh mẫu thì phải nới cột phải rộng ra — mà cột đó đang
   bị ghim theo chiều cao cột chữ bên trái (xem ghi chú tỉ lệ 2/1 trong
   Hero.jsx), nới là khối đầu trang cao thêm. Đó là đánh đổi của công ty. */
const CHIP = [
  // Cả ba nằm ở BĂNG TRÊN — đó là dải trống duy nhất còn lại sau khi ba thiết
  // bị neo hết xuống đáy. Ba mức top khác nhau (6% · 0 · 10%) cho một đường
  // vòng cung nhẹ; cùng một mức thì thành một hàng ngang cứng đờ.
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

/** Ghim bản đồ hình giọt nước, mũi ghim đặt đúng vào (x, y) của viewBox.

    Vẽ giọt nước chứ không vẽ chấm tròn là có lý do: bản dựng đầu dùng chấm
    tròn ở các ngã ba, ảnh chụp ra một thứ giống sơ đồ mạng máy tính hơn là bản
    đồ. Hình giọt nước thì không lẫn vào đâu được — nhìn phát biết ngay. */
function GhimBanDo({ x, y, mauNhan = false }) {
  return (
    <g transform={`translate(${x} ${y}) scale(0.78)`}>
      <path
        d="M0 0 C-4 -6 -7.5 -9.5 -7.5 -13.5 A7.5 7.5 0 1 1 7.5 -13.5 C7.5 -9.5 4 -6 0 0 Z"
        className={mauNhan ? "fill-accent" : "fill-brand"}
        stroke="var(--color-paper)"
        strokeWidth="1.6"
      />
      <circle cx="0" cy="-13.5" r="2.8" className="fill-paper" />
    </g>
  );
}

/** Một ô nhỏ trong lưới chức năng của màn hình điện thoại. */
function ONhoApp({ dam }) {
  return (
    <span
      className={
        "block aspect-square rounded-[0.3em] " + (dam ? "bg-accent/80" : "bg-brand/25")
      }
    />
  );
}

/** Một thẻ trong hàng ba thẻ của màn hình website: chấm màu + hai vạch chữ.
    Chấm màu là thứ rẻ nhất để hàng thẻ thôi là ba ô xám — mắt bắt màu trước
    khi kịp nhận ra hình. */
function TheTrangWeb({ mau }) {
  return (
    <div className="rounded-[0.4em] bg-mist p-[0.5em] ring-1 ring-ink/5">
      <span className={"block h-[0.7em] w-[0.7em] rounded-[0.2em] " + mau} />
      <span className="mt-[0.5em] block h-[0.3em] w-full rounded-full bg-ink/15" />
      <span className="mt-[0.3em] block h-[0.3em] w-3/5 rounded-full bg-ink/10" />
    </div>
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
          10px, nên QUY TẮC ĐỌC SỐ rất dễ: 0.9em là 9px, 3em là 30px. Cứ nhân
          với 10.

          ⚠️ Vì sao KHÔNG dùng thẳng px như bản trước: bản trước ghim px, mà
          khung này rộng 375px ở màn 1024 và 484px ở màn 1440. Ruột không co
          theo, nên ở 1024 màn hình website cao 170px trong một khung chỉ cao
          161px — đo ra tràn 22px, và bị `overflow-hidden` của Hero cắt cụt
          mất đỉnh. Lỗi này chỉ lộ khi đo, nhìn ở 1440 thì không thấy gì.

          ⚠️ Lớp đặt cỡ chữ phải là lớp CON, không đặt lên chính thẻ mang
          @container: đơn vị cqw đặt trên chính phần tử làm mốc thì nó không
          đo được bản thân nó, mà nhảy lên đo phần tử mốc ở ngoài. */}
      <div className="absolute inset-0 text-[2.0661cqw]">
        {/* ============ QUẦNG SÁNG ============
            Hai vệt mờ nằm SAU tất cả (z-0). Không có chúng thì ba thiết bị trắng
            dán phẳng lên nền, đúng cảm giác "chán" công ty nói. Dùng brand và
            accent chứ không dùng một mã màu: bảng nào cũng ra quầng đúng tông
            của bảng đó. */}
        <div className="pointer-events-none absolute -left-6 top-[-8%] z-0 h-[55%] w-[45%] rounded-full bg-brand/20 blur-2xl" />
        <div className="pointer-events-none absolute -right-4 bottom-[-12%] z-0 h-[70%] w-[55%] rounded-full bg-accent/25 blur-2xl" />

        {/* ============ MÀN 1 — WEBSITE ============
            Thiết bị to nhất và đặt giữa: website là mảng việc chính của công ty
            nên nó phải là thứ mắt chạm vào trước. */}
        <div className="absolute bottom-[8%] left-[12%] z-10 w-[52%]">
          <div className="rounded-[0.96em] bg-paper p-[0.4em] shadow-lift ring-1 ring-ink/10">
            <div className="overflow-hidden rounded-[0.64em] bg-paper">
              {/* thanh trình duyệt */}
              <div className="flex items-center gap-[0.4em] bg-line/70 px-[1em] py-[0.6em]">
                <span className="h-[0.5em] w-[0.5em] rounded-full bg-ink/25" />
                <span className="h-[0.5em] w-[0.5em] rounded-full bg-ink/25" />
                <span className="h-[0.5em] w-[0.5em] rounded-full bg-ink/25" />
                <span className="ml-[0.8em] h-[0.7em] flex-1 rounded-full bg-paper" />
              </div>

              {/* Ruột trang: thanh điều hướng · dải ảnh bìa · ba thẻ · chân
                  trang — đúng bộ khung của mọi trang giới thiệu, không mô phỏng
                  trang của khách nào. */}
              <div className="p-[0.9em]">
                {/* thanh điều hướng: ô logo, ba mục, một nút */}
                <div className="flex items-center gap-[0.5em]">
                  <span className="h-[0.8em] w-[0.8em] rounded-[0.2em] bg-brand" />
                  <span className="h-[0.3em] w-[1.4em] rounded-full bg-ink/15" />
                  <span className="h-[0.3em] w-[1.1em] rounded-full bg-ink/15" />
                  <span className="h-[0.3em] w-[1.3em] rounded-full bg-ink/15" />
                  <span className="ml-auto h-[0.8em] w-[2.2em] rounded-full bg-accent" />
                </div>

                {/* Dải ảnh bìa — chuyển sắc HAI MÀU, cố ý dùng lại đúng cặp màu
                    của dải đầu trang thật (Hero.jsx) để hình minh hoạ trông
                    giống sản phẩm của chính site này chứ không phải của ai khác. */}
                <div className="mt-[0.7em] flex flex-col justify-center rounded-[0.5em] bg-gradient-to-r from-brand to-accent px-[0.8em] py-[0.9em]">
                  <span className="block h-[0.5em] w-1/2 rounded-full bg-tren-brand/85" />
                  <span className="mt-[0.4em] block h-[0.3em] w-1/3 rounded-full bg-tren-brand/55" />
                  <span className="mt-[0.6em] block h-[0.7em] w-[2.6em] rounded-full bg-tren-brand/90" />
                </div>

                {/* hàng ba thẻ */}
                <div className="mt-[0.7em] grid grid-cols-3 gap-[0.6em]">
                  <TheTrangWeb mau="bg-brand" />
                  <TheTrangWeb mau="bg-accent" />
                  <TheTrangWeb mau="bg-brand/50" />
                </div>

                {/* chân trang */}
                <div className="mt-[0.7em] flex gap-[0.7em] border-t border-line pt-[0.6em]">
                  <span className="h-[0.3em] w-1/4 rounded-full bg-ink/10" />
                  <span className="h-[0.3em] w-1/5 rounded-full bg-ink/10" />
                  <span className="h-[0.3em] w-1/6 rounded-full bg-ink/10" />
                </div>
              </div>
            </div>
          </div>

          {/* Chân đế màn hình. Dùng tren-brand mờ chứ không dùng bg-paper: chân
              đế nằm đè lên dải màu thương hiệu, để trắng đặc thì nó nặng hơn cả
              cái màn hình nó đỡ. */}
          <div className="mx-auto h-[0.8em] w-[12%] bg-tren-brand/25" />
          <div className="mx-auto h-[0.4em] w-[22%] rounded-full bg-tren-brand/25" />
        </div>

        {/* ============ MÀN 2 — BẢN ĐỒ SỐ, trên một chiếc laptop ============
            Bản 1 để bản đồ trong một cửa sổ nhỏ nằm SAU màn hình lớn. Nay đổi
            thành laptop đứng TRƯỚC, lệch sang phải:
              · ba thiết bị chỉ đọc được thành MỘT cụm khi chúng đè lên nhau;
                nằm sau thì bản đồ chỉ còn thấy một mẩu mép;
              · có thêm một dáng thiết bị thứ ba (laptop) thì cụm giàu hơn hẳn
                so với hai khung chữ nhật giống nhau.

            Phần bị che là mép TRÁI của bản đồ, nên mọi thứ đáng nhìn (ghim,
            đường trục, thẻ số liệu) đều đặt lệch về nửa phải. */}
        <div className="absolute bottom-[5%] right-0 z-20 w-[40%]">
          {/* nắp máy */}
          <div className="rounded-[0.72em] bg-paper p-[0.4em] shadow-lift ring-1 ring-ink/10">
            <div className="relative overflow-hidden rounded-[0.48em]">
              {/* Vốn từ vựng của một tấm bản đồ, đúng bốn thứ: mảng (cây xanh,
                  mặt nước) · đường (có phân cấp to nhỏ) · khối nhà · ghim.
                  Thêm gì nữa ở khổ này cũng chỉ thành nhiễu. */}
              <svg viewBox="0 0 120 76" className="block h-auto w-full bg-mist">
                {/* mảng cây xanh / mặt nước */}
                <path d="M120 0v26l-26 6-8-32z" className="fill-brand/12" />
                <path d="M0 76v-20l30 4 6 16z" className="fill-brand/12" />

                {/* khối nhà — đặt xen giữa các đường, đây là thứ làm khoảng trống
                    giữa hai con đường trông có người ở */}
                {[
                  [6, 20, 24, 12],
                  [52, 16, 14, 11],
                  [96, 44, 16, 9],
                  [54, 44, 18, 10],
                  [10, 46, 20, 7],
                ].map(([x, y, w, h]) => (
                  <rect
                    key={`${x}-${y}`}
                    x={x}
                    y={y}
                    width={w}
                    height={h}
                    rx="1.5"
                    className="fill-ink/10"
                  />
                ))}

                {/* đường trục — nét dày nhất */}
                <path d="M-2 38 L122 32" className="stroke-ink/20" strokeWidth="6" fill="none" />
                <path d="M42 -2 L46 78" className="stroke-ink/20" strokeWidth="5" fill="none" />
                {/* đường chéo — thứ phá thế lưới vuông, không có nó thì hình
                    giống bàn cờ hơn giống bản đồ */}
                <path d="M72 -2 L118 66" className="stroke-ink/15" strokeWidth="4.5" fill="none" />
                {/* đường nhánh — mảnh hẳn để có phân cấp */}
                <path d="M-2 12 L122 7" className="stroke-ink/10" strokeWidth="2.5" fill="none" />
                <path d="M-2 60 L122 55" className="stroke-ink/10" strokeWidth="2.5" fill="none" />
                <path d="M88 -2 L84 78" className="stroke-ink/10" strokeWidth="2.5" fill="none" />

                {/* tuyến đang theo dõi — nét đứt màu nhấn. Đây là thứ tách "bản
                    đồ số" khỏi "một tấm bản đồ giấy": có lớp dữ liệu vẽ đè lên. */}
                <path
                  d="M62 44 L84 68 L100 30"
                  className="stroke-accent"
                  strokeWidth="1.6"
                  strokeDasharray="3 3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />

                <GhimBanDo x={62} y={44} />
                <GhimBanDo x={100} y={30} mauNhan />
                <GhimBanDo x={84} y={68} />
              </svg>

              {/* ---- Thẻ số liệu đè lên bản đồ ----
                  Thứ duy nhất trong cả hình nói "có dữ liệu ở đây". Ảnh mẫu công
                  ty gửi có hẳn một laptop hiện biểu đồ; ở khổ này thì một thẻ
                  nhỏ bốn cột là vừa đủ — vẽ nguyên một trang dashboard ở bề
                  ngang ~200px chỉ ra một mảng lấm tấm. */}
              <div className="absolute bottom-[0.5em] left-[0.5em] rounded-[0.4em] bg-paper/95 p-[0.5em] shadow-soft ring-1 ring-ink/5">
                <span className="block h-[0.25em] w-[1.8em] rounded-full bg-ink/20" />
                <span className="mt-[0.4em] flex h-[1.4em] items-end gap-[0.25em]">
                  <span className="block w-[0.4em] rounded-t-[0.1em] bg-brand/40" style={{ height: "45%" }} />
                  <span className="block w-[0.4em] rounded-t-[0.1em] bg-brand/60" style={{ height: "70%" }} />
                  <span className="block w-[0.4em] rounded-t-[0.1em] bg-accent" style={{ height: "100%" }} />
                  <span className="block w-[0.4em] rounded-t-[0.1em] bg-brand/30" style={{ height: "58%" }} />
                </span>
              </div>
            </div>
          </div>

          {/* Đế laptop: rộng hơn nắp một chút và mỏng, đúng dáng nhìn từ phía
              trước. Không có nó thì cái nắp chỉ là một khung ảnh nữa. */}
          <div className="-ml-[5%] h-[0.6em] w-[110%] rounded-b-[0.5em] bg-paper shadow-lift ring-1 ring-ink/10" />
        </div>

        {/* ============ ĐIỆN THOẠI — APP ============
            Đứng TRƯỚC cùng. Thiết bị nhỏ nhất đặt gần mắt nhất là cách cụm ba
            món có chiều sâu mà không phải vẽ phối cảnh. */}
        <div className="absolute bottom-[3%] left-0 z-30 w-[13%]">
          <div className="rounded-[0.96em] bg-paper p-[0.3em] shadow-lift ring-1 ring-ink/10">
            <div className="overflow-hidden rounded-[0.72em] bg-mist">
              {/* đầu app: dải màu thương hiệu + rãnh loa */}
              <div className="flex justify-center bg-brand py-[0.6em]">
                <span className="h-[0.3em] w-[40%] rounded-full bg-tren-brand/60" />
              </div>

              <div className="space-y-[0.6em] p-[0.6em]">
                {/* dải ảnh đầu app */}
                <div className="h-[1.8em] rounded-[0.3em] bg-gradient-to-r from-brand/40 to-accent/40" />

                {/* lưới chức năng — hình dáng quen thuộc của một Mini App */}
                <div className="grid grid-cols-3 gap-[0.5em]">
                  {[true, false, false, false, true, false, false, false, true].map(
                    (dam, i) => (
                      <ONhoApp key={i} dam={dam} />
                    ),
                  )}
                </div>

                {/* hai dòng danh sách */}
                <div className="space-y-[0.4em] pt-[0.2em]">
                  <div className="h-[0.6em] rounded-[0.2em] bg-ink/10" />
                  <div className="h-[0.6em] w-4/5 rounded-[0.2em] bg-ink/10" />
                </div>
              </div>

              {/* thanh điều hướng dưới */}
              <div className="flex items-center justify-around border-t border-line px-[0.4em] py-[0.5em]">
                <span className="h-[0.4em] w-[0.4em] rounded-full bg-brand" />
                <span className="h-[0.4em] w-[0.4em] rounded-full bg-ink/20" />
                <span className="h-[0.4em] w-[0.4em] rounded-full bg-ink/20" />
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
