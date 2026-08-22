/* ================= MinhHoaThietBi =================
   Hình minh hoạ cho cột phải khối đầu trang: MỘT màn hình website, MỘT màn
   hình bản đồ số, MỘT điện thoại chạy app.

   ---- Vì sao có file này (22/08/2026) ----
   Công ty nhắn ba câu, cả ba đều nói về đúng chỗ này:
     · "đoạn này dùng hình minh họa khác đi em, ở dưới có rồi trông nó thừa ra"
     · "1 màn hiện website, 1 màn hiện bản đồ số, điện thoại thì hiện app"
     · "Lấy hình chung chung thôi nhé đừng lấy cửa dự án nào cả"

   Trước đây chỗ này mượn ẢNH CHỤP của một dự án thật. Hàng thẻ dự án ngay bên
   dưới lại trượt qua đúng ảnh đó, nên hai bên đụng nhau — chính là lỗi tôi đã
   ghi trong Hero.jsx là "không xử lý được bằng mã". Nay công ty chốt hướng
   khác hẳn: hình phải CHUNG CHUNG, không của dự án nào.

   ---- Vì sao VẼ BẰNG MÃ chứ không dùng một tấm ảnh minh hoạ ----
   1. Ảnh nào cũng là một tấm ảnh CỐ ĐỊNH màu. Site có 9 bảng màu đổi được lúc
      chạy; một tấm ảnh xanh tím sẽ chỏi ngay khi đổi sang bảng cam. Vẽ bằng
      token thì đổi bảng màu là hình đổi theo.
   2. Không vướng bản quyền, không phải nhớ hạn dùng giấy phép.
   3. Nặng khoảng 2KB thay vì 150KB một tấm .webp.

   ---- ĐỌC TRƯỚC KHI SỬA KÍCH THƯỚC ----
   · Ba thiết bị đặt bằng position:absolute theo PHẦN TRĂM của ô cha, nên ô cha
     BẮT BUỘC phải có chiều cao xác định (Hero đang cho aspect-[2/1]). Bỏ tỉ lệ
     đó đi thì ô cha cao 0 và cả hình biến mất.

   · Cả ba đều neo theo ĐÁY (bottom-…), không neo theo đỉnh. Bản dựng đầu neo
     theo đỉnh và ảnh chụp cho thấy ngay hậu quả: ba thiết bị cao thấp khác
     nhau nên chân chúng lơ lửng ở ba mức, cả cụm dồn lên góc trên bên trái và
     để trống hẳn hai góc dưới. Neo theo đáy thì chúng đứng trên cùng một mặt
     phẳng như đồ vật thật đặt trên bàn, phần chênh lệch dồn hết lên trên —
     chỗ đó là nền, trống cũng không sao.

   · Ruột từng màn hình dùng số pixel cố định chứ không dùng phần trăm: cột này
     chỉ hiện từ lg trở lên nên bề ngang chỉ dao động trong khoảng 420–500px, ở
     dải hẹp đó pixel cố định cho kết quả sắc nét và đoán trước được, còn phần
     trăm thì mỗi cỡ màn ra một tỉ lệ nét đậm nhạt khác nhau.

   Toàn bộ khối là TRANG TRÍ — aria-hidden, không có chữ nào cần đọc. Nội dung
   thật nằm ở cột chữ bên trái.
*/

/** Ghim bản đồ hình giọt nước, mũi ghim đặt đúng vào (x, y) của viewBox.

    Vẽ giọt nước chứ không vẽ chấm tròn là có lý do: bản dựng đầu dùng chấm
    tròn ở các ngã ba, ảnh chụp ra một thứ giống sơ đồ mạng máy tính hơn là bản
    đồ. Hình giọt nước thì không lẫn vào đâu được — nhìn phát biết ngay. */
