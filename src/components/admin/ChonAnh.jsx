import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  ImagePlus,
  Images,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import * as api from "../../services/adminService.js";
import { diaChiAnh } from "../../utils/anh.js";

// ============================================================
// Ô CHỌN ẢNH của trang quản trị.
//
// Thay cho ô gõ đường dẫn bằng tay. Công ty yêu cầu 20/08/2026: "ở phần ảnh
// tôi muốn tự thêm vào thay vì phải ném vào đường dẫn."
//
// Trước đây đổi một tấm ảnh phải: chép file vào public/anh/ → gõ
// "/anh/ten-file.webp" cho đúng từng ký tự → commit → push → chờ deploy. Gõ sai
// một dấu gạch là ảnh vỡ mà không có lời báo nào.
//
// BỐN QUYẾT ĐỊNH, và lý do:
//
// 1. NÉN NGAY TRÊN TRÌNH DUYỆT TRƯỚC KHI GỬI.
//    Ảnh chụp từ điện thoại thường 3–5MB và rộng 4000px, trong khi chỗ hiển thị
//    rộng nhất trên web chỉ khoảng 800px. Gửi nguyên bản là vừa tốn dung lượng
//    database (gói free chỉ 1GB) vừa làm khách tải trang chậm mà không đẹp hơn
//    một chút nào. Thu về tối đa 1600px rồi xuất WebP: một tấm 4MB còn khoảng
//    120KB, mắt thường không phân biệt được.
//
// 2. VẪN CHO GÕ ĐƯỜNG DẪN TAY.
//    Ảnh nằm sẵn trong public/anh/ được website phục vụ từ Vercel — nhanh và
//    không bao giờ ngủ. Ảnh tải lên đây phục vụ từ API trên Render, gói free
//    NGỦ sau 15 phút nên người đầu tiên vào sau giấc ngủ phải chờ. Vì vậy ảnh
//    quan trọng nhất (khối đầu trang) vẫn nên để trong public/anh/. Ô gõ tay
//    giữ lại cho đúng việc đó, chỉ đẩy xuống dưới vì nó là lối ít dùng hơn.
//
// 3. CÓ KHO ẢNH ĐÃ TẢI ĐỂ CHỌN LẠI.
//    Một tấm ảnh hay dùng cho nhiều chỗ. Không có kho thì mỗi chỗ lại tải lên
//    một bản, database phình gấp mấy lần vì cùng một tấm.
//
// 4. XÓA THÌ HỎI LẠI, VÀ CHỈ QUẢN TRỊ THẬT ĐƯỢC XÓA.
//    Xóa ảnh không hoàn tác được. Tài khoản dùng thử có mật khẩu công khai nên
//    máy chủ chặn hẳn quyền xóa của nó (api_anh.py) — ở đây ẩn luôn cái nút cho
//    khỏi bấm vào rồi nhận lỗi khó hiểu.
// ============================================================

// Bề rộng tối đa sau khi thu nhỏ. 1600 đủ để ảnh vẫn nét trên màn hình Retina
// ở khung rộng ~800px, mà đã bỏ được phần lớn dung lượng thừa.
const RONG_TOI_DA = 1600;
const CHAT_LUONG_WEBP = 0.82;

// Ảnh nhỏ hơn mức này thì gửi thẳng, khỏi nén. Nén lại một tấm đã nhẹ đôi khi
// còn làm nó NẶNG HƠN (ảnh PNG ít màu chẳng hạn), mà lại mất thêm một lần vẽ.
const KHOI_NEN_DUOI = 150 * 1024;

