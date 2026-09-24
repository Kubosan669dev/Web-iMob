// ============================================================
// Đọc thân lỗi của FastAPI — MỘT nơi duy nhất.
//
// FastAPI để câu lỗi ở trường `detail`, nhưng có tới BA hình dạng:
//
//   chuỗi   {"detail": "Không có bài #7."}                  — đa số
//   đối tượng {"detail": {"ma_loi": "chua_xac_minh", ...}}  — chỗ cần rẽ nhánh
//   MẢNG    {"detail": [{"type": "string_too_long", ...}]}  — lỗi 422
//
// Dạng mảng là dạng FastAPI tự sinh khi dữ liệu gửi lên không qua được kiểm
// tra. Trước 23/09/2026 cả ba service ở đây chỉ biết đọc dạng chuỗi, nên gặp
// 422 là hiện "Máy chủ báo lỗi 422." — đúng cái câu không giúp được gì.
//
// Máy chủ nay đã tự dịch 422 sang một câu tiếng Việt (xem
// chatbot-python/loi_nhap_lieu.py), nên dạng mảng lẽ ra không còn xuất hiện.
// Vẫn giữ nhánh đọc mảng ở đây vì máy chủ và website được deploy riêng: có
// những phút website bản mới đang nói chuyện với API bản cũ, và đó đúng là lúc
// người ta cần câu lỗi rõ ràng nhất.
// ============================================================

/** Tên ô theo chữ hiện trên màn hình. Giữ khớp với TEN_O trong
 *  chatbot-python/loi_nhap_lieu.py — đây chỉ là bản dự phòng cho API cũ. */
const TEN_O = {
  tieu_de: "Tiêu đề",
  tom_tat: "Tóm tắt",
  noi_dung: "Nội dung bài",
  anh_bia: "Ảnh bìa",
  ten_khach: "Tên khách hàng",
  duong_dan: "Đường dẫn",
  cau_hoi: "Câu hỏi",
  cau_tra_loi: "Câu trả lời",
  ho_ten: "Họ tên",
  email: "Email",
  ten_dang_nhap: "Tên đăng nhập",
  mat_khau: "Mật khẩu",
};

function tuMang(ds) {
  const cau = [];
  for (const e of ds.slice(0, 3)) {
    const khoa = (e?.loc || [])
      .filter((p) => typeof p === "string" && !["body", "query", "path"].includes(p))
      .pop();
    const ten = TEN_O[khoa] || khoa || "Dữ liệu gửi lên";
    const toiDa = e?.ctx?.max_length;
    const dai = typeof e?.input === "string" ? e.input.length : null;
    if (e?.type === "string_too_long" && toiDa && dai) {
      cau.push(`Ô «${ten}» đang dài ${dai} ký tự, tối đa ${toiDa}. Bạn rút bớt khoảng ${dai - toiDa} ký tự nhé.`);
    } else if (e?.type === "missing" || e?.type === "string_too_short") {
      cau.push(`Ô «${ten}» chưa có gì. Bạn điền giúp nhé.`);
    } else {
      cau.push(`Ô «${ten}» không hợp lệ.`);
    }
  }
  return cau.join(" ");
}

/** Trả về { thongDiep, maLoi }. `macDinh` dùng khi không đọc được gì. */
export function docLoi(than, macDinh) {
  const detail = than?.detail;
  if (typeof detail === "string" && detail) return { thongDiep: detail, maLoi: "" };
  if (Array.isArray(detail) && detail.length) {
    return { thongDiep: tuMang(detail) || macDinh, maLoi: "" };
  }
  if (detail && typeof detail === "object") {
    return { thongDiep: detail.thong_diep || macDinh, maLoi: detail.ma_loi || "" };
  }
  return { thongDiep: macDinh, maLoi: "" };
}
