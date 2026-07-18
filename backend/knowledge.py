"""
knowledge.py — NẠP KHO KIẾN THỨC cho chatbot.

Ý tưởng quan trọng: đọc THẲNG các file JSON mà website đang dùng
(src/data/services.json, projects.json) → chỉ có MỘT nguồn dữ liệu duy nhất.
Sửa dịch vụ trên web là bot tự biết theo, không phải chép tay 2 nơi.

Kiến thức này sẽ được nhét vào prompt mỗi lần hỏi (gọi là "context stuffing"
— dạng RAG tối giản, hợp lý vì kho kiến thức của mình rất nhỏ).
"""

import json
from pathlib import Path

# Path(__file__)         = đường dẫn tới chính file này
# .parent                = thư mục backend/
# .parent.parent         = thư mục gốc dự án
# → trỏ tới src/data/ của frontend
DATA_DIR = Path(__file__).parent.parent / "src" / "data"

# Thông tin công ty — GIỮ KHỚP với src/utils/constants.js
# (đang là placeholder, đổi thành thông tin thật khi dùng chính thức)
COMPANY = {
    "ten": "iMob Solution & Technology",
    "mo_ta": "Đơn vị tiên phong chuyển đổi số trong mọi lĩnh vực",
    "dien_thoai": "+84 900 000 000",
    "email": "hotro@example.com",
    "dia_chi": "Hạ Long, Quảng Ninh, Việt Nam",
}


def _doc_json(ten_file: str) -> list:
    """Đọc 1 file JSON trong src/data/ và trả về dữ liệu Python (list các dict)."""
    duong_dan = DATA_DIR / ten_file
    with open(duong_dan, encoding="utf-8") as f:
        return json.load(f)


def xay_kien_thuc() -> str:
    """Gom toàn bộ dữ liệu website thành một đoạn văn bản để đưa cho AI đọc."""
    dich_vu = _doc_json("services.json")
    du_an = _doc_json("projects.json")

    phan = []  # danh sách các đoạn, cuối cùng nối lại bằng xuống dòng

    # --- Thông tin công ty ---
    phan.append(
        f"THÔNG TIN CÔNG TY:\n"
        f"- Tên: {COMPANY['ten']}\n"
        f"- Giới thiệu: {COMPANY['mo_ta']}\n"
        f"- Điện thoại: {COMPANY['dien_thoai']}\n"
        f"- Email: {COMPANY['email']}\n"
        f"- Địa chỉ: {COMPANY['dia_chi']}"
    )

    # --- Dịch vụ ---
    dong_dich_vu = ["DỊCH VỤ CUNG CẤP:"]
    for dv in dich_vu:
        # "\n  • ".join(...) = nối các tính năng, mỗi cái xuống dòng có dấu chấm
        tinh_nang = "\n  • ".join(dv["features"])
        dong_dich_vu.append(
            f"- {dv['title']}: {dv['description']}\n  • {tinh_nang}"
        )
    phan.append("\n".join(dong_dich_vu))

    # --- Dự án đã làm ---
    dong_du_an = ["DỰ ÁN ĐÃ THỰC HIỆN:"]
    for da in du_an:
        the = ", ".join(da["tags"])
        dong_du_an.append(f"- {da['title']} ({the}): {da['description']}")
    phan.append("\n".join(dong_du_an))

    # --- Quy trình & chính sách (chưa có trong JSON nên khai báo ở đây) ---
    phan.append(
        "QUY TRÌNH LÀM VIỆC:\n"
        "Ý tưởng → Tư vấn → Thiết kế → Triển khai → Đào tạo & bàn giao\n"
        "Sau bàn giao có vận hành & bảo trì trọn gói.\n"
        "Tư vấn ban đầu MIỄN PHÍ, phản hồi trong vòng 24h."
    )

    # --- Giá: CHƯA CÓ BẢNG GIÁ (rất quan trọng để AI không bịa số) ---
    phan.append(
        "VỀ GIÁ:\n"
        "Công ty CHƯA công bố bảng giá cố định. Chi phí phụ thuộc quy mô và "
        "yêu cầu từng dự án. Khi khách hỏi giá, phải mời khách để lại số điện "
        "thoại hoặc điền form Liên hệ để được báo giá chi tiết miễn phí. "
        "TUYỆT ĐỐI KHÔNG được tự đưa ra con số giá cụ thể."
    )

    return "\n\n".join(phan)


# Tính sẵn 1 lần khi khởi động server (khỏi đọc file lại mỗi câu hỏi)
KIEN_THUC = xay_kien_thuc()


if __name__ == "__main__":
    # Chạy `python knowledge.py` để xem kho kiến thức trông thế nào
    print(KIEN_THUC)
