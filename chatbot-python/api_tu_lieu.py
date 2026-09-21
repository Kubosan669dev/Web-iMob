"""Tư liệu thành viên gửi cho trợ lý ảo, và hàng đợi duyệt của quản trị.

HAI GỐC ĐƯỜNG DẪN, CỐ Ý TÁCH HẲN:

    /api/tu-lieu…            của THÀNH VIÊN — chỉ đụng được vào tư liệu của
                             chính mình. Tên người gửi lấy từ VÉ, không bao
                             giờ nhận từ thân request.

    /api/quan-tri/tu-lieu…   của QUẢN TRỊ — xem được tất cả, đổi được trạng
                             thái. Gắn chi_quan_tri() ở mọi đường.

Vì sao không gộp một gốc rồi kiểm vai bên trong: gộp thì một nhánh `if` viết
sót sẽ để thành viên đọc được tư liệu của người khác — và chuyện đó KHÔNG báo
lỗi gì cả, nó chỉ trả về dữ liệu. Tách gốc thì thiếu hàng rào là 401/403 ngay,
nhìn thấy được. Đây đúng là cách đã dùng cho bài viết (api_bai_viet.py).

ĐƯỜNG ĐI CỦA MỘT TƯ LIỆU:
    thành viên gửi  ->  cho_duyet  ->  quản trị xem
                                       ├─ da_duyet  -> vào kho kiến thức
                                       └─ tu_choi   -> kèm lý do, người gửi đọc được

⚠️ BƯỚC NỐI VÀO KHO KIẾN THỨC CHƯA LÀM (22/09/2026). Duyệt xong hiện mới chỉ
đổi trạng thái trong database; chatbot chưa đọc tới bảng này. Đó là bước 4.
Ghi rõ ở đây để không ai tưởng duyệt xong là bot biết ngay.
"""

import unicodedata

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel

import auth
import db

router = APIRouter(tags=["tu-lieu"])

CHI_QUAN_TRI = auth.chi_quan_tri("Chỉ tài khoản quản trị mới duyệt được tư liệu.")

# ============================================================
# Giới hạn
# ============================================================
DAI_CAU_HOI_TOI_DA = 300
DAI_CAU_TRA_LOI_TOI_DA = 4000
DAI_GHI_CHU_TOI_DA = 1000
DAI_LY_DO_TOI_DA = 500

DAI_CAU_HOI_TOI_THIEU = 8
DAI_CAU_TRA_LOI_TOI_THIEU = 20

# Số tư liệu một người được để CHỜ DUYỆT cùng lúc.
#
# Không chặn thì một người gửi vài trăm dòng trong mười phút là hàng đợi của
# quản trị thành vô dụng — và người đó không cần cố ý phá, chỉ cần hăng hái.
# Duyệt bớt đi thì họ gửi tiếp được ngay, nên đây không phải giới hạn tổng.
SO_CHO_DUYET_TOI_DA = 10

TRANG_THAI_HOP_LE = {db.TRANG_THAI_CHO, db.TRANG_THAI_DUYET, db.TRANG_THAI_TU_CHOI}


def don_chu(tho: str, dai_toi_da: int) -> str:
    """Bỏ ký tự điều khiển, gọn khoảng trắng thừa, cắt cho vừa.

    Giữ lại xuống dòng (\\n) vì câu trả lời dài cần chia đoạn — nhưng bỏ mọi
    ký tự điều khiển khác, kể cả các mã vô hình mà nhìn danh sách không thấy
    nhưng lại làm vỡ bố cục ở chỗ in ra.
    """
    sach = "".join(
        c if c == "\n" or unicodedata.category(c)[0] != "C" else " "
        for c in (tho or "")
    )
    # Gọn từng dòng, rồi bỏ các dòng trống liên tiếp.
    dong = [" ".join(d.split()) for d in sach.split("\n")]
    gon = "\n".join(dong).strip()
    while "\n\n\n" in gon:
        gon = gon.replace("\n\n\n", "\n\n")
    return gon[:dai_toi_da]


# ============================================================
# Kiểu dữ liệu
# ============================================================
class YeuCauGui(BaseModel):
    cau_hoi: str
    cau_tra_loi: str
    ghi_chu: str = ""


class YeuCauDuyet(BaseModel):
    trang_thai: str
    ly_do: str = ""


class TuLieu(BaseModel):
    id: int
    nguoi_gui: str | None = None
    cau_hoi: str
    cau_tra_loi: str
    ghi_chu: str
    trang_thai: str
    ly_do: str
    tao_luc: str | None = None
    duyet_luc: str | None = None
    nguoi_duyet: str | None = None


def _can_db() -> None:
    if not db.co_db():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Máy chủ chưa cấu hình database nên chưa nhận được tư liệu.",
        )


def _ra(hang: dict) -> dict:
    def gio(khoa):
        moc = hang.get(khoa)
        return moc.isoformat() if moc else None

    return {
        "id": hang["id"],
        "nguoi_gui": hang.get("nguoi_gui"),
        "cau_hoi": hang["cau_hoi"],
        "cau_tra_loi": hang["cau_tra_loi"],
        "ghi_chu": hang.get("ghi_chu") or "",
        "trang_thai": hang["trang_thai"],
        "ly_do": hang.get("ly_do") or "",
        "tao_luc": gio("tao_luc"),
        "duyet_luc": gio("duyet_luc"),
        "nguoi_duyet": hang.get("nguoi_duyet"),
    }


