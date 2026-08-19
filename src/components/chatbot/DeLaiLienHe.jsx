import { useState } from "react";
import { Check, ChevronRight, X } from "lucide-react";
import { API_BASE_URL } from "../../utils/constants.js";

// ============================================================
// DÒNG "ĐỂ LẠI LIÊN HỆ" TRONG KHUNG CHAT
//
// Công ty khoanh đỏ vùng ô nhập trong văn bản góp ý 19/08/2026 và ghi: "thêm 1
// dòng để khách hàng quan tâm để lại mail hoặc số điện thoại".
//
// VÌ SAO PHẢI GỬI THẬT LÊN MÁY CHỦ, KHÔNG PHẢI CHỈ NHẮN MỘT CÂU:
// thử trước khi làm, hỏi bot "tôi muốn để lại số điện thoại" thì nó trả lời
// "bạn để lại ở mục Liên hệ nhé" — tức là đá khách sang chỗ khác. Một cái nút
// dẫn tới ngõ cụt còn tệ hơn là không có nút. Ô này ghi thẳng vào database qua
// POST /api/lien-he-nhanh, xem được ngay ở /admin tab Liên hệ, đánh dấu
// nguon="chatbot" để người trực biết đây là số nhặt từ chat chứ không phải form
// đầy đủ.
//
// KHÔNG BÁO THÀNH CÔNG GIẢ: máy chủ ngủ hay database chết thì hiện lỗi thật kèm
// số hotline, để khách còn đường liên lạc khác. Đây là lỗi mà cả form liên hệ
// lẫn chỗ này đều đã từng mắc một lần.
//
// Mặc định chỉ hiện MỘT DÒNG mời. Bấm vào mới mở ô nhập — chưa quan tâm thì nó
// không chiếm chỗ của khung chat vốn đã chật.
// ============================================================

const HET_GIO_MS = 25000;

export default function DeLaiLienHe({ hotline, ghiChu }) {
  const [mo, setMo] = useState(false);
  const [giaTri, setGiaTri] = useState("");
  const [trangThai, setTrangThai] = useState("cho"); // cho | dangGui | xong | loi
  const [loi, setLoi] = useState("");

  async function gui(e) {
    e.preventDefault();
    const v = giaTri.trim();
    if (!v || trangThai === "dangGui") return;

    setTrangThai("dangGui");
    setLoi("");

    const controller = new AbortController();
    const hen = setTimeout(() => controller.abort(), HET_GIO_MS);

    try {
      const res = await fetch(`${API_BASE_URL}/api/lien-he-nhanh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ lien_he: v, ghi_chu: ghiChu ?? "" }),
      });

      // Trang tĩnh có luật SPA rewrite nên đường dẫn lạ vẫn trả index.html kèm
      // mã 200. Không kiểm kiểu nội dung thì ta báo "đã gửi" trong khi chẳng có
      // máy chủ nào nhận.
      const laJson = (res.headers.get("content-type") || "").includes("application/json");

      if (res.ok && laJson) {
        setTrangThai("xong");
        return;
      }

      let tin = `Chưa gửi được (mã ${res.status}).`;
      if (laJson) {
        const d = await res.json().catch(() => null);
        if (d?.detail) tin = typeof d.detail === "string" ? d.detail : tin;
      }
      setLoi(tin);
      setTrangThai("loi");
    } catch (err) {
      setLoi(
        err.name === "AbortError"
          ? "Máy chủ phản hồi chậm quá."
          : "Không kết nối được tới máy chủ."
      );
      setTrangThai("loi");
    } finally {
      clearTimeout(hen);
    }
  }

  if (trangThai === "xong") {
    return (
      <p className="flex items-center gap-2 px-1 py-2 text-[12.5px] text-ink-soft">
        <Check className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
        Đã nhận liên hệ của bạn. Bên mình sẽ gọi lại sớm nhé!
      </p>
    );
  }

  if (!mo) {
    return (
      <button
        type="button"
        onClick={() => setMo(true)}
        className="group flex w-full items-center gap-1.5 px-1 py-2 text-left text-[12.5px] text-ink-soft transition-colors hover:text-brand"
      >
        Quan tâm? Để lại số điện thoại hoặc email, iMob gọi lại
        <ChevronRight
          className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </button>
    );
  }

  return (
    <form onSubmit={gui} className="px-1 py-2">
      <div className="flex items-center gap-1.5">
        <input
          type="text"
          value={giaTri}
          autoFocus
          onChange={(e) => setGiaTri(e.target.value)}
          disabled={trangThai === "dangGui"}
          placeholder="Số điện thoại hoặc email của bạn"
          aria-label="Số điện thoại hoặc email"
          className="min-w-0 flex-1 rounded-card bg-ink/5 px-3 py-2 text-[13px] text-ink outline-none transition-shadow placeholder:text-ink-faint focus:ring-2 focus:ring-brand/35 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!giaTri.trim() || trangThai === "dangGui"}
          className="shrink-0 rounded-card bg-brand px-3 py-2 text-[13px] font-medium text-tren-brand transition-opacity hover:opacity-90 disabled:opacity-30"
        >
          {trangThai === "dangGui" ? "Đang gửi…" : "Gửi"}
        </button>
        <button
          type="button"
          onClick={() => setMo(false)}
          aria-label="Đóng ô để lại liên hệ"
          className="shrink-0 rounded-[0.7rem] p-1.5 text-ink-faint transition-colors hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {trangThai === "loi" && (
        <p className="mt-1.5 text-[12px] text-loi">
          {loi} Bạn gọi giúp mình <span className="font-semibold">{hotline}</span> nhé.
        </p>
      )}
    </form>
  );
}