function GhimBanDo({ x, y }) {
  return (
    <g transform={`translate(${x} ${y}) scale(0.78)`}>
      <path
        d="M0 0 C-4 -6 -7.5 -9.5 -7.5 -13.5 A7.5 7.5 0 1 1 7.5 -13.5 C7.5 -9.5 4 -6 0 0 Z"
        className="fill-brand"
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
        "block aspect-square rounded-[3px] " + (dam ? "bg-brand/70" : "bg-brand/25")
      }
    />
  );
}

export default function MinhHoaThietBi({ className = "" }) {
  return (
    <div className={"relative " + className} aria-hidden="true">
      {/* ============ MÀN 2 — BẢN ĐỒ SỐ ============
          Nằm SAU cùng, lệch lên và thụt sang phải. Ba thiết bị chỉ đọc được
          thành MỘT cụm khi chúng chồng lên nhau một chút; ba khối rời nhau,
          bằng nhau thì thành một dãy biểu tượng rời rạc.

          Phần bị màn hình lớn che khuất là mép TRÁI của bản đồ, nên mọi thứ
          đáng nhìn (ghim, đường trục) đều đặt lệch về nửa phải của viewBox. */}
      <div className="absolute bottom-[15%] right-0 z-0 w-[35%]">
        <div className="rounded-[0.5rem] bg-paper p-[3px] shadow-lift ring-1 ring-ink/10">
          <div className="overflow-hidden rounded-[0.35rem]">
            {/* Thanh trên: hai chấm + một vạch — đủ để mắt hiểu "đây là một cửa
                sổ phần mềm", không cần vẽ nguyên thanh địa chỉ như màn lớn. */}
            <div className="flex items-center gap-[3px] bg-line/70 px-1.5 py-[5px]">
              <span className="h-1 w-1 rounded-full bg-ink/25" />
              <span className="h-1 w-1 rounded-full bg-ink/25" />
              <span className="ml-1 h-[5px] flex-1 rounded-full bg-paper" />
            </div>

            {/* Vốn từ vựng của một tấm bản đồ, đúng bốn thứ: mảng (cây xanh,
                mặt nước) · đường (có phân cấp to nhỏ) · khối nhà · ghim.
                Thêm gì nữa ở khổ 160px cũng chỉ thành nhiễu. */}
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
              <path
                d="M-2 38 L122 32"
                className="stroke-ink/20"
                strokeWidth="6"
                fill="none"
              />
              <path
                d="M42 -2 L46 78"
                className="stroke-ink/20"
                strokeWidth="5"
                fill="none"
              />
              {/* đường chéo — thứ phá thế lưới vuông, không có nó thì hình
                  giống bàn cờ hơn giống bản đồ */}
              <path
                d="M72 -2 L118 66"
                className="stroke-ink/15"
                strokeWidth="4.5"
                fill="none"
              />
              {/* đường nhánh — mảnh hẳn để có phân cấp */}
              <path d="M-2 12 L122 7" className="stroke-ink/10" strokeWidth="2.5" fill="none" />
              <path d="M-2 60 L122 55" className="stroke-ink/10" strokeWidth="2.5" fill="none" />
              <path d="M88 -2 L84 78" className="stroke-ink/10" strokeWidth="2.5" fill="none" />

              <GhimBanDo x={62} y={44} />
              <GhimBanDo x={100} y={30} />
              <GhimBanDo x={84} y={68} />
            </svg>
          </div>
        </div>
      </div>

      {/* ============ MÀN 1 — WEBSITE ============
          Thiết bị to nhất và đặt giữa: website là mảng việc chính của công ty
          nên nó phải là thứ mắt chạm vào trước. */}
      <div className="absolute bottom-[3%] left-[12%] z-10 w-[58%]">
        <div className="rounded-[0.6rem] bg-paper p-[4px] shadow-lift ring-1 ring-ink/10">
          <div className="overflow-hidden rounded-[0.4rem] bg-mist">
            {/* thanh trình duyệt */}
            <div className="flex items-center gap-[4px] bg-line/70 px-2.5 py-[7px]">
              <span className="h-[6px] w-[6px] rounded-full bg-ink/25" />
              <span className="h-[6px] w-[6px] rounded-full bg-ink/25" />
              <span className="h-[6px] w-[6px] rounded-full bg-ink/25" />
              <span className="ml-2 h-[8px] flex-1 rounded-full bg-paper" />
            </div>

            {/* Ruột trang: một tiêu đề, một dòng chữ, ba thẻ, một chân trang —
                đúng bộ khung của mọi trang giới thiệu, không mô phỏng trang của
                khách nào. */}
            <div className="space-y-[9px] p-3.5">
              <div className="h-[13px] w-3/5 rounded-sm bg-brand" />
              <div className="h-[6px] w-2/5 rounded-sm bg-ink/15" />
              <div className="grid grid-cols-3 gap-[9px] pt-[2px]">
                <div className="h-[52px] rounded-[5px] bg-brand/25" />
                <div className="h-[52px] rounded-[5px] bg-brand/15" />
                <div className="h-[52px] rounded-[5px] bg-brand/15" />
              </div>
              <div className="flex gap-[9px] pt-[2px]">
                <div className="h-[6px] w-1/4 rounded-sm bg-ink/10" />
                <div className="h-[6px] w-1/5 rounded-sm bg-ink/10" />
                <div className="h-[6px] w-1/6 rounded-sm bg-ink/10" />
              </div>
            </div>
          </div>
        </div>

        {/* Chân đế màn hình. Dùng tren-brand mờ chứ không dùng bg-paper: chân
            đế nằm đè lên dải màu thương hiệu, để trắng đặc thì nó nặng hơn cả
            cái màn hình nó đỡ. */}
        <div className="mx-auto h-[9px] w-[13%] bg-tren-brand/25" />
        <div className="mx-auto h-[4px] w-[24%] rounded-full bg-tren-brand/25" />
      </div>

      {/* ============ ĐIỆN THOẠI — APP ============
          Đứng TRƯỚC cùng. Thiết bị nhỏ nhất đặt gần mắt nhất là cách cụm ba
          món có chiều sâu mà không phải vẽ phối cảnh. */}
      <div className="absolute bottom-[6%] left-0 z-20 w-[15%]">
        <div className="rounded-[0.6rem] bg-paper p-[3px] shadow-lift ring-1 ring-ink/10">
          <div className="overflow-hidden rounded-[0.45rem] bg-mist">
            {/* đầu app: dải màu thương hiệu + rãnh loa */}
            <div className="flex justify-center bg-brand py-[6px]">
              <span className="h-[3px] w-[40%] rounded-full bg-tren-brand/60" />
            </div>

            <div className="space-y-[6px] p-[6px]">
              {/* dải ảnh đầu app */}
              <div className="h-[20px] rounded-[3px] bg-brand/30" />

              {/* lưới chức năng — hình dáng quen thuộc của một Mini App */}
              <div className="grid grid-cols-3 gap-[5px]">
                {[true, false, false, false, true, false, false, false, true].map(
                  (dam, i) => (
                    <ONhoApp key={i} dam={dam} />
                  ),
                )}
              </div>

              {/* hai dòng danh sách */}
              <div className="space-y-[4px] pt-[2px]">
                <div className="h-[7px] rounded-sm bg-ink/10" />
                <div className="h-[7px] w-4/5 rounded-sm bg-ink/10" />
              </div>
            </div>

            {/* thanh điều hướng dưới */}
            <div className="flex items-center justify-around border-t border-line px-1 py-[5px]">
              <span className="h-[4px] w-[4px] rounded-full bg-brand" />
              <span className="h-[4px] w-[4px] rounded-full bg-ink/20" />
              <span className="h-[4px] w-[4px] rounded-full bg-ink/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
