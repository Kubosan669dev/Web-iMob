import { useCallback, useEffect, useState } from "react";
import { Check, Clock, Loader2, RotateCcw, X } from "lucide-react";
import * as api from "../../services/adminService.js";

// ============================================================
// MucTuLieu — hàng đợi duyệt tư liệu thành viên gửi (/admin → Tư liệu).
//
// TỰ LƯU LẤY, không đi qua thanh "Lưu thay đổi" chung ở cuối trang admin.
// Duyệt một tư liệu là một việc dứt điểm: bấm xong là xong. Gom vào nút lưu
// chung thì quản trị bấm Nhận, đóng tab, và không có gì được lưu cả.
//
// ⚠️ DUYỆT XONG CHATBOT CHƯA BIẾT NGAY (22/09/2026). Hiện mới chỉ đổi trạng
// thái trong database; bước nối vào kho kiến thức là việc riêng. Khung nhắc
// ở đầu mục nói rõ chuyện đó để không ai tưởng bot đã học xong.
// ============================================================

const CHO_DUYET = "cho_duyet";
const DA_DUYET = "da_duyet";
const TU_CHOI = "tu_choi";

const BO_LOC = [
  { ma: CHO_DUYET, nhan: "Đang chờ" },
  { ma: DA_DUYET, nhan: "Đã nhận" },
  { ma: TU_CHOI, nhan: "Đã từ chối" },
  { ma: "", nhan: "Tất cả" },
];

const DAU_HIEU = {
  [CHO_DUYET]: { Icon: Clock, lop: "bg-mist text-ink-soft", nhan: "Đang chờ" },
  [DA_DUYET]: { Icon: Check, lop: "bg-brand-soft text-brand", nhan: "Đã nhận" },
  [TU_CHOI]: { Icon: X, lop: "bg-loi-nen text-loi", nhan: "Đã từ chối" },
};

function ngayGio(chuoi) {
  if (!chuoi) return "";
  const d = new Date(chuoi);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Nhan({ trangThai }) {
  const { Icon, lop, nhan } = DAU_HIEU[trangThai] ?? DAU_HIEU[CHO_DUYET];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${lop}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {nhan}
    </span>
  );
}

