"""Dịch lỗi 422 của FastAPI thành MỘT CÂU tiếng Việt nói rõ ô nào sai.

VÌ SAO CẦN FILE NÀY

Mặc định FastAPI trả lỗi kiểm tra dữ liệu ở dạng DANH SÁCH:

    {"detail": [{"type": "string_too_long", "loc": ["body", "tom_tat"],
                 "msg": "String should have at most 500 characters", ...}]}

Còn mọi lỗi khác trong dự án này trả về MỘT CHUỖI:

    {"detail": "Không có bài #7."}

Giao diện chỉ biết đọc dạng chuỗi, nên gặp 422 nó đành hiện câu cuối cùng nó
biết: "Máy chủ báo lỗi 422." — người dùng đọc xong không biết phải sửa gì.

Chuyện có thật ngày 23/09/2026: một người soạn bài bấm Lưu tám lần, năm lần
nhận đúng câu đó, phải tự mò xem mình gõ dài quá ở chỗ nào. Nhìn log máy chủ
cũng không khá hơn: uvicorn chỉ ghi "422 Unprocessable Entity", không ghi ô nào.

File này sửa cả hai đầu: đổi danh sách thành một câu chỉ thẳng ô và con số, và
ghi log đủ để lần sau không phải đoán.
"""

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

log = logging.getLogger("imob.nhap-lieu")

# Tên ô theo đúng chữ hiện trên màn hình quản trị. Người đọc câu lỗi đang nhìn
# cái nhãn đó chứ không nhìn tên cột trong database, nên "Tóm tắt" mới giúp
# được họ, còn "tom_tat" thì không.
#
# Tên nào chưa có trong bảng này thì lấy nguyên tên kỹ thuật — xấu nhưng vẫn
# chỉ đúng chỗ, hơn hẳn không nói gì.
TEN_O = {
    "tieu_de": "Tiêu đề",
    "tom_tat": "Tóm tắt",
    "noi_dung": "Nội dung bài",
    "anh_bia": "Ảnh bìa",
    "ten_khach": "Tên khách hàng",
    "duong_dan": "Đường dẫn",
    "loai": "Mục",
    "da_dang": "Đăng lên web",
    "cau_hoi": "Câu hỏi",
    "cau_tra_loi": "Câu trả lời",
    "ghi_chu": "Ghi chú",
    "ho_ten": "Họ tên",
    "email": "Email",
    "ten_dang_nhap": "Tên đăng nhập",
    "mat_khau": "Mật khẩu",
    "mat_khau_moi": "Mật khẩu mới",
    "ma": "Mã",
    "ly_do": "Lý do",
    "dinh_danh": "Email hoặc tên đăng nhập",
}


def _ten(loc) -> str:
    """["body", "tom_tat"] -> "Tóm tắt". Lấy phần tử CUỐI có ý nghĩa.

    Bỏ qua "body"/"query"/"path" ở đầu, và bỏ qua các chỉ số mảng (số nguyên):
    với ["body", "muc", 2, "tieu_de"] thì thứ người dùng cần biết là "Tiêu đề".
    """
    phan = [p for p in loc if isinstance(p, str) and p not in ("body", "query", "path")]
    if not phan:
        return "Dữ liệu gửi lên"
    khoa = phan[-1]
    return TEN_O.get(khoa, khoa)


def _mot_loi(e: dict) -> str:
    loai = e.get("type", "")
    ten = _ten(e.get("loc", ()))
    ctx = e.get("ctx") or {}
    vao = e.get("input")

    if loai == "string_too_long":
        toi_da = ctx.get("max_length")
        dang_co = len(vao) if isinstance(vao, str) else None
        if toi_da and dang_co:
            # Nói luôn phải bớt bao nhiêu. Người đang sửa bài không muốn ngồi
            # đếm ký tự, họ muốn biết bôi đen bao nhiêu chữ rồi xoá.
            return (
                f"Ô «{ten}» đang dài {dang_co} ký tự, tối đa {toi_da}. "
                f"Bạn rút bớt khoảng {dang_co - toi_da} ký tự nhé."
            )
        if toi_da:
            return f"Ô «{ten}» dài quá, tối đa {toi_da} ký tự."
        return f"Ô «{ten}» dài quá."

    if loai in ("string_too_short", "missing", "value_error.missing"):
        return f"Ô «{ten}» chưa có gì. Bạn điền giúp nhé."

    if loai.startswith("int_") or loai.startswith("float_"):
        return f"Ô «{ten}» phải là số."

    if loai.startswith("bool_"):
        return f"Ô «{ten}» phải là có hoặc không."

    if loai == "string_type" and vao is None:
        return f"Ô «{ten}» chưa có gì. Bạn điền giúp nhé."

    return f"Ô «{ten}» không hợp lệ."


def cau_tieng_viet(loi_list) -> str:
    """Gộp danh sách lỗi của pydantic thành một câu.

    Chỉ nêu tối đa ba ô. Sai bốn ô trở lên thì bảng lỗi dài hơn cái form, mà
    sửa xong ba ô đầu là lần bấm Lưu sau sẽ nêu nốt phần còn lại.
    """
    if not loi_list:
        return "Dữ liệu gửi lên không hợp lệ."
    cau = []
    for e in loi_list[:3]:
        c = _mot_loi(e)
        if c not in cau:
            cau.append(c)
    them = len(loi_list) - 3
    if them > 0:
        cau.append(f"(Còn {them} ô nữa cũng chưa đạt.)")
    return " ".join(cau)


def gan_vao(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def _xu_ly(request: Request, exc: RequestValidationError):
        loi_list = exc.errors()

        # Ghi log ĐỦ ĐỂ TRUY, nhưng KHÔNG ghi nội dung người dùng gõ: thân bài
        # dài hàng nghìn ký tự sẽ ngập log, và ô mật khẩu cũng đi qua đây.
        # Loại lỗi + tên ô + độ dài là đủ để dựng lại chuyện đã xảy ra.
        tom = [
            {
                "o": ".".join(str(p) for p in e.get("loc", ())),
                "loai": e.get("type"),
                "dai": len(e["input"]) if isinstance(e.get("input"), str) else None,
                "gioi_han": (e.get("ctx") or {}).get("max_length"),
            }
            for e in loi_list
        ]
        log.warning("422 %s %s — %s", request.method, request.url.path, tom)

        return JSONResponse(status_code=422, content={"detail": cau_tieng_viet(loi_list)})
