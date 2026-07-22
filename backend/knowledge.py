"""
knowledge.py — NẠP KHO KIẾN THỨC cho chatbot.

Ý tưởng quan trọng: đọc THẲNG các file JSON mà website đang dùng
(src/data/*.json) → chỉ có MỘT nguồn dữ liệu duy nhất.
Sửa nội dung trên web là bot tự biết theo, không phải chép tay 2 nơi.

Kiến thức này được nhét vào prompt mỗi lần hỏi (gọi là "context stuffing"
— dạng RAG tối giản, hợp lý vì kho kiến thức của mình còn nhỏ).

5 nguồn dữ liệu:
    company.json   thông tin công ty  (web cũng đọc, qua utils/constants.js)
    services.json  3 nhóm dịch vụ     (web cũng đọc, qua sections/Services.jsx)
    projects.json  dự án đã làm       (web cũng đọc, qua sections/Projects.jsx)
    about.json     số liệu + điểm mạnh (web cũng đọc, qua sections/About.jsx)
    faq.json       câu hỏi thường gặp  (mới, web chưa hiển thị)

CHẾ ĐỘ SO SÁNH:
    đặt biến môi trường IMOB_KB=min → dựng kho kiến thức CŨ (chỉ 5 mục,
    không có about/faq) để đo xem bản đầy đủ có thật sự tốt hơn không.
    Xem backend/so_sanh.py.
"""

import json
import os
from pathlib import Path

# Path(__file__)  = chính file này  →  .parent = backend/  →  .parent.parent = gốc dự án
DATA_DIR = Path(__file__).parent.parent / "src" / "data"


def _doc_json(ten_file: str):
    """Đọc 1 file JSON trong src/data/ và trả về dữ liệu Python."""
    with open(DATA_DIR / ten_file, encoding="utf-8") as f:
        return json.load(f)


# Thông tin công ty — dùng chung với website (src/utils/constants.js đọc
# đúng file này). guard.py cũng import COMPANY từ đây.
_company = _doc_json("company.json")

COMPANY = {
    "ten": _company["fullName"],
    "mo_ta": _company["description"],
    "dien_thoai": _company["phone"],
    "email": _company["email"],
    "dia_chi": _company["address"],
    "gio_lam_viec": _company["workingHours"],
    "thoi_gian_phan_hoi": _company["responseTime"],
}


# ============================================================
# Từng khối kiến thức — tách hàm nhỏ để dễ bật/tắt khi so sánh A/B
# ============================================================


def _khoi_cong_ty() -> str:
    return (
        f"THÔNG TIN CÔNG TY:\n"
        f"- Tên: {COMPANY['ten']}\n"
        f"- Giới thiệu: {COMPANY['mo_ta']}\n"
        f"- Điện thoại: {COMPANY['dien_thoai']}\n"
        f"- Email: {COMPANY['email']}\n"
        f"- Địa chỉ: {COMPANY['dia_chi']}\n"
        f"- Giờ làm việc: {COMPANY['gio_lam_viec']}\n"
        f"- Thời gian phản hồi: {COMPANY['thoi_gian_phan_hoi']}"
    )


def _khoi_dich_vu() -> str:
    dong = ["DỊCH VỤ CUNG CẤP:"]
    for dv in _doc_json("services.json"):
        # "\n  • ".join(...) = nối các tính năng, mỗi cái xuống dòng có dấu chấm
        tinh_nang = "\n  • ".join(dv["features"])
        dong.append(f"- {dv['title']}: {dv['description']}\n  • {tinh_nang}")
    return "\n".join(dong)


def _khoi_du_an() -> str:
    dong = ["DỰ ÁN ĐÃ THỰC HIỆN:"]
    for da in _doc_json("projects.json"):
        the = ", ".join(da["tags"])
        dong.append(f"- {da['title']} ({the}): {da['description']}")
    return "\n".join(dong)


