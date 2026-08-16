// Các ô nhập dùng chung cho trang quản trị.
// Tách riêng khỏi AdminPage.jsx để file đó chỉ còn lo phần luồng (đăng nhập,
// tải/lưu dữ liệu), không lẫn với chi tiết giao diện.

const O_NHAP =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm " +
  "text-white placeholder-gray-600 outline-none transition-colors " +
  "focus:border-purple-500/60 focus:bg-purple-500/[0.04]";

/** Ô nhập một dòng, có nhãn. */
export function O({ nhan, giaTri, doi, moTa, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
        {nhan}
      </span>
      <input
        className={O_NHAP}
        value={giaTri ?? ""}
        onChange={(e) => doi(e.target.value)}
        {...props}
      />
      {moTa && <span className="mt-1 block text-xs text-gray-600">{moTa}</span>}
    </label>
  );
}

/** Ô nhập nhiều dòng. */
export function ODai({ nhan, giaTri, doi, dong = 3, moTa, ...props }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
        {nhan}
      </span>
      <textarea
        rows={dong}
        className={`${O_NHAP} resize-y leading-relaxed`}
        value={giaTri ?? ""}
        onChange={(e) => doi(e.target.value)}
        {...props}
      />
      {moTa && <span className="mt-1 block text-xs text-gray-600">{moTa}</span>}
    </label>
  );
}

/**
 * Ô nhập cho DANH SÁCH chuỗi: mỗi dòng là một phần tử.
 *
 * Dùng cho `items` / `paragraphs` của trang pháp lý. Chọn cách "mỗi dòng một ý"
 * thay vì nút thêm/xoá từng dòng vì soạn văn bản pháp lý thì gõ liền mạch rồi
 * xuống dòng là nhanh nhất, lại dễ dán từ Word sang.
 *
 * Dòng trống bị bỏ qua khi lưu — nên gõ thừa Enter cũng không sao.
 */
export function ODanhSach({ nhan, danhSach, doi, dong = 4, moTa }) {
  return (
    <ODai
      nhan={nhan}
      dong={dong}
      giaTri={(danhSach ?? []).join("\n")}
      doi={(v) => doi(v.split("\n"))}
      moTa={moTa ?? "Mỗi dòng là một ý. Dòng trống sẽ bị bỏ qua khi lưu."}
    />
  );
}

/** Bỏ các dòng trống trong mảng chuỗi — gọi ngay trước khi gửi lên máy chủ. */
export function locDongTrong(danhSach) {
  return (danhSach ?? []).map((s) => s.trim()).filter(Boolean);
}