function doDoc(soByte) {
  if (soByte < 1024) return `${soByte} B`;
  if (soByte < 1024 * 1024) return `${Math.round(soByte / 1024)} KB`;
  return `${(soByte / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Thu nhỏ + chuyển sang WebP ngay trên trình duyệt.
 *
 * Trả về chính file gốc nếu không nén được (trình duyệt quá cũ, file GIF động,
 * hoặc ảnh vốn đã nhẹ) — thà gửi bản gốc còn hơn báo lỗi và chặn người ta lại.
 */
async function nenAnh(file) {
  // GIF động nén lại sẽ mất chuyển động, chỉ còn khung hình đầu tiên.
  if (file.type === "image/gif") return file;
  if (file.size <= KHOI_NEN_DUOI) return file;

  try {
    const anh = await taiAnhVaoBoNho(file);
    const tiLe = Math.min(1, RONG_TOI_DA / anh.width);

    // Ảnh đã đủ nhỏ về kích thước NHƯNG vẫn nặng (vd PNG chụp màn hình) thì
    // vẫn nên chuyển sang WebP — thường giảm được quá nửa dung lượng.
    const rong = Math.round(anh.width * tiLe);
    const cao = Math.round(anh.height * tiLe);

    const khung = document.createElement("canvas");
    khung.width = rong;
    khung.height = cao;
    const but = khung.getContext("2d");
    if (!but) return file;
    but.drawImage(anh, 0, 0, rong, cao);
    anh.close?.();

    const khoi = await new Promise((xong) =>
      khung.toBlob(xong, "image/webp", CHAT_LUONG_WEBP)
    );

    // Nén xong mà còn nặng hơn bản gốc thì giữ bản gốc.
    if (!khoi || khoi.size >= file.size) return file;

    const ten = file.name.replace(/\.[^.]+$/, "") || "anh";
    return new File([khoi], `${ten}.webp`, { type: "image/webp" });
  } catch {
    return file;
  }
}

/** Đọc file thành ảnh dùng được cho canvas.
 *  createImageBitmap nhanh hơn và không phải chờ vòng đời của thẻ <img>, nhưng
 *  Safari cũ chưa có nên vẫn giữ đường lùi. */
function taiAnhVaoBoNho(file) {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(file);
  }
  return new Promise((xong, hong) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      xong(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      hong(new Error("Không đọc được ảnh"));
    };
    img.src = url;
  });
}

/* ================= Kho ảnh đã tải ================= */
function KhoAnh({ dangChon, chon, dong }) {
  const [ds, setDs] = useState(null);
  const [loi, setLoi] = useState("");
  const [daDung, setDaDung] = useState(0);
  const [toiDa, setToiDa] = useState(0);
  const laKhachThu = api.laKhachThu();

  const nap = async () => {
    setLoi("");
    try {
      const kq = await api.danhSachAnh();
      setDs(kq.danh_sach ?? []);
      setDaDung(kq.da_dung ?? 0);
      setToiDa(kq.toi_da ?? 0);
    } catch (err) {
      setLoi(err.message);
      setDs([]);
    }
  };

  // Nạp một lần khi mở kho. `nap` dựng lại mỗi lần vẽ nên KHÔNG đưa vào mảng
  // phụ thuộc — đưa vào là gọi API vô tận.
  useEffect(() => {
    nap();
  }, []);

  const xoa = async (tam) => {
    if (
      !window.confirm(
        `Xóa ảnh "${tam.ten_goc}"?\n\nKhông hoàn tác được. Chỗ nào đang dùng ảnh này sẽ thành ô trống.`
      )
    )
      return;
    try {
      await api.xoaAnh(tam.id);
      nap();
    } catch (err) {
      setLoi(err.message);
    }
  };

  return (
    <div className="mt-3 rounded-card border border-line bg-panel p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink">Ảnh đã tải lên</p>
        <button
          type="button"
          onClick={dong}
          aria-label="Đóng kho ảnh"
          className="rounded-lg p-1 text-ink-faint transition-colors hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {loi && (
        <p role="alert" className="mb-3 rounded-xl bg-loi-nen px-3 py-2 text-[0.8125rem] text-loi">
          {loi}
        </p>
      )}

      {ds === null ? (
        <p className="flex items-center gap-2 py-4 text-sm text-ink-soft">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Đang tải danh sách…
        </p>
      ) : ds.length === 0 ? (
        <p className="py-4 text-[0.8125rem] leading-relaxed text-ink-soft">
          Chưa có ảnh nào. Bấm <span className="font-medium text-ink">Tải ảnh lên</span> ở
          trên để thêm tấm đầu tiên.
        </p>
      ) : (
        <ul className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
          {ds.map((tam) => {
            const duongDan = `/api/anh/${tam.id}`;
            const dangDung = duongDan === dangChon;
            return (
              <li key={tam.id} className="relative">
                <button
                  type="button"
                  onClick={() => chon(duongDan)}
                  title={`${tam.ten_goc} · ${doDoc(tam.kich_thuoc)}`}
                  className={
                    "block w-full overflow-hidden rounded-xl border-2 transition-colors " +
                    (dangDung ? "border-brand" : "border-transparent hover:border-line")
                  }
                >
                  <img
                    src={diaChiAnh(duongDan)}
                    alt={tam.ten_goc}
                    loading="lazy"
                    className="aspect-[16/10] w-full bg-mist object-cover"
                  />
                </button>

                {dangDung && (
                  <span className="pointer-events-none absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-tren-brand">
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </span>
                )}

                {!laKhachThu && (
                  <button
                    type="button"
                    onClick={() => xoa(tam)}
                    aria-label={`Xóa ${tam.ten_goc}`}
                    className="absolute right-1.5 top-1.5 rounded-lg bg-panel/90 p-1.5 text-ink-faint transition-colors hover:bg-loi-nen hover:text-loi"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {toiDa > 0 && (
        <p className="mt-3 text-xs text-ink-faint">
          Kho ảnh đang dùng {doDoc(daDung)} trên {doDoc(toiDa)}.
        </p>
      )}
    </div>
  );
}

/* ================= Ô chọn ảnh ================= */
export default function ChonAnh({ nhan, giaTri, doi, moTa, daSua = false }) {
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [moKho, setMoKho] = useState(false);
  const [keoVao, setKeoVao] = useState(false);
  const [anhHong, setAnhHong] = useState(false);
  const oFile = useRef(null);

  // Đổi ảnh thì phải quên trạng thái "hỏng" của ảnh trước, không thì tấm mới
  // vừa chọn đã bị báo lỗi oan.
  useEffect(() => setAnhHong(false), [giaTri]);

  const nhanFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLoi("File này không phải ảnh.");
      return;
    }

    setLoi("");
    setGhiChu("");
    setDangTai(true);
    try {
      const goc = file.size;
      const daNen = await nenAnh(file);
      const kq = await api.taiAnhLen(daNen);
      doi(kq.duong_dan);

      setGhiChu(
        daNen.size < goc
          ? `Đã tải lên. Ảnh nén từ ${doDoc(goc)} còn ${doDoc(daNen.size)}.`
          : `Đã tải lên (${doDoc(daNen.size)}).`
      );
    } catch (err) {
      setLoi(err.message);
    } finally {
      setDangTai(false);
      // Xóa giá trị ô file: không xóa thì chọn LẠI ĐÚNG file vừa rồi sẽ không
      // kích hoạt onChange (trình duyệt thấy giá trị không đổi), người dùng
      // tưởng nút hỏng.
      if (oFile.current) oFile.current.value = "";
    }
  };

  const tha = (e) => {
    e.preventDefault();
    setKeoVao(false);
    nhanFile(e.dataTransfer?.files?.[0]);
  };

  const coAnh = Boolean(giaTri);

  return (
    <div className="block">
      <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-ink-soft">
        {nhan}
        {daSua && (
          <span
            title="Đã sửa, chưa lưu"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-canhbao-cham"
          />
        )}
      </span>

      {/* ---------- Vùng xem trước + thả file ---------- */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setKeoVao(true);
        }}
        onDragLeave={() => setKeoVao(false)}
        onDrop={tha}
        className={
          "relative overflow-hidden rounded-card border-2 border-dashed transition-colors " +
          (keoVao ? "border-brand bg-brand-soft" : "border-line bg-mist")
        }
      >
        {coAnh && !anhHong ? (
          <>
            <img
              src={diaChiAnh(giaTri)}
              alt="Ảnh đang chọn"
              onError={() => setAnhHong(true)}
              className="aspect-[16/10] w-full object-cover"
            />
            <button
              type="button"
              onClick={() => doi("")}
              aria-label="Bỏ ảnh này"
              className="absolute right-2 top-2 rounded-lg bg-panel/90 p-2 text-ink-soft transition-colors hover:bg-loi-nen hover:text-loi"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </>
        ) : (
          <div className="flex aspect-[16/10] flex-col items-center justify-center gap-2 px-5 text-center">
            {anhHong ? (
              <>
                <AlertTriangle className="h-6 w-6 text-loi" aria-hidden="true" />
                <p className="text-[0.8125rem] leading-relaxed text-loi">
                  Không mở được ảnh ở đường dẫn này.
                </p>
                <p className="break-all text-xs text-ink-faint">{giaTri}</p>
              </>
            ) : (
              <>
                <ImagePlus className="h-6 w-6 text-ink-faint" aria-hidden="true" />
                <p className="text-[0.8125rem] leading-relaxed text-ink-soft">
                  Kéo ảnh thả vào đây, hoặc bấm nút bên dưới.
                </p>
              </>
            )}
          </div>
        )}

        {dangTai && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-panel/85 text-sm font-medium text-ink">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Đang tải ảnh lên…
          </div>
        )}
      </div>

      {/* ---------- Nút ---------- */}
      <div className="mt-2.5 flex flex-wrap gap-2">
        <input
          ref={oFile}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => nhanFile(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => oFile.current?.click()}
          disabled={dangTai}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-[0.8125rem] font-medium text-tren-brand transition-colors hover:bg-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Upload className="h-3.5 w-3.5" aria-hidden="true" />
          Tải ảnh lên
        </button>

        <button
          type="button"
          onClick={() => setMoKho((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-mist px-4 py-2 text-[0.8125rem] font-medium text-ink-soft transition-colors hover:text-ink"
        >
          <Images className="h-3.5 w-3.5" aria-hidden="true" />
          Chọn ảnh đã có
        </button>
      </div>

      {loi && (
        <p
          role="alert"
          className="mt-2.5 flex items-start gap-2 rounded-xl bg-loi-nen px-3.5 py-2.5 text-[0.8125rem] leading-relaxed text-loi"
        >
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {loi}
        </p>
      )}

      {ghiChu && !loi && (
        <p className="mt-2.5 rounded-xl bg-brand-soft px-3.5 py-2.5 text-[0.8125rem] text-brand">
          {ghiChu}
        </p>
      )}

      {moKho && (
        <KhoAnh
          dangChon={giaTri}
          chon={(d) => {
            doi(d);
            setMoKho(false);
            setGhiChu("");
            setLoi("");
          }}
          dong={() => setMoKho(false)}
        />
      )}

      {/* ---------- Đường dẫn tay ---------- */}
      <details className="mt-2.5">
        <summary className="cursor-pointer text-[0.8125rem] text-ink-faint transition-colors hover:text-ink-soft">
          Hoặc gõ đường dẫn
        </summary>
        <input
          value={giaTri ?? ""}
          onChange={(e) => doi(e.target.value)}
          placeholder="/anh/ten-file.webp"
          className="mt-2 w-full rounded-xl border border-transparent bg-mist px-3.5 py-2.5 text-[0.9375rem] text-ink placeholder-ink-faint outline-none transition-colors focus:border-brand focus:bg-panel"
        />
        <span className="mt-1.5 block text-[0.8125rem] leading-relaxed text-ink-faint">
          Ảnh nằm sẵn trong <span className="font-medium text-ink-soft">public/anh/</span> tải
          nhanh hơn ảnh tải lên đây, vì nó đi cùng website chứ không qua máy chủ API.
          Ảnh ở khối đầu trang nên để loại đó.
        </span>
      </details>

      {moTa && (
        <span className="mt-1.5 block text-[0.8125rem] leading-relaxed text-ink-faint">
          {moTa}
        </span>
      )}
    </div>
  );
}