def _khoi_nang_luc() -> str:
    """Số liệu + điểm mạnh + triết lý làm việc (từ section Giới thiệu).

    Đây là phần bot TRƯỚC ĐÂY KHÔNG BIẾT: website nói "50+ dự án, 30+ khách
    hàng, 99% hài lòng" nhưng kho kiến thức cũ không có, nên khách hỏi
    "bên bạn làm được bao nhiêu dự án rồi" là bot chịu.
    """
    about = _doc_json("about.json")

    so_lieu = " · ".join(f"{s['value']} {s['label'].lower()}" for s in about["stats"])
    diem_manh = "\n".join(
        f"- {f['title']}: {f['description']}" for f in about["features"]
    )

    return (
        f"NĂNG LỰC & SỐ LIỆU:\n"
        f"{so_lieu}\n\n"
        f"ĐIỂM MẠNH:\n{diem_manh}\n\n"
        f"CÁCH LÀM VIỆC:\n{about['philosophy']}"
    )


def _khoi_quy_trinh() -> str:
    return (
        "QUY TRÌNH LÀM VIỆC:\n"
        "Ý tưởng → Tư vấn → Thiết kế → Triển khai → Đào tạo & bàn giao\n"
        "Sau bàn giao có vận hành & bảo trì trọn gói.\n"
        f"Tư vấn ban đầu MIỄN PHÍ, phản hồi {COMPANY['thoi_gian_phan_hoi']}."
    )


def _khoi_faq() -> str:
    """Câu hỏi thường gặp — nội dung website chưa hiển thị.

    Đây mới là phần tạo khác biệt lớn nhất: bảo hành, bàn giao mã nguồn,
    thanh toán, công nghệ, bảo mật... toàn những câu khách hỏi thật mà
    trước đây bot phải đoán.
    """
    dong = ["CÂU HỎI THƯỜNG GẶP:"]
    for m in _doc_json("faq.json")["items"]:
        dong.append(f"- HỎI: {m['cau_hoi']}\n  ĐÁP: {m['tra_loi']}")
    return "\n".join(dong)


def _khoi_gia() -> str:
    """Giá: CHƯA CÓ BẢNG GIÁ — rất quan trọng để AI không bịa số."""
    return (
        "VỀ GIÁ:\n"
        "Công ty CHƯA công bố bảng giá cố định. Chi phí phụ thuộc quy mô và "
        "yêu cầu từng dự án. Khi khách hỏi giá, phải mời khách để lại số điện "
        "thoại hoặc điền form Liên hệ để được báo giá chi tiết miễn phí. "
        "TUYỆT ĐỐI KHÔNG được tự đưa ra con số giá cụ thể."
    )


def xay_kien_thuc() -> str:
    """Gom toàn bộ dữ liệu website thành một đoạn văn bản để đưa cho AI đọc.

    IMOB_KB=min → chỉ dựng 5 khối như bản CŨ (bỏ năng lực + FAQ),
    dùng để so sánh A/B xem thêm dữ liệu có thật sự tốt hơn không.
    """
    rut_gon = os.getenv("IMOB_KB") == "min"

    phan = [_khoi_cong_ty(), _khoi_dich_vu(), _khoi_du_an()]

    if not rut_gon:
        phan.append(_khoi_nang_luc())

    phan.append(_khoi_quy_trinh())

    if not rut_gon:
        phan.append(_khoi_faq())

    phan.append(_khoi_gia())

    return "\n\n".join(phan)


# Tính sẵn 1 lần khi khởi động server (khỏi đọc file lại mỗi câu hỏi)
KIEN_THUC = xay_kien_thuc()


if __name__ == "__main__":
    # Chạy `python knowledge.py` để xem kho kiến thức trông thế nào
    print(KIEN_THUC)
    print()
    print("=" * 60)
    print(f"Độ dài: {len(KIEN_THUC)} ký tự (~{len(KIEN_THUC) // 3} token)")
