import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Eye,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { O, ODai } from "./Fields.jsx";
import ChonAnh from "./ChonAnh.jsx";
import Anh from "../ui/Anh.jsx";
import { diaChiAnh } from "../../utils/anh.js";
import {
  LOAI,
  LOAI_CAU_CHUYEN,
  LOAI_TIN_CONG_TY,
  danhSachBaiVietQuanTri,
  docBaiVietQuanTri,
  duongDanBai,
  suaBaiViet,
  themBaiViet,
  GIOI_HAN,
  loiDoDai,
  laLinkTrangKhac,
  LOI_LINK_TRANG_KHAC,
  xemTruocDuongDan,
  xoaBaiViet,
  tachDoan,
  ngayViet,
} from "../../services/baiVietService.js";

// ============================================================
// MỤC "CÂU CHUYỆN" của trang quản trị — viết, sửa, đăng, xoá bài.
//
// BỐN QUYẾT ĐỊNH, và lý do:
//
// 1. TỰ LƯU RIÊNG, KHÔNG DÙNG THANH LƯU CHUNG Ở DƯỚI.
//    Thanh lưu chung của /admin làm việc theo "khoá nội dung" (hero, about…):
//    một khoá là một cục JSON, lưu là ghi đè cả cục. Bài viết thì mỗi bài một
//    dòng trong database và có thao tác riêng (thêm / xoá / đăng), không ghép
//    vào mô hình đó được. Nên mục này có nút Lưu của chính nó.
//
// 2. NHÁP LÀ MẶC ĐỊNH.
//    Bài mới luôn bắt đầu ở dạng nháp. Muốn cho khách đọc thì phải chủ động
//    tích ô "Đăng lên web". Ngược lại — mặc định đăng rồi ai nhớ thì gỡ — là
//    cách chắc chắn nhất để một bài viết dở dang xuất hiện trên trang công khai.
//
// 3. CÓ NÚT XEM THỬ, VẼ ĐÚNG NHƯ TRANG THẬT.
//    Viết trong ô textarea thì không hình dung được bài ra sao khi lên trang:
//    ngắt đoạn chỗ nào, ảnh bìa cắt ra sao. Xem thử ngay cạnh ô soạn thì sửa
//    được trước khi đăng, thay vì đăng rồi mở web ra xem rồi quay lại sửa.
//
// 4. CHỈ TÀI KHOẢN QUẢN TRỊ SOẠN ĐƯỢC BÀI.
//    Hàng rào thật nằm ở máy chủ (api_bai_viet.py, dependency chi_quan_tri),
//    không phải ở giao diện — ẩn nút đi thì mở F12 gõ một dòng fetch là qua.
// ============================================================

const NUT_CHINH =
  "inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold " +
  "text-tren-brand transition hover:opacity-90 disabled:opacity-50";
const NUT_PHU =
  "inline-flex items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-sm " +
  "font-medium text-ink-soft transition hover:border-brand hover:text-brand disabled:opacity-50";

const BAI_TRONG = {
  loai: LOAI_CAU_CHUYEN,
  tieu_de: "",
  tom_tat: "",
  noi_dung: "",
  anh_bia: "",
  ten_khach: "",
  duong_dan: "",
  da_dang: false,
};

/** Nhãn loại bài — để phân biệt ngay trong danh sách chung. */
function NhanLoai({ loai }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line px-2.5 py-0.5 text-[0.75rem] font-medium text-ink-faint">
      {LOAI[loai]?.nhanNgan ?? loai}
    </span>
  );
}

/** Dòng trạng thái: nháp hay đã đăng. */
function Nhan({ daDang }) {
  return daDang ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-0.5 text-[0.75rem] font-semibold text-brand">
      <Check className="h-3 w-3" aria-hidden="true" />
      Đã đăng
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-0.5 text-[0.75rem] font-semibold text-ink-faint">
      Nháp
    </span>
  );
}

