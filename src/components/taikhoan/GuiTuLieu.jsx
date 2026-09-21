import { useEffect, useState } from "react";
import { Check, Clock, Loader2, Send, Trash2, X } from "lucide-react";
import Button from "../ui/Button.jsx";
import { OChu, OVan } from "./KhungXacThuc.jsx";
import {
  CHO_DUYET,
  DA_DUYET,
  NHAN_TRANG_THAI,
  TU_CHOI,
  guiTuLieu,
  ngayViet,
  rutLaiTuLieu,
  tuLieuCuaToi,
} from "../../services/taiKhoanService.js";

// ============================================================
// GuiTuLieu — phần chính của trang /tai-khoan.
//
// DẠNG HỎI–ĐÁP chứ không phải một ô văn bản tự do. Kho kiến thức của chatbot
// vốn đã là hỏi–đáp, nên thu đúng dạng đó thì bài được duyệt ghép thẳng vào.
// Thu văn bản tự do thì vẫn phải có người ngồi tách ra — và người đó sẽ là
// quản trị, mỗi ngày.
//
// Ô "câu hỏi" hỏi đúng một chuyện: KHÁCH hay hỏi câu gì. Người gửi hay có xu
// hướng viết thành tiêu đề ("Về bảo hành") thay vì câu hỏi thật ("Bảo hành
// bao lâu?"), nên chỗ gợi ý phải nói thẳng ra, kèm ví dụ.
// ============================================================

const DAI_CAU_HOI = 300;
const DAI_TRA_LOI = 4000;
const DAI_GHI_CHU = 1000;

const TRONG = { cauHoi: "", cauTraLoi: "", ghiChu: "" };

// Dấu hiệu trạng thái: chữ + icon + màu. KHÔNG chỉ dùng màu — người mù màu
// vẫn phải phân biệt được "đã nhận" với "chưa nhận".
const DAU_HIEU = {
  [CHO_DUYET]: { Icon: Clock, lop: "bg-mist text-ink-soft" },
  [DA_DUYET]: { Icon: Check, lop: "bg-brand-soft text-brand" },
  [TU_CHOI]: { Icon: X, lop: "bg-loi-nen text-loi" },
};

function Nhan({ trangThai }) {
  const { Icon, lop } = DAU_HIEU[trangThai] ?? DAU_HIEU[CHO_DUYET];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${lop}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {NHAN_TRANG_THAI[trangThai] ?? trangThai}
    </span>
  );
}