# ============================================================
# Của thành viên
# ============================================================
@router.post("/api/tu-lieu", response_model=TuLieu, status_code=201)
def gui_tu_lieu(
    yeu_cau: YeuCauGui,
    request: Request,
    ten: str = Depends(auth.yeu_cau_dang_nhap),
):
    _can_db()

    cau_hoi = don_chu(yeu_cau.cau_hoi, DAI_CAU_HOI_TOI_DA)
    cau_tra_loi = don_chu(yeu_cau.cau_tra_loi, DAI_CAU_TRA_LOI_TOI_DA)
    ghi_chu = don_chu(yeu_cau.ghi_chu, DAI_GHI_CHU_TOI_DA)

    if len(cau_hoi) < DAI_CAU_HOI_TOI_THIEU:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Câu hỏi còn quá ngắn. Bạn viết nguyên câu khách hay hỏi giúp mình nhé.",
        )
    if len(cau_tra_loi) < DAI_CAU_TRA_LOI_TOI_THIEU:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Câu trả lời còn quá ngắn. Viết đủ ý để người đọc hiểu được ngay nhé.",
        )

    if db.dem_tu_lieu_dang_cho(ten) >= SO_CHO_DUYET_TOI_DA:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"Bạn đang có {SO_CHO_DUYET_TOI_DA} tư liệu chờ iMob xem. "
                "Đợi duyệt bớt rồi gửi tiếp nhé."
            ),
        )

    # Dùng lại bộ đếm chặn dò mật khẩu cho luôn: nó đếm theo IP và đã có sẵn.
    # Ở đây chỉ ĐỌC chứ không ghi nhận gì — mục đích là một IP vừa bị khoá vì
    # dò mật khẩu thì cũng đừng cho ghi thêm dữ liệu vào database.
    auth.kiem_tra_bi_khoa(request)

    return _ra(db.them_tu_lieu(ten, cau_hoi, cau_tra_loi, ghi_chu))


@router.get("/api/tu-lieu", response_model=list[TuLieu])
def tu_lieu_cua_toi(ten: str = Depends(auth.yeu_cau_dang_nhap)):
    """Tư liệu CỦA CHÍNH NGƯỜI ĐANG ĐĂNG NHẬP.

    Tên người gửi lấy từ vé (`ten`), KHÔNG nhận tham số nào từ ngoài. Nếu nhận
    thì chỉ cần sửa một chữ trên thanh địa chỉ là đọc được tư liệu người khác.
    """
    _can_db()
    return [_ra(h) for h in db.tu_lieu_cua_toi(ten)]


@router.delete("/api/tu-lieu/{ma}", status_code=204)
def rut_lai(ma: int, ten: str = Depends(auth.yeu_cau_dang_nhap)):
    """Rút lại tư liệu của mình khi chưa ai duyệt."""
    _can_db()
    if not db.xoa_tu_lieu_cua_toi(ma, ten):
        # Gộp chung ba trường hợp (không có, không phải của mình, đã duyệt
        # rồi) vào một câu. Phân biệt ra thì người ta dò được id nào tồn tại.
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không rút lại được. Có thể iMob đã xem tư liệu này rồi.",
        )
    return None


# ============================================================
# Của quản trị
# ============================================================
@router.get("/api/quan-tri/tu-lieu", dependencies=[Depends(CHI_QUAN_TRI)])
def hang_doi(trang_thai: str | None = None):
    _can_db()
    if trang_thai and trang_thai not in TRANG_THAI_HOP_LE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Trạng thái không hợp lệ: {trang_thai}",
        )
    return {
        "danh_sach": [_ra(h) for h in db.danh_sach_tu_lieu(trang_thai)],
        "dem": db.dem_tu_lieu_theo_trang_thai(),
    }


@router.put("/api/quan-tri/tu-lieu/{ma}", response_model=TuLieu)
def duyet(ma: int, yeu_cau: YeuCauDuyet, nguoi: str = Depends(CHI_QUAN_TRI)):
    _can_db()

    if yeu_cau.trang_thai not in TRANG_THAI_HOP_LE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Trạng thái không hợp lệ: {yeu_cau.trang_thai}",
        )

    ly_do = don_chu(yeu_cau.ly_do, DAI_LY_DO_TOI_DA)
    if yeu_cau.trang_thai == db.TRANG_THAI_TU_CHOI and not ly_do:
        # Bắt buộc có lý do khi từ chối. Không có thì người gửi sẽ gửi lại đúng
        # cái vừa bị loại, và cả hai bên cùng mất công thêm một lượt nữa.
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Từ chối thì phải ghi lý do để người gửi biết cần sửa gì.",
        )
    # Duyệt hoặc trả về hàng đợi thì không giữ lại lý do cũ — để lại là người
    # gửi thấy tư liệu đã duyệt mà vẫn kèm một câu chê từ lần trước.
    if yeu_cau.trang_thai != db.TRANG_THAI_TU_CHOI:
        ly_do = ""

    hang = db.duyet_tu_lieu(ma, yeu_cau.trang_thai, ly_do, nguoi)
    if hang is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy tư liệu này."
        )
    return _ra(hang)