/** Bài viết vẽ đúng như khi lên trang công khai — xem trước khi đăng. */
function XemThu({ bai }) {
  const doan = tachDoan(bai.noi_dung);
  return (
    <div className="rounded-2xl border border-line bg-paper/40 p-6">
      <p className="mb-4 text-[0.75rem] font-semibold uppercase tracking-widest text-ink-faint">
        Xem thử — đây là những gì khách sẽ thấy
      </p>

      <Anh
        src={diaChiAnh(bai.anh_bia)}
        alt=""
        boc="mb-5 overflow-hidden rounded-xl border border-line bg-brand-soft"
        className="aspect-[16/9] w-full object-cover"
      />

      <p className="text-xs uppercase tracking-[0.2em] text-ink-faint">
        {ngayViet(bai.dang_luc) || "chưa đăng"}
        {bai.ten_khach ? ` · ${bai.ten_khach}` : ""}
      </p>
      <h3 className="mt-2 text-2xl font-black leading-tight text-ink">
        {bai.tieu_de || "(chưa có tiêu đề)"}
      </h3>
      {bai.tom_tat && (
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-soft">
          {bai.tom_tat}
        </p>
      )}

      <div className="mt-6 space-y-4 border-t border-line pt-6">
        {doan.length === 0 ? (
          <p className="text-sm italic text-ink-faint">(chưa có nội dung)</p>
        ) : (
          doan.map((d, i) => (
            <p key={i} className="text-[0.9375rem] leading-relaxed text-ink-soft">
              {d}
            </p>
          ))
        )}
      </div>
    </div>
  );
}