function MotTuLieu({ tuLieu, onDoi, dangBan }) {
  // Ô lý do chỉ mở ra khi bấm Từ chối. Để nó hiện sẵn thì mỗi tư liệu trong
  // hàng đợi đều kéo theo một ô nhập rỗng, và mục này trở thành một bức tường
  // ô trống thay vì một danh sách đọc được.
  const [dangTuChoi, setDangTuChoi] = useState(false);
  const [lyDo, setLyDo] = useState("");

  const dayLa = tuLieu.trang_thai;

  return (
    <li className="rounded-card border border-line p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold leading-snug text-ink">{tuLieu.cau_hoi}</p>
        <Nhan trangThai={dayLa} />
      </div>

      {/* whitespace-pre-line giữ xuống dòng người gửi đã gõ. Cố ý không vẽ
          HTML — nội dung người ngoài gõ vào mà chèn thẳng là mở cửa cho XSS. */}
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
        {tuLieu.cau_tra_loi}
      </p>

      {tuLieu.ghi_chu && (
        <p className="mt-3 whitespace-pre-line rounded-lg bg-mist px-3 py-2 text-sm leading-relaxed text-ink-soft">
          <span className="font-semibold">Người gửi ghi chú: </span>
          {tuLieu.ghi_chu}
        </p>
      )}

      {dayLa === TU_CHOI && tuLieu.ly_do && (
        <p className="mt-3 rounded-lg bg-loi-nen px-3 py-2 text-sm leading-relaxed text-loi">
          <span className="font-semibold">Lý do đã gửi: </span>
          {tuLieu.ly_do}
        </p>
      )}

      <p className="mt-3 text-xs text-ink-faint">
        {tuLieu.nguoi_gui || "(tài khoản đã xoá)"} · gửi {ngayGio(tuLieu.tao_luc)}
        {tuLieu.duyet_luc
          ? ` · ${dayLa === DA_DUYET ? "nhận" : "từ chối"} ${ngayGio(tuLieu.duyet_luc)}`
          : ""}
        {tuLieu.nguoi_duyet ? ` bởi ${tuLieu.nguoi_duyet}` : ""}
      </p>

      {dangTuChoi ? (
        <div className="mt-4 rounded-lg border border-line p-3">
          <label
            htmlFor={`ly-do-${tuLieu.id}`}
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            Vì sao chưa nhận?
          </label>
          <textarea
            id={`ly-do-${tuLieu.id}`}
            rows={2}
            value={lyDo}
            onChange={(e) => setLyDo(e.target.value)}
            maxLength={500}
            placeholder="Câu trả lời chưa đúng với chính sách bảo hành hiện tại."
            className="w-full resize-y rounded-lg border border-line bg-paper px-3 py-2 text-sm leading-relaxed text-ink outline-none transition placeholder:text-ink-faint/70 focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <p className="mt-1.5 text-xs leading-relaxed text-ink-faint">
            Người gửi đọc được câu này. Nói rõ cần sửa gì thì lần sau họ gửi
            đúng, không thì họ gửi lại y hệt.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={dangBan || !lyDo.trim()}
              onClick={() => onDoi(tuLieu.id, TU_CHOI, lyDo.trim())}
              className="rounded-full bg-loi px-3.5 py-1.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              Gửi lý do
            </button>
            <button
              type="button"
              onClick={() => {
                setDangTuChoi(false);
                setLyDo("");
              }}
              className="rounded-full bg-mist px-3.5 py-1.5 text-sm font-medium text-ink transition hover:bg-line"
            >
              Thôi
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {dayLa !== DA_DUYET && (
            <button
              type="button"
              disabled={dangBan}
              onClick={() => onDoi(tuLieu.id, DA_DUYET, "")}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3.5 py-1.5 text-sm font-medium text-tren-brand transition hover:bg-brand-deep disabled:opacity-50"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              Nhận
            </button>
          )}
          {dayLa !== TU_CHOI && (
            <button
              type="button"
              disabled={dangBan}
              onClick={() => setDangTuChoi(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3.5 py-1.5 text-sm font-medium text-ink transition hover:bg-line disabled:opacity-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Từ chối
            </button>
          )}
          {dayLa !== CHO_DUYET && (
            <button
              type="button"
              disabled={dangBan}
              onClick={() => onDoi(tuLieu.id, CHO_DUYET, "")}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium text-ink-soft transition hover:text-ink disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Trả về hàng đợi
            </button>
          )}
        </div>
      )}
    </li>
  );
}

export default function MucTuLieu() {
  const [loc, setLoc] = useState(CHO_DUYET);
  const [danhSach, setDanhSach] = useState(null); // null = đang tải
  const [dem, setDem] = useState({});
  const [loi, setLoi] = useState("");
  const [dangBan, setDangBan] = useState(false);

  const nap = useCallback(async (locMoi) => {
    setDanhSach(null);
    setLoi("");
    try {
      const kq = await api.hangDoiTuLieu(locMoi || undefined);
      setDanhSach(kq?.danh_sach ?? []);
      setDem(kq?.dem ?? {});
    } catch (err) {
      setLoi(err.message);
      setDanhSach([]);
    }
  }, []);

  useEffect(() => {
    nap(loc);
  }, [loc, nap]);

  async function doiTrangThai(ma, trangThai, lyDo) {
    if (dangBan) return;
    setDangBan(true);
    setLoi("");
    try {
      await api.duyetTuLieu(ma, trangThai, lyDo);
      // Nạp lại thay vì sửa tại chỗ: đang lọc "Đang chờ" mà vừa duyệt một bài
      // thì bài đó phải biến khỏi danh sách, và con số trên các nút lọc cũng
      // phải đổi theo. Sửa tại chỗ là phải tự tính lại cả hai, dễ lệch.
      await nap(loc);
    } catch (err) {
      setLoi(err.message);
    } finally {
      setDangBan(false);
    }
  }

  return (
    <div>
      <p className="mb-4 rounded-card bg-mist px-4 py-3 text-sm leading-relaxed text-ink-soft">
        Tư liệu do thành viên gửi từ trang <span className="font-mono">/tai-khoan</span>.
        Bấm <strong>Nhận</strong> là đánh dấu dùng được;{" "}
        <strong>chatbot chưa tự học ngay</strong> — phần nối vào kho kiến thức
        làm ở bước sau.
      </p>

      <div className="mb-5 flex flex-wrap gap-2">
        {BO_LOC.map((b) => {
          const so = b.ma ? dem[b.ma] : Object.values(dem).reduce((t, n) => t + n, 0);
          return (
            <button
              key={b.ma || "tat-ca"}
              type="button"
              onClick={() => setLoc(b.ma)}
              aria-pressed={loc === b.ma}
              className={
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition " +
                (loc === b.ma
                  ? "bg-brand text-tren-brand"
                  : "bg-mist text-ink-soft hover:text-ink")
              }
            >
              {b.nhan}
              {so ? ` (${so})` : ""}
            </button>
          );
        })}
      </div>

      {loi && (
        <p
          role="alert"
          className="mb-4 rounded-card bg-loi-nen px-4 py-3 text-sm leading-relaxed text-loi"
        >
          {loi}
        </p>
      )}

      {danhSach === null ? (
        <p className="flex items-center gap-2 py-8 text-sm text-ink-soft">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Đang tải…
        </p>
      ) : danhSach.length === 0 ? (
        <p className="py-8 text-sm leading-relaxed text-ink-soft">
          {loc === CHO_DUYET
            ? "Không có tư liệu nào đang chờ. Hàng đợi sạch."
            : "Chưa có tư liệu nào ở mục này."}
        </p>
      ) : (
        <ul className="space-y-3">
          {danhSach.map((t) => (
            <MotTuLieu
              key={t.id}
              tuLieu={t}
              onDoi={doiTrangThai}
              dangBan={dangBan}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