function MotTuLieu({ tuLieu, onRutLai, dangRut }) {
  return (
    <li className="rounded-xl border border-line p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium leading-snug text-ink">{tuLieu.cau_hoi}</p>
        <Nhan trangThai={tuLieu.trang_thai} />
      </div>

      {/* whitespace-pre-line để giữ xuống dòng người ta đã gõ. Cố ý KHÔNG vẽ
          HTML hay Markdown: nội dung do người dùng gõ mà chèn thẳng vào trang
          là mở cửa cho XSS. */}
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
        {tuLieu.cau_tra_loi}
      </p>

      {tuLieu.trang_thai === TU_CHOI && tuLieu.ly_do && (
        <p className="mt-3 rounded-lg bg-loi-nen px-3 py-2 text-sm leading-relaxed text-loi">
          <span className="font-semibold">iMob nhắn: </span>
          {tuLieu.ly_do}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-faint">
        <span>Gửi {ngayViet(tuLieu.tao_luc)}</span>
        {tuLieu.trang_thai === CHO_DUYET && (
          <button
            type="button"
            onClick={() => onRutLai(tuLieu.id)}
            disabled={dangRut}
            className="inline-flex items-center gap-1 text-ink-faint transition-colors hover:text-loi disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Rút lại
          </button>
        )}
      </div>
    </li>
  );
}

export default function GuiTuLieu() {
  const [form, setForm] = useState(TRONG);
  const [danhSach, setDanhSach] = useState(null); // null = đang tải
  const [loi, setLoi] = useState("");
  const [xong, setXong] = useState(false);
  const [dangGui, setDangGui] = useState(false);
  const [dangRut, setDangRut] = useState(false);

  useEffect(() => {
    let conHieuLuc = true;
    tuLieuCuaToi()
      .then((ds) => conHieuLuc && setDanhSach(Array.isArray(ds) ? ds : []))
      .catch(() => conHieuLuc && setDanhSach([]));
    return () => {
      conHieuLuc = false;
    };
  }, []);

  const dat = (khoa) => (e) => {
    setForm((c) => ({ ...c, [khoa]: e.target.value }));
    setLoi("");
    setXong(false);
  };

  async function gui(e) {
    e.preventDefault();
    if (dangGui) return;
    setLoi("");
    setDangGui(true);
    try {
      const moi = await guiTuLieu(form);
      // Chèn lên đầu danh sách ngay, khỏi gọi lại máy chủ lần nữa.
      setDanhSach((c) => [moi, ...(c ?? [])]);
      setForm(TRONG);
      setXong(true);
    } catch (err) {
      setLoi(err.message);
    } finally {
      setDangGui(false);
    }
  }

  async function rutLai(ma) {
    if (dangRut) return;
    setDangRut(true);
    try {
      await rutLaiTuLieu(ma);
      setDanhSach((c) => (c ?? []).filter((t) => t.id !== ma));
    } catch (err) {
      setLoi(err.message);
    } finally {
      setDangRut(false);
    }
  }

  const dangCho = (danhSach ?? []).filter((t) => t.trang_thai === CHO_DUYET).length;

  return (
    <>
      <section className="rounded-2xl border border-line bg-paper/60 p-6 sm:p-7">
        <h2 className="text-lg font-bold tracking-tight text-ink">
          Gửi tư liệu cho trợ lý ảo
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          Bạn biết điều gì mà trợ lý ảo của iMob chưa biết thì gửi vào đây. iMob
          xem lại rồi mới đưa vào — không có gì tự động lên.
        </p>

        {loi && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-loi/25 bg-loi-nen px-3.5 py-3 text-sm leading-relaxed text-loi"
          >
            {loi}
          </p>
        )}
        {xong && (
          <p
            role="status"
            className="mt-5 flex items-start gap-2 rounded-xl bg-brand-soft px-3.5 py-3 text-sm leading-relaxed text-brand"
          >
            <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Đã gửi. iMob sẽ xem và bạn thấy kết quả ngay ở danh sách bên dưới.
          </p>
        )}

        <form onSubmit={gui} className="mt-6 space-y-5">
          <OChu
            id="cau-hoi"
            nhan="Khách hay hỏi câu gì?"
            value={form.cauHoi}
            onChange={dat("cauHoi")}
            maxLength={DAI_CAU_HOI}
            dem={`${form.cauHoi.length} / ${DAI_CAU_HOI}`}
            placeholder="Zalo Mini App làm trong bao lâu?"
            goiY="Viết đúng câu khách sẽ gõ, đừng viết thành tiêu đề. Hỏi được thì bot mới nhận ra được."
            required
            disabled={dangGui}
          />
          <OVan
            id="cau-tra-loi"
            nhan="Câu trả lời đúng là gì?"
            value={form.cauTraLoi}
            onChange={dat("cauTraLoi")}
            maxLength={DAI_TRA_LOI}
            dem={`${form.cauTraLoi.length} / ${DAI_TRA_LOI}`}
            hang={6}
            goiY="Viết đủ ý để người đọc hiểu ngay. Đừng ghi giá cụ thể hay thông tin riêng của khách hàng nào."
            required
            disabled={dangGui}
          />
          <OVan
            id="ghi-chu"
            nhan="Ghi chú cho iMob (không bắt buộc)"
            value={form.ghiChu}
            onChange={dat("ghiChu")}
            maxLength={DAI_GHI_CHU}
            dem={`${form.ghiChu.length} / ${DAI_GHI_CHU}`}
            hang={2}
            goiY="Bạn biết điều này từ đâu, hoặc chỗ nào bạn chưa chắc."
            disabled={dangGui}
          />
          <Button type="submit" disabled={dangGui}>
            {dangGui ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
            {dangGui ? "Đang gửi…" : "Gửi tư liệu"}
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-line bg-paper/60 p-6 sm:p-7">
        <h2 className="text-lg font-bold tracking-tight text-ink">
          Tư liệu bạn đã gửi
          {dangCho > 0 && (
            <span className="ml-2 text-sm font-medium text-ink-faint">
              · {dangCho} đang chờ
            </span>
          )}
        </h2>

        <div className="mt-5">
          {danhSach === null ? (
            <p className="flex items-center gap-2 text-sm text-ink-soft">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Đang tải…
            </p>
          ) : danhSach.length === 0 ? (
            <p className="text-sm leading-relaxed text-ink-soft">
              Bạn chưa gửi tư liệu nào. Cái đầu tiên cứ gửi ở khung phía trên nhé.
            </p>
          ) : (
            <ul className="space-y-3">
              {danhSach.map((t) => (
                <MotTuLieu
                  key={t.id}
                  tuLieu={t}
                  onRutLai={rutLai}
                  dangRut={dangRut}
                />
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