export default function MucBaiViet() {
  const [danhSach, setDanhSach] = useState(null); // null = đang tải
  const [dangSua, setDangSua] = useState(null); // null = đang xem danh sách
  const [ban, setBan] = useState(BAI_TRONG); // bản đang gõ dở
  const [xemThu, setXemThu] = useState(false);
  const [dangLuu, setDangLuu] = useState(false);
  const [loi, setLoi] = useState("");
  const [bao, setBao] = useState("");

  const tai = useCallback(async () => {
    try {
      setDanhSach(await danhSachBaiVietQuanTri());
      setLoi("");
    } catch (err) {
      setLoi(err.message);
      setDanhSach([]);
    }
  }, []);

  useEffect(() => {
    tai();
  }, [tai]);

  const moBaiMoi = () => {
    setDangSua("moi");
    setBan(BAI_TRONG);
    setXemThu(false);
    setLoi("");
    setBao("");
  };

  const moBaiCu = async (bai) => {
    setDangSua(bai.id);
    setBan({ ...BAI_TRONG, ...bai });
    setXemThu(false);
    setLoi("");
    setBao("");
    // Danh sách cố ý KHÔNG kèm thân bài (xem COT_TOM_LUOC trong db.py), nên
    // phải lấy thêm bản đầy đủ. Không có bước này thì mở một bài cũ ra sửa sẽ
    // thấy ô nội dung trống trơn, và bấm Lưu là xoá sạch bài.
    try {
      setBan({ ...BAI_TRONG, ...(await docBaiVietQuanTri(bai.id)) });
    } catch (err) {
      setLoi(err.message);
    }
  };

  const dong = () => {
    setDangSua(null);
    setBan(BAI_TRONG);
    setXemThu(false);
  };

  const doi = (truong) => (giaTri) =>
    setBan((cu) => ({ ...cu, [truong]: giaTri }));

  const luu = async () => {
    if (!ban.tieu_de.trim()) {
      setLoi("Bài viết cần có tiêu đề.");
      return;
    }
    // Chặn ở đây thay vì để máy chủ trả 422: câu lỗi nói đúng tên ô và đúng số
    // ký tự phải bớt, mà không mất một vòng gọi mạng nào.
    const quaDai = loiDoDai(ban);
    if (quaDai) {
      setLoi(quaDai);
      return;
    }
    if (laLinkTrangKhac(ban.duong_dan)) {
      setLoi(LOI_LINK_TRANG_KHAC);
      return;
    }
    setDangLuu(true);
    setLoi("");
    setBao("");
    try {
      const gui = {
        loai: ban.loai,
        tieu_de: ban.tieu_de,
        tom_tat: ban.tom_tat,
        noi_dung: ban.noi_dung,
        anh_bia: ban.anh_bia || null,
        ten_khach: ban.ten_khach || null,
        da_dang: ban.da_dang,
        // Để trống thì máy chủ tự đặt đường dẫn theo tiêu đề.
        duong_dan: ban.duong_dan || null,
      };
      const kq =
        dangSua === "moi" ? await themBaiViet(gui) : await suaBaiViet(dangSua, gui);

      // Lấy lại bản máy chủ vừa ghi: đường dẫn có thể đã được máy chủ tự đặt
      // hoặc thêm hậu tố -2, và dang_luc chỉ máy chủ mới biết. Giữ bản cũ trên
      // màn hình thì lần lưu tiếp theo sẽ gửi đi một đường dẫn không có thật.
      setBan({ ...BAI_TRONG, ...kq });
      setDangSua(kq.id);
      setBao(ban.da_dang ? "Đã lưu và đăng lên web." : "Đã lưu bản nháp.");
      await tai();
    } catch (err) {
      setLoi(err.message);
    } finally {
      setDangLuu(false);
    }
  };

  const xoa = async (bai) => {
    if (
      !window.confirm(
        `Xoá hẳn bài "${bai.tieu_de}"?\n\nKhông khôi phục lại được.`
      )
    )
      return;
    try {
      await xoaBaiViet(bai.id);
      if (dangSua === bai.id) dong();
      await tai();
    } catch (err) {
      setLoi(err.message);
    }
  };

  // ---------------------------------------------------------- danh sách
  if (dangSua === null) {
    return (
      <div className="space-y-5">
        {loi && (
          <p className="flex items-start gap-2.5 rounded-xl bg-loi-nen px-4 py-3 text-sm text-loi">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {loi}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm leading-relaxed text-ink-soft">
            Bài nháp chỉ mình bạn thấy. Chỉ bài đã đăng mới hiện ra ngoài web,
            ở mục tương ứng với loại của nó.
          </p>
          <button type="button" onClick={moBaiMoi} className={NUT_CHINH}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Viết bài mới
          </button>
        </div>

        {danhSach === null ? (
          <p className="flex items-center gap-2 py-10 text-sm text-ink-soft">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Đang tải danh sách…
          </p>
        ) : danhSach.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line px-6 py-12 text-center">
            <FileText className="mx-auto h-8 w-8 text-ink-faint" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-ink">Chưa có bài nào.</p>
            <p className="mx-auto mt-1.5 max-w-sm text-[0.8125rem] leading-relaxed text-ink-faint">
              Bài đầu tiên dễ viết nhất là kể về một sản phẩm đã bàn giao, rồi
              xin khách một câu nhận xét để chèn vào.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
            {danhSach.map((bai) => (
              <li
                key={bai.id}
                className="flex flex-wrap items-center gap-3 px-4 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-[0.9375rem] font-semibold text-ink">
                      {bai.tieu_de}
                    </span>
                    <NhanLoai loai={bai.loai} />
                    <Nhan daDang={bai.da_dang} />
                  </p>
                  <p className="mt-0.5 truncate text-[0.8125rem] text-ink-faint">
                    <span className="font-mono">{duongDanBai(bai)}</span>
                    {bai.da_dang && bai.dang_luc
                      ? ` · đăng ${ngayViet(bai.dang_luc)}`
                      : ""}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => moBaiCu(bai)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[0.8125rem] font-medium text-ink-soft transition hover:bg-mist hover:text-brand"
                >
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  Sửa
                </button>

                <button
                  type="button"
                  onClick={() => xoa(bai)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[0.8125rem] font-medium text-ink-faint transition hover:bg-loi-nen hover:text-loi"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Xoá
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------- soạn bài
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={dong} className={NUT_PHU}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Danh sách bài
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setXemThu((v) => !v)}
            className={NUT_PHU}
            aria-pressed={xemThu}
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            {xemThu ? "Ẩn xem thử" : "Xem thử"}
          </button>
          <button
            type="button"
            onClick={luu}
            disabled={dangLuu}
            className={NUT_CHINH}
          >
            {dangLuu ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Check className="h-4 w-4" aria-hidden="true" />
            )}
            {dangLuu ? "Đang lưu…" : "Lưu"}
          </button>
        </div>
      </div>

      {loi && (
        <p className="flex items-start gap-2.5 rounded-xl bg-loi-nen px-4 py-3 text-sm text-loi">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {loi}
        </p>
      )}
      {bao && (
        <p className="flex items-start gap-2.5 rounded-xl bg-brand-soft px-4 py-3 text-sm text-brand">
          <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {bao}
        </p>
      )}

      <div className="space-y-4">
        {/* Chọn loại đặt TRÊN CÙNG vì nó quyết định bài nằm ở mục nào và địa
            chỉ ra sao — biết trước thì khỏi viết xong mới phát hiện nhầm mục. */}
        <fieldset>
          <legend className="mb-1.5 block text-[0.8125rem] font-semibold text-ink-soft">
            Bài này thuộc mục nào
          </legend>
          <div className="flex flex-wrap gap-2">
            {[LOAI_CAU_CHUYEN, LOAI_TIN_CONG_TY].map((ma) => (
              <button
                key={ma}
                type="button"
                onClick={() => doi("loai")(ma)}
                aria-pressed={ban.loai === ma}
                className={
                  "rounded-xl px-3.5 py-2 text-sm font-medium transition " +
                  (ban.loai === ma
                    ? "bg-brand text-tren-brand"
                    : "border border-line text-ink-soft hover:border-brand hover:text-brand")
                }
              >
                {LOAI[ma].nhan}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-faint">
            {LOAI[ban.loai]?.moTa}
          </p>
        </fieldset>

        <O
          nhan="Tiêu đề"
          giaTri={ban.tieu_de}
          doi={doi("tieu_de")}
          toiDa={GIOI_HAN.tieu_de}
          moTa="Câu này hiện ở danh sách và trên tab trình duyệt."
        />

        <ODai
          nhan="Tóm tắt"
          dongToiThieu={2}
          giaTri={ban.tom_tat}
          doi={doi("tom_tat")}
          toiDa={GIOI_HAN.tom_tat}
          moTa="Một hai câu, hiện ngay dưới tiêu đề ở trang danh sách."
        />

        <O
          nhan="Tên khách hàng"
          giaTri={ban.ten_khach}
          doi={doi("ten_khach")}
          toiDa={GIOI_HAN.ten_khach}
          moTa="Hiện cạnh ngày đăng. Nhớ xin phép trước khi nêu tên đơn vị của khách."
        />

        <ChonAnh
          nhan="Ảnh bìa"
          giaTri={ban.anh_bia}
          doi={doi("anh_bia")}
          moTa="Ảnh ngang đẹp nhất. Không có ảnh thì khung ảnh tự ẩn đi."
        />

        <ODai
          nhan="Nội dung bài"
          dongToiThieu={14}
          giaTri={ban.noi_dung}
          doi={doi("noi_dung")}
          toiDa={GIOI_HAN.noi_dung}
          moTa="Để MỘT DÒNG TRỐNG giữa hai đoạn. Xuống dòng thường vẫn nằm trong cùng một đoạn."
        />

        {/* Nhãn cũ chỉ ghi "Đường dẫn", trùng chữ với ô "Hoặc gõ đường dẫn" của
            Ảnh bìa ngay phía trên, và rất dễ hiểu thành "link tới bài gốc".
            Ngày 24/09/2026 chính nhầm lẫn đó sinh ra lỗi 422 khi đăng bài. */}
        <O
          nhan="Đường dẫn của bài trên imob.vn (không bắt buộc)"
          giaTri={ban.duong_dan}
          doi={doi("duong_dan")}
          toiDa={GIOI_HAN.duong_dan}
          placeholder="để trống — máy tự đặt theo tiêu đề"
          moTa={
            laLinkTrangKhac(ban.duong_dan) ? (
              <span className="font-medium text-loi">{LOI_LINK_TRANG_KHAC}</span>
            ) : (
              <>
                Địa chỉ bài trên web sẽ là:{" "}
                <span className="font-mono text-ink-soft">
                  {LOAI[ban.loai]?.duongDan}/
                  {xemTruocDuongDan(ban.duong_dan || ban.tieu_de) || "…"}
                </span>
                . Bài đã đăng rồi thì ĐỪNG đổi — mọi link đã chia sẻ sẽ hỏng hết.
              </>
            )
          }
        />

        {/* ---------- Đăng lên web ---------- */}
        <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-mist px-4 py-3.5">
            <input
              type="checkbox"
              checked={ban.da_dang}
              onChange={(e) => doi("da_dang")(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-brand)]"
            />
            <span>
              <span className="block text-[0.9375rem] font-semibold text-ink">
                Đăng lên web
              </span>
              <span className="mt-0.5 block text-[0.8125rem] leading-relaxed text-ink-faint">
                Bỏ tích là gỡ bài xuống, khách không đọc được nữa nhưng bài vẫn
                còn ở đây.
              </span>
            </span>
        </label>
      </div>

      {xemThu && <XemThu bai={ban} />}
    </div>
  );
}
