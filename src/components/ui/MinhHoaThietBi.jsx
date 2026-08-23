import { Bot, Cpu, ShieldCheck } from "lucide-react";
import { diaChiAnh } from "../../utils/anh.js";

/* ================= MinhHoaThietBi =================
   Hình minh hoạ cho cột phải khối đầu trang: MỘT màn hình website, MỘT màn
   hình bản đồ số, MỘT điện thoại chạy app — cộng mấy ô biểu tượng nổi quanh
   cụm. Khung máy vẽ bằng mã, RUỘT MÀN HÌNH là ẢNH CHỤP THẬT.

   ---- Vì sao có file này (22/08/2026) ----
   Công ty nhắn ba câu, cả ba đều nói về đúng chỗ này:
     · "đoạn này dùng hình minh họa khác đi em, ở dưới có rồi trông nó thừa ra"
     · "1 màn hiện website, 1 màn hiện bản đồ số, điện thoại thì hiện app"
     · "Lấy hình chung chung thôi nhé đừng lấy cửa dự án nào cả"

   ---- BẢN 3 (23/08/2026): ruột màn hình đổi sang ẢNH CHỤP THẬT ----
   Bản 1 và 2 vẽ ruột màn hình bằng mã: mấy vạch xám, mấy ô màu, một tấm bản đồ
   SVG. Công ty xem rồi gửi lại ba ảnh — ảnh maket mẫu, ảnh chụp trang Yên Tử
   thật, và ảnh chụp bản dựng của tôi — kèm câu: "có thể để ảnh như này được k
   chứ nhìn như v không chuyên nghiệp".

   Họ đúng, và lỗi nằm ở chỗ tôi hiểu sai câu dặn cũ. "Lấy hình chung chung" là
   nói về việc ĐỪNG BÊ NGUYÊN một tấm ảnh dự án làm banner — thứ đã trùng với
   hàng thẻ dự án bên dưới. Nó không có nghĩa là ruột màn hình phải là hình vẽ
   trừu tượng. Một cái khung máy tính bên trong toàn vạch xám thì đọc ra là
   "chưa có gì để khoe", đúng như họ nói.

   Nay: KHUNG MÁY vẫn vẽ bằng mã (co giãn được, không cần ảnh, đổ bóng theo
   bảng màu), còn RUỘT là ảnh chụp sản phẩm thật của iMob.

   ⚠️ CHẤP NHẬN MỘT ĐÁNH ĐỔI, ghi ra đây để sau này không ai tưởng là lỗi:
   1. Ảnh chụp có MÀU CỐ ĐỊNH. Trang Yên Tử màu xanh lá, bản đồ Đông Triều màu
      nâu vàng — chúng không đổi theo 10 bảng màu của site. Chấp nhận được, vì
      mắt đọc chúng là "nội dung đang hiện trên một cái màn hình", mà nội dung
      trên màn hình thì không có lý do gì phải cùng tông với trang web đang bao
      quanh nó. Chính ảnh maket công ty gửi cũng vậy: nền xanh dương, trong màn
      hình là trang Yên Tử xanh lá.
   2. Ba ảnh này CŨNG XUẤT HIỆN ở hàng thẻ dự án bên dưới. Đây đúng là thứ công
      ty từng chê "ở dưới có rồi trông nó thừa ra" — nhưng lần đó là một tấm
      ảnh dự án phóng to nguyên khổ làm banner. Ở đây chúng nằm trong khung máy,
      bề ngang chừng 250px, đọc ra là bằng chứng "bên mình dựng màn hình thật"
      chứ không đọc ra là một mục dự án. Ảnh maket công ty gửi làm đúng như vậy.

   ---- Vì sao KHUNG MÁY vẫn vẽ bằng mã ----
   1. Khung vẽ bằng token thì đổi bảng màu là viền, bóng, chân đế đổi theo.
   2. Không vướng bản quyền một tấm maket mua sẵn.
   3. Nhẹ. Cả cụm chỉ tốn đúng ba tấm ảnh ruột (~67KB), không có tấm maket
      500KB nào.

   ---- ẢNH RUỘT: cắt sẵn, KHÔNG dùng lại ảnh của hàng thẻ dự án ----
   public/anh/hero/ có ba tấm cắt riêng, mỗi tấm đúng 2 lần cỡ hiển thị:
     hero-web.webp    520x325   trang Yên Tử  (từ website-phuong-yen-tu.webp)
     hero-bando.webp  400x250   bản đồ số Đông Triều
     hero-app.webp    217x288   Zalo Mini App Yên Tử Số
   Cộng lại ~67KB. Dùng thẳng ảnh của hàng thẻ thì nhẹ tệp hơn (đỡ ba tệp) —
   nhưng ba tệp đó nặng 223KB và khối đầu trang phải tải NGAY, còn hàng thẻ thì
   tải trễ. Đổi 67KB tải ngay lấy 223KB tải ngay là lời.
   Cắt lại bằng:  python scripts/cat-anh-hero.py

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
     khổ tham chiếu). Bản trước ghim px, đo ra tràn khung ở màn 1024.

   · TỔNG CHIỀU CAO CỤM PHẢI LỌT KHUNG HẸP NHẤT, không phải khung ở màn 1440.
     Bốn khổ đã đo (rộng × cao của khung): 1024→375×161 · 1152→429×184 ·
     1440→484×207 · 1920→477×239. Khổ 1024 chật nhất theo chiều cao so với
     ruột. Đổi tỉ lệ một màn hình thì đo lại đúng khổ đó.

   · TỈ LỆ MÀN HÌNH LỚN LÀ 16/9 CHỨ KHÔNG PHẢI 16/10, và đó là số đo: 16/10 thì
     ở màn 1024 cả cụm cao 165px trong khung chỉ cao 161px — tràn, bị
     overflow-hidden của Hero cắt cụt đỉnh.

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
      bên cạnh; bê nguyên nhãn sang đây là nói hai lần trong cùng khung hình.
   2. KHÔNG ĐỌC ĐƯỢC. Cột này rộng 420–500px. Một ô "GIS & Bản đồ số" phải co
      chữ xuống ~9px mới vừa. Dưới ngưỡng đọc của chính site này, mà lại là
      khối aria-hidden nên trình đọc màn hình cũng không lấy được gì bù lại.

   Vậy nên các ô ở đây chỉ mang HÌNH, và cố ý chọn đúng những mảng mà ba màn
   hình KHÔNG cho thấy được — trợ lý AI, an toàn thông tin, IoT. Màn hình lo
   phần "sản phẩm trông ra sao", ô biểu tượng lo phần "còn làm được gì nữa".

   Muốn có nhãn chữ như ảnh mẫu thì phải nới cột phải rộng ra — mà cột đó đang
   bị ghim theo chiều cao cột chữ bên trái (xem ghi chú tỉ lệ 2/1 trong
   Hero.jsx), nới là khối đầu trang cao thêm. Đó là đánh đổi của công ty. */
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
            Hai vệt mờ nằm SAU tất cả (z-0). Không có chúng thì ba thiết bị
            dán phẳng lên nền. Dùng brand và accent chứ không dùng mã màu:
            bảng nào cũng ra quầng đúng tông của bảng đó. */}
        <div className="pointer-events-none absolute -left-6 top-[-8%] z-0 h-[55%] w-[45%] rounded-full bg-brand/20 blur-2xl" />
        <div className="pointer-events-none absolute -right-4 bottom-[-12%] z-0 h-[70%] w-[55%] rounded-full bg-accent/25 blur-2xl" />

        {/* ============ MÀN 1 — WEBSITE ============
            Thiết bị to nhất và đặt giữa: website là mảng việc chính của công
            ty nên nó phải là thứ mắt chạm vào trước. */}
        <div className="absolute bottom-[8%] left-[12%] z-10 w-[52%]">
          <div className="rounded-[0.96em] bg-paper p-[0.4em] shadow-lift ring-1 ring-ink/10">
            <div className="overflow-hidden rounded-[0.64em] bg-mist">
              {/* Thanh trình duyệt vẫn VẼ chứ không nằm trong ảnh chụp: ảnh
                  chụp là ảnh nội dung trang, không có thanh địa chỉ. Ba chấm
                  cộng một vạch dài là thứ làm mắt đọc ngay ra "đây là một
                  trang web", không phải một tấm ảnh phong cảnh. */}
              <div className="flex items-center gap-[0.4em] bg-line/70 px-[1em] py-[0.6em]">
                <span className="h-[0.5em] w-[0.5em] rounded-full bg-ink/25" />
                <span className="h-[0.5em] w-[0.5em] rounded-full bg-ink/25" />
                <span className="h-[0.5em] w-[0.5em] rounded-full bg-ink/25" />
                <span className="ml-[0.8em] h-[0.7em] flex-1 rounded-full bg-paper" />
              </div>

              {/* object-top: phần trên của một trang chủ (thanh menu + tiêu đề
                  lớn) mới là thứ đọc ra "một website". Căn giữa là rơi vào
                  khoảng giữa trang, chỗ nào cũng giống chỗ nào. */}
              <img
                src={diaChiAnh("/anh/hero/hero-web.webp")}
                alt=""
                decoding="async"
                className="block aspect-[16/9] w-full object-cover object-top"
              />
            </div>
          </div>

          {/* Chân đế màn hình. Dùng tren-brand mờ chứ không dùng bg-paper: chân
              đế nằm đè lên dải màu thương hiệu, để trắng đặc thì nó nặng hơn
              cả cái màn hình nó đỡ. */}
          <div className="mx-auto h-[0.8em] w-[12%] bg-tren-brand/25" />
          <div className="mx-auto h-[0.4em] w-[22%] rounded-full bg-tren-brand/25" />
        </div>

        {/* ============ MÀN 2 — BẢN ĐỒ SỐ, trên một chiếc laptop ============
            Đứng TRƯỚC màn hình lớn và lệch phải:
              · ba thiết bị chỉ đọc được thành MỘT cụm khi chúng đè lên nhau;
              · có thêm một dáng thiết bị thứ ba (laptop) thì cụm giàu hơn hẳn
                so với hai khung chữ nhật giống nhau. */}
        <div className="absolute bottom-[5%] right-0 z-20 w-[40%]">
          {/* nắp máy */}
          <div className="rounded-[0.72em] bg-paper p-[0.4em] shadow-lift ring-1 ring-ink/10">
            <img
              src={diaChiAnh("/anh/hero/hero-bando.webp")}
              alt=""
              decoding="async"
              className="block aspect-[16/10] w-full rounded-[0.48em] object-cover"
            />
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
            {/* ⚠️ Ảnh nguồn có tỉ lệ 0,75 còn ô này 0,5 — object-cover sẽ cắt
                bớt hai bên. Cố ý, và đây là lựa chọn ít tệ nhất: ảnh chụp app
                công ty gửi đã bị cắt cụt phần dưới từ lúc ghép vào thẻ dự án,
                bản gốc cao 871×1884 không còn trên máy. Ở bề ngang ~60px thì
                mất 30% hai mép không nhìn ra được, còn nếu thu cho vừa cả bề
                ngang thì điện thoại lùn tịt, hết ra dáng điện thoại.
                Có lại ảnh gốc thì cắt lại tỉ lệ 1/2 rồi bỏ ghi chú này. */}
            <img
              src={diaChiAnh("/anh/hero/hero-app.webp")}
              alt=""
              decoding="async"
              className="block aspect-[1/2] w-full rounded-[0.72em] object-cover object-top"
            />
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
