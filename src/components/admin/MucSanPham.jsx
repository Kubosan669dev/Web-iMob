import { useState } from "react";
import {
  ChevronDown,
  ExternalLink,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { O, ODai } from "./Fields.jsx";
import MaQR from "../ui/MaQR.jsx";
import { TEN_ICON, iconOf } from "../service/icons.js";

// ============================================================
// Mục Sản phẩm của trang quản trị — thêm / sửa / xoá / đổi thứ tự.
//
// BA QUYẾT ĐỊNH, và lý do:
//
// 1. GẤP LẠI THEO TỪNG SẢN PHẨM.
//    Mỗi sản phẩm có 7 ô nhập. Mở hết cùng lúc là một bức tường 42 ô, không ai
//    tìm nổi thứ mình cần sửa. Mặc định chỉ hiện một dòng tóm tắt; bấm mới mở.
//
// 2. ĐỔI THỨ TỰ BẰNG NÚT LÊN / XUỐNG, KHÔNG KÉO THẢ.
//    Kéo thả nhìn hiện đại hơn nhưng dùng bàn phím không được, trên điện thoại
//    hay kéo nhầm, và phải thêm thư viện. Hai cái nút thì ai cũng dùng được.
//    Thứ tự ở đây QUAN TRỌNG: sản phẩm đầu tiên chiếm trọn bề ngang ngoài trang
//    chủ, nên "đưa lên đầu" chính là "chọn sản phẩm chủ lực".
//
// 3. XEM THỬ MÃ QR NGAY TRONG Ô.
//    Mã QR ngoài trang chủ sinh từ trường Địa chỉ. Hiện luôn ở đây để gõ sai
//    địa chỉ là thấy ngay, khỏi phải mở trang chủ trên máy khác để kiểm.
// ============================================================

/** Sản phẩm mới toanh. Địa chỉ để trống — điền vào thì thẻ mới bấm được và mới
    có mã QR. */
function sanPhamMoi() {
  return {
    id: `sp-${Date.now().toString(36)}`,
    icon: "package",
    loai: "",
    khachHang: "",
    title: "",
    description: "",
    anh: "",
    lienKet: "",
  };
}

/** Ô chọn biểu tượng: hiện hình thật chứ không phải danh sách tên chữ.
    Tên như "landmark" hay "gauge" đọc lên không ai hình dung ra hình gì. */
function ChonIcon({ giaTri, doi }) {
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-ink-soft">Biểu tượng</span>
      <div className="flex flex-wrap gap-1.5 rounded-xl bg-mist p-2.5">
        {TEN_ICON.map((ten) => {
          const Icon = iconOf(ten);
          const chon = ten === giaTri;
          return (
            <button
              key={ten}
              type="button"
              onClick={() => doi(ten)}
              title={ten}
              aria-label={`Biểu tượng ${ten}`}
              aria-pressed={chon}
              className={
                "flex h-9 w-9 items-center justify-center rounded-lg transition-colors " +
                (chon
                  ? "bg-brand text-tren-brand"
                  : "bg-panel text-ink-soft hover:text-ink")
              }
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TheSanPham({ sp, chiSo, tong, doi, xoa, chuyen }) {
  const [mo, setMo] = useState(false);
  const Icon = iconOf(sp.icon);
  const s = (k) => (v) => doi({ ...sp, [k]: v });

  return (
    <li className="overflow-hidden rounded-card bg-mist">
      {/* ---------- Dòng tóm tắt ---------- */}
      <div className="flex items-center gap-2 p-2.5">
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => chuyen(chiSo, -1)}
            disabled={chiSo === 0}
            aria-label={`Đưa ${sp.title || "sản phẩm"} lên trên`}
            className="rounded p-0.5 text-ink-faint transition-colors hover:text-brand disabled:opacity-25"
          >
            <ChevronDown className="h-3.5 w-3.5 rotate-180" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => chuyen(chiSo, 1)}
            disabled={chiSo === tong - 1}
            aria-label={`Đưa ${sp.title || "sản phẩm"} xuống dưới`}
            className="rounded p-0.5 text-ink-faint transition-colors hover:text-brand disabled:opacity-25"
          >
            <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setMo((v) => !v)}
          aria-expanded={mo}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-panel"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft">
            <Icon className="h-4 w-4 text-brand" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-ink">
              {sp.title || "(chưa đặt tên)"}
              {chiSo === 0 && (
                <span className="ml-2 rounded bg-brand-soft px-1.5 py-0.5 text-xs font-medium text-brand">
                  Chủ lực
                </span>
              )}
            </span>
            <span className="block truncate text-xs text-ink-soft">
              {sp.loai || "chưa có loại"}
              {sp.khachHang ? ` · ${sp.khachHang}` : ""}
              {!sp.lienKet && " · chưa có địa chỉ"}
            </span>
          </span>
          <ChevronDown
            className={
              "h-4 w-4 shrink-0 text-ink-faint transition-transform " +
              (mo ? "rotate-180" : "")
            }
            aria-hidden="true"
          />
        </button>

        <button
          type="button"
          onClick={() => xoa(chiSo)}
          aria-label={`Xoá ${sp.title || "sản phẩm"}`}
          className="rounded-lg p-2 text-ink-faint transition-colors hover:bg-loi-nen hover:text-loi"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* ---------- Phần mở rộng ---------- */}
      {mo && (
        <div className="space-y-5 border-t border-line bg-panel p-5">
          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <O nhan="Tên sản phẩm" giaTri={sp.title} doi={s("title")} />
            <O
              nhan="Loại"
              giaTri={sp.loai}
              doi={s("loai")}
              moTa="Ví dụ: Zalo Mini App, Bản đồ số, Website"
            />
          </div>

          <O
            nhan="Khách hàng / đơn vị"
            giaTri={sp.khachHang}
            doi={s("khachHang")}
            moTa="Hiện ở đáy thẻ. Đây là thứ khách cơ quan nhà nước đọc trước tiên."
          />

          <ODai
            nhan="Mô tả"
            giaTri={sp.description}
            doi={s("description")}
            moTa="Một hai câu. Đừng viết dài hơn những gì mình chắc chắn."
          />

          <ChonIcon giaTri={sp.icon} doi={s("icon")} />

          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <div>
              <O
                nhan="Địa chỉ sản phẩm"
                giaTri={sp.lienKet}
                doi={s("lienKet")}
                placeholder="https://..."
                moTa="Điền vào thì cả thẻ bấm được VÀ có mã QR. Để trống thì cả hai cùng ẩn."
              />
              {sp.lienKet && (
                <div className="mt-3 flex items-center gap-3 rounded-xl bg-mist p-3">
                  <div className="h-20 w-20 shrink-0 rounded bg-white p-1">
                    <MaQR
                      noiDung={sp.lienKet}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[0.8125rem] text-ink-soft">Mã QR sẽ hiện trên web</p>
                    <a
                      href={sp.lienKet}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-[0.8125rem] font-medium text-brand hover:underline"
                    >
                      Mở thử
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            <O
              nhan="Ảnh chụp màn hình"
              giaTri={sp.anh}
              doi={s("anh")}
              placeholder="/anh/ten-file.png"
              moTa="Bỏ file vào thư mục public/anh/ rồi gõ đường dẫn. Việc này phải làm trong mã nguồn — trang quản trị chưa tải ảnh lên được."
            />
          </div>
        </div>
      )}
    </li>
  );
}

export default function MucSanPham({ d, doi }) {
  const ds = d?.danhSach ?? [];
  const datDs = (moi) => doi({ ...d, danhSach: moi });

  const suaMot = (i) => (sp) => datDs(ds.map((x, j) => (j === i ? sp : x)));

  const xoa = (i) => {
    const ten = ds[i]?.title || "sản phẩm này";
    if (!window.confirm(`Xoá "${ten}" khỏi trang chủ?\n\nChưa mất hẳn — bấm "Bỏ thay đổi" là quay lại được.`))
      return;
    datDs(ds.filter((_, j) => j !== i));
  };

  const chuyen = (i, huong) => {
    const j = i + huong;
    if (j < 0 || j >= ds.length) return;
    const moi = [...ds];
    [moi[i], moi[j]] = [moi[j], moi[i]];
    datDs(moi);
  };

  return (
    <div className="space-y-4">
      {ds.length === 0 ? (
        <div className="rounded-card border border-dashed border-line px-6 py-12 text-center">
          <p className="text-sm text-ink">Chưa có sản phẩm nào.</p>
          <p className="mx-auto mt-1.5 max-w-sm text-[0.8125rem] leading-relaxed text-ink-soft">
            Khối Sản phẩm sẽ không hiện trên trang chủ cho tới khi có ít nhất một
            sản phẩm.
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {ds.map((sp, i) => (
            <TheSanPham
              key={sp.id ?? i}
              sp={sp}
              chiSo={i}
              tong={ds.length}
              doi={suaMot(i)}
              xoa={xoa}
              chuyen={chuyen}
            />
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => datDs([...ds, sanPhamMoi()])}
        className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-tren-brand transition-colors hover:bg-brand-deep"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Thêm sản phẩm
      </button>

      <p className="flex items-start gap-2.5 rounded-xl bg-mist px-4 py-3 text-[0.8125rem] leading-relaxed text-ink-soft">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <span>
          Thứ tự ở đây là thứ tự trên trang chủ. Sản phẩm{" "}
          <span className="font-medium text-ink">đứng đầu chiếm trọn bề ngang</span> như
          một sản phẩm chủ lực — dùng hai mũi tên để đưa lên hoặc xuống.
        </span>
      </p>
    </div>
  );
}
