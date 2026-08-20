"""Kết nối PostgreSQL: tạo bảng, nạp dữ liệu ban đầu, và các hàm đọc/ghi.

QUAN TRỌNG — DATABASE LÀ TÙY CHỌN:
Nếu không đặt biến môi trường DATABASE_URL thì mọi hàm ở đây lặng lẽ không làm
gì (`co_db()` trả False). Chatbot vẫn chạy bình thường như trước, chỉ là không
có CMS và không lưu được liên hệ. Nhờ vậy:
  - chạy thử chatbot ở máy không bắt buộc phải cài database,
  - và nếu database chết trên Render thì API chat vẫn sống.

Dùng SQL thuần qua psycopg 3 (không dùng ORM) để nhìn thấy câu lệnh SQL thật.
Mọi giá trị đều truyền dạng THAM SỐ (%s), không nối chuỗi — đây là cách chặn
lỗi SQL injection.
"""

import cau_hinh  # noqa: F401  — phải nạp .env TRƯỚC khi đọc os.getenv bên dưới

import json
import logging
import os
from pathlib import Path

from psycopg.rows import dict_row
from psycopg.types.json import Jsonb
from psycopg_pool import ConnectionPool

log = logging.getLogger("imob.db")

# ============================================================
# Cấu hình
# ============================================================
def _chuan_hoa_url(url: str) -> str:
    """Một số nơi cấp URL bắt đầu bằng postgres:// — psycopg muốn postgresql://."""
    url = url.strip()
    if url.startswith("postgres://"):
        return "postgresql://" + url[len("postgres://") :]
    return url


DATABASE_URL = _chuan_hoa_url(os.getenv("DATABASE_URL", ""))

# Thư mục src/data của website — nguồn nạp lần đầu.
# chatbot-python/ nằm trong repo nên đi ngược một cấp là tới gốc dự án.
GOC_DU_AN = Path(__file__).resolve().parent.parent
THU_MUC_DATA = GOC_DU_AN / "src" / "data"

# khóa trong bảng noi_dung  ->  file JSON tương ứng của website
NGUON_NAP = {
    "company": THU_MUC_DATA / "company.json",
    "legalPages": THU_MUC_DATA / "legalPages.json",
    "hero": THU_MUC_DATA / "hero.json",
    "about": THU_MUC_DATA / "about.json",
    "giaoDien": THU_MUC_DATA / "giaoDien.json",
    "projects": THU_MUC_DATA / "projects.json",
}

_pool: ConnectionPool | None = None

# Có ĐẶT DATABASE_URL hay không. Khác với co_db(): biến này chỉ nói "người dùng
# có ý định dùng database", còn co_db() nói "database đang thật sự dùng được".
DA_CAU_HINH = bool(DATABASE_URL)


def co_db() -> bool:
    """Database có đang dùng được không?

    Trả False khi: chưa đặt DATABASE_URL, HOẶC đã đặt nhưng kết nối lúc khởi
    động thất bại. Nhờ vậy database chết cũng chỉ làm tắt CMS chứ không kéo
    sập API chat — mọi hàm gọi tới đây đều tự biết đường lùi.
    """
    return _pool is not None


def pool() -> ConnectionPool:
    if _pool is None:
        raise RuntimeError("Database chưa sẵn sàng (chưa khoi_tao() hoặc kết nối lỗi)")
    return _pool


# ============================================================
# Tạo bảng + nạp dữ liệu lần đầu
# ============================================================
SQL_TAO_BANG = """
-- Nội dung website. Lưu nguyên cục JSON để giữ đúng hình dạng mà giao diện
-- đang vẽ (vd legalPages có sections lồng items) — khỏi phải tách chục bảng.
CREATE TABLE IF NOT EXISTS noi_dung (
    khoa          TEXT PRIMARY KEY,
    du_lieu       JSONB NOT NULL,
    cap_nhat_luc  TIMESTAMPTZ NOT NULL DEFAULT now(),
    nguoi_sua     TEXT
);

-- Tài khoản quản trị. Chỉ lưu BĂM của mật khẩu, không bao giờ lưu mật khẩu thô.
CREATE TABLE IF NOT EXISTS nguoi_dung (
    ten_dang_nhap TEXT PRIMARY KEY,
    mat_khau_hash TEXT NOT NULL,
    vai_tro       TEXT NOT NULL DEFAULT 'quan_tri',
    tao_luc       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Database đã tạo từ trước thì CREATE TABLE IF NOT EXISTS ở trên không đụng tới,
-- nên phải thêm cột riêng. Mọi tài khoản cũ mặc định là quản trị đầy đủ.
ALTER TABLE nguoi_dung
    ADD COLUMN IF NOT EXISTS vai_tro TEXT NOT NULL DEFAULT 'quan_tri';

-- Ảnh tải lên từ trang quản trị.
--
-- VÌ SAO LƯU TRONG DATABASE CHỨ KHÔNG GHI RA ĐĨA: Render gói free cấp cho mỗi
-- service một ổ đĩa TẠM. Deploy lại hoặc service ngủ dậy là ổ đó về trắng —
-- ảnh vừa tải lên tuần trước sẽ biến mất mà không có cảnh báo nào. Database thì
-- nằm riêng và còn mãi.
--
-- BYTEA = mảng byte thô. Ảnh đã được nén sang WebP ngay trên trình duyệt trước
-- khi gửi lên (xem components/admin/ChonAnh.jsx), nên mỗi tấm chỉ khoảng
-- 80–200KB thay vì 3–5MB của ảnh gốc chụp từ điện thoại.
CREATE TABLE IF NOT EXISTS anh (
    id            TEXT PRIMARY KEY,
    ten_goc       TEXT NOT NULL,
    kieu          TEXT NOT NULL,
    du_lieu       BYTEA NOT NULL,
    kich_thuoc    INTEGER NOT NULL,
    nguoi_tai_len TEXT,
    tao_luc       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS anh_moi_nhat ON anh (tao_luc DESC);

-- Khách để lại thông tin (từ form liên hệ hoặc từ chatbot).
-- ĐÂY LÀ DỮ LIỆU CÁ NHÂN — xem Nghị định 13/2023.
CREATE TABLE IF NOT EXISTS lien_he (
    id            BIGSERIAL PRIMARY KEY,
    nguon         TEXT NOT NULL,
    ho_ten        TEXT,
    email         TEXT,
    so_dien_thoai TEXT,
    dich_vu       TEXT,
    loi_nhan      TEXT,
    da_xu_ly      BOOLEAN NOT NULL DEFAULT false,
    tao_luc       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lien_he_moi_nhat ON lien_he (tao_luc DESC);
"""


def khoi_tao() -> bool:
    """Mở pool, tạo bảng, nạp nội dung và tài khoản admin lần đầu.

    Trả True nếu database sẵn sàng. KHÔNG ném lỗi ra ngoài khi kết nối hỏng —
    chỉ ghi log rồi trả False, để API chat vẫn khởi động được bình thường.
    """
    global _pool
    if not DA_CAU_HINH:
        log.warning("Chưa đặt DATABASE_URL — bỏ qua database, CMS sẽ không hoạt động.")
        return False

    try:
        # max_size nhỏ: Postgres gói free giới hạn số kết nối khá chặt.
        _pool = ConnectionPool(
            DATABASE_URL,
            min_size=1,
            max_size=4,
            kwargs={"row_factory": dict_row},
            open=False,
        )
        _pool.open(wait=True, timeout=30)

        with _pool.connection() as conn:
            conn.execute(SQL_TAO_BANG)

        _nap_noi_dung_lan_dau()
        _dat_tai_khoan_admin()
        _dat_tai_khoan_thu()
    except Exception:
        log.exception(
            "Không kết nối được database — CMS và lưu liên hệ sẽ TẮT, "
            "nhưng chatbot vẫn chạy bình thường."
        )
        if _pool is not None:
            try:
                _pool.close()
            except Exception:
                pass
            _pool = None
        return False

    log.info("Database sẵn sàng.")
    return True


def _nap_noi_dung_lan_dau() -> None:
    """Bảng noi_dung trống khóa nào thì đổ file JSON tương ứng vào khóa đó.

    Chỉ nạp khi THIẾU, nên chạy lại nhiều lần cũng không ghi đè nội dung bạn
    đã sửa trong trang admin.

    Mặt trái của việc "chỉ nạp khi thiếu": sửa file JSON trong mã nguồn rồi
    deploy thì database VẪN GIỮ BẢN CŨ, và website lấy database phủ lên bản
    mặc định nên khách thấy nội dung cũ dù mã nguồn đã đúng. Muốn ép lấy bản
    mới thì vào /admin bấm "Nạp lại từ file gốc" — nút đó đọc JSON từ bundle
    của website (luôn mới) rồi PUT đè, không cần chạy tay câu DELETE ở đây.
    """
    for khoa, duong_dan in NGUON_NAP.items():
        if not duong_dan.exists():
            # Trên Render, chatbot-python chạy với rootDir riêng nhưng repo được
            # tải đủ nên ../src/data vẫn có. Nếu vì lý do gì mà thiếu thì bỏ qua:
            # website đã có sẵn bản JSON trong bundle để dùng làm mặc định.
            log.warning("Không thấy %s — bỏ qua nạp '%s'.", duong_dan, khoa)
            continue

        with duong_dan.open(encoding="utf-8") as f:
            du_lieu = json.load(f)

        with pool().connection() as conn:
            conn.execute(
                """
                INSERT INTO noi_dung (khoa, du_lieu, nguoi_sua)
                VALUES (%s, %s, 'nạp lần đầu')
                ON CONFLICT (khoa) DO NOTHING
                """,
                (khoa, Jsonb(du_lieu)),
            )


def _dat_tai_khoan_admin() -> None:
    """Đặt tài khoản quản trị theo ADMIN_USER / ADMIN_PASSWORD.

    ADMIN_PASSWORD là NGUỒN SỰ THẬT của mật khẩu: đặt lại biến đó rồi khởi động
    lại máy chủ là mật khẩu đổi theo. Bỏ trống biến thì không đụng gì tới tài
    khoản đang có.

    Trước đây câu lệnh dùng ON CONFLICT DO NOTHING, nghĩa là mật khẩu chỉ được
    ghi đúng MỘT LẦN lúc tạo tài khoản. Hậu quả: quên mật khẩu là kẹt hẳn — sửa
    ADMIN_PASSWORD trên Render không có tác dụng gì, cách vào lại duy nhất là
    chạy tay câu SQL xóa dòng trong bảng nguoi_dung.

    Đánh đổi: nếu sau này làm chức năng "đổi mật khẩu" ngay trong trang admin
    thì mỗi lần khởi động lại máy chủ sẽ kéo mật khẩu về đúng giá trị của biến
    môi trường. Lúc đó phải sửa lại chỗ này. Hiện chưa có chức năng đó."""
    from auth import bam_mat_khau  # import tại chỗ cho khỏi vòng lặp import

    ten = os.getenv("ADMIN_USER", "").strip()
    mat_khau = os.getenv("ADMIN_PASSWORD", "")

    if not ten or not mat_khau:
        with pool().connection() as conn:
            co_ai = conn.execute("SELECT 1 FROM nguoi_dung LIMIT 1").fetchone()
        if not co_ai:
            log.warning(
                "Chưa có tài khoản admin nào và chưa đặt ADMIN_USER/ADMIN_PASSWORD "
                "-> sẽ không đăng nhập được vào trang quản trị."
            )
        return

    if len(mat_khau) < 8:
        raise RuntimeError("ADMIN_PASSWORD phải dài ít nhất 8 ký tự.")

    with pool().connection() as conn:
        conn.execute(
            """
            INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash)
            VALUES (%s, %s)
            ON CONFLICT (ten_dang_nhap) DO UPDATE
                SET mat_khau_hash = EXCLUDED.mat_khau_hash
            """,
            (ten, bam_mat_khau(mat_khau)),
        )


def _dat_tai_khoan_thu() -> None:
    """Tài khoản DÙNG THỬ cho người kiểm thử — mật khẩu hiện công khai ở /admin.

    Bật bằng cách đặt cả hai biến TESTER_USER và TESTER_PASSWORD. Bỏ trống một
    trong hai thì tài khoản bị XÓA khỏi database và dòng gợi ý ở màn hình đăng
    nhập cũng tự biến mất — tắt bằng một biến môi trường, không phải sửa code.

    ⚠️ VAI TRÒ 'khach_thu', KHÔNG PHẢI 'quan_tri'. Đây là điểm mấu chốt của cả
    tính năng này: mật khẩu đã hiện công khai thì coi như cả internet đăng nhập
    được. Tài khoản đó TUYỆT ĐỐI không được chạm vào bảng lien_he — trong đó là
    họ tên, số điện thoại, email và lời nhắn của khách thật, tức dữ liệu cá nhân
    thuộc phạm vi Nghị định 13/2023. Chặn ở máy chủ (api_lien_he.py dùng
    yeu_cau_quan_tri) chứ không chỉ ẩn cái tab đi ở giao diện — ẩn giao diện thì
    người ta vẫn gọi thẳng API đọc được.

    Tài khoản thử VẪN sửa được nội dung website, vì nếu không thì chẳng kiểm thử
    được gì. Rủi ro đó chấp nhận được: nội dung luôn khôi phục lại được bằng nút
    "Nạp lại từ file gốc" trong trang quản trị.
    """
    from auth import VAI_KHACH_THU, bam_mat_khau

    ten = os.getenv("TESTER_USER", "").strip()
    mat_khau = os.getenv("TESTER_PASSWORD", "")

    if not ten or not mat_khau:
        # Dọn tài khoản thử cũ nếu có: quên xóa là để hở một cửa vào vĩnh viễn.
        with pool().connection() as conn:
            da_xoa = conn.execute(
                "DELETE FROM nguoi_dung WHERE vai_tro = %s RETURNING ten_dang_nhap",
                (VAI_KHACH_THU,),
            ).fetchall()
        if da_xoa:
            log.info("Đã xóa tài khoản dùng thử (TESTER_USER/TESTER_PASSWORD bỏ trống).")
        return

    if len(mat_khau) < 8:
        log.error("TESTER_PASSWORD phải dài ít nhất 8 ký tự — bỏ qua tài khoản thử.")
        return

    with pool().connection() as conn:
        # Không cho trùng tên với tài khoản quản trị: nếu trùng, câu UPDATE bên
        # dưới sẽ hạ chính tài khoản thật xuống vai khách thử và khóa mình ra
        # ngoài phần Liên hệ.
        dang_co = conn.execute(
            "SELECT vai_tro FROM nguoi_dung WHERE ten_dang_nhap = %s",
            (ten,),
        ).fetchone()
        if dang_co and dang_co["vai_tro"] != VAI_KHACH_THU:
            log.error(
                "TESTER_USER trùng tên với tài khoản quản trị '%s' — bỏ qua, "
                "nếu không sẽ tự hạ quyền chính mình. Đặt tên khác đi.",
                ten,
            )
            return

        # Xóa tài khoản thử CŨ trước: đổi TESTER_USER sang tên mới mà không xóa
        # tên cũ thì cả hai cùng đăng nhập được, trong khi màn hình chỉ hiện tên
        # mới — một cửa vào mà không ai còn nhớ.
        conn.execute(
            "DELETE FROM nguoi_dung WHERE vai_tro = %s AND ten_dang_nhap <> %s",
            (VAI_KHACH_THU, ten),
        )
        conn.execute(
            """
            INSERT INTO nguoi_dung (ten_dang_nhap, mat_khau_hash, vai_tro)
            VALUES (%s, %s, %s)
            ON CONFLICT (ten_dang_nhap) DO UPDATE
                SET mat_khau_hash = EXCLUDED.mat_khau_hash,
                    vai_tro       = EXCLUDED.vai_tro
            """,
            (ten, bam_mat_khau(mat_khau), VAI_KHACH_THU),
        )
    log.warning(
        "Tài khoản dùng thử '%s' đang BẬT — mật khẩu hiện công khai ở /admin. "
        "Tài khoản này không xem được mục Liên hệ.",
        ten,
    )


def dong() -> None:
    global _pool
    if _pool is not None:
        _pool.close()
        _pool = None


# ============================================================
# Nội dung website
# ============================================================
def lay_tat_ca_noi_dung() -> dict:
    """Trả về {'company': {...}, 'legalPages': {...}} — dùng cho GET công khai."""
    if not co_db():
        return {}
    with pool().connection() as conn:
        dong_du_lieu = conn.execute("SELECT khoa, du_lieu FROM noi_dung").fetchall()
    return {d["khoa"]: d["du_lieu"] for d in dong_du_lieu}


def ghi_noi_dung(khoa: str, du_lieu, nguoi_sua: str) -> None:
    with pool().connection() as conn:
        conn.execute(
            """
            INSERT INTO noi_dung (khoa, du_lieu, cap_nhat_luc, nguoi_sua)
            VALUES (%s, %s, now(), %s)
            ON CONFLICT (khoa)
            DO UPDATE SET du_lieu = EXCLUDED.du_lieu,
                          cap_nhat_luc = now(),
                          nguoi_sua = EXCLUDED.nguoi_sua
            """,
            (khoa, Jsonb(du_lieu), nguoi_sua),
        )


# ============================================================
# Tài khoản
# ============================================================
def lay_nguoi_dung(ten_dang_nhap: str) -> dict | None:
    if not co_db():
        return None
    with pool().connection() as conn:
        return conn.execute(
            "SELECT ten_dang_nhap, mat_khau_hash, vai_tro FROM nguoi_dung WHERE ten_dang_nhap = %s",
            (ten_dang_nhap,),
        ).fetchone()


# ============================================================
# Liên hệ
# ============================================================
def them_lien_he(
    nguon: str,
    ho_ten: str | None = None,
    email: str | None = None,
    so_dien_thoai: str | None = None,
    dich_vu: str | None = None,
    loi_nhan: str | None = None,
) -> int | None:
    """Lưu một liên hệ. Trả về id, hoặc None nếu chưa cấu hình database."""
    if not co_db():
        log.info("Chưa có database — bỏ qua lưu liên hệ từ '%s'.", nguon)
        return None

    with pool().connection() as conn:
        dong_moi = conn.execute(
            """
            INSERT INTO lien_he (nguon, ho_ten, email, so_dien_thoai, dich_vu, loi_nhan)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
            """,
            (nguon, ho_ten, email, so_dien_thoai, dich_vu, loi_nhan),
        ).fetchone()
    return dong_moi["id"]


def danh_sach_lien_he(gioi_han: int = 200) -> list[dict]:
    with pool().connection() as conn:
        return conn.execute(
            """
            SELECT id, nguon, ho_ten, email, so_dien_thoai, dich_vu, loi_nhan,
                   da_xu_ly, tao_luc
            FROM lien_he
            ORDER BY tao_luc DESC
            LIMIT %s
            """,
            (gioi_han,),
        ).fetchall()


def danh_dau_lien_he(ma: int, da_xu_ly: bool) -> bool:
    with pool().connection() as conn:
        dong_sua = conn.execute(
            "UPDATE lien_he SET da_xu_ly = %s WHERE id = %s RETURNING id",
            (da_xu_ly, ma),
        ).fetchone()
    return dong_sua is not None


# ============================================================
# Ảnh tải lên từ trang quản trị
#
# Trước đây muốn đổi ảnh sản phẩm phải: chép file vào public/anh/ -> gõ đường
# dẫn tay -> commit -> push -> chờ deploy. Người không biết Git thì chịu.
# Giờ tải thẳng trong /admin, ảnh nằm trong database và có địa chỉ /api/anh/<id>.
# ============================================================
def them_anh(
    ma: str,
    ten_goc: str,
    kieu: str,
    du_lieu: bytes,
    nguoi_tai_len: str,
) -> None:
    with pool().connection() as conn:
        conn.execute(
            """
            INSERT INTO anh (id, ten_goc, kieu, du_lieu, kich_thuoc, nguoi_tai_len)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (ma, ten_goc, kieu, du_lieu, len(du_lieu), nguoi_tai_len),
        )


def lay_anh(ma: str) -> dict | None:
    """Đọc một tấm ảnh để trả về cho trình duyệt. Đây là đường CÔNG KHAI."""
    if not co_db():
        return None
    with pool().connection() as conn:
        return conn.execute(
            "SELECT kieu, du_lieu FROM anh WHERE id = %s", (ma,)
        ).fetchone()


def danh_sach_anh(gioi_han: int = 200) -> list[dict]:
    """Danh sách ảnh cho ô chọn trong trang quản trị.

    CỐ Ý không lấy cột du_lieu: mỗi tấm cả trăm KB, kéo 200 tấm về chỉ để vẽ
    một danh sách tên thì vừa chậm vừa vô ích. Giao diện lấy ảnh qua
    /api/anh/<id>, và trình duyệt tự nhớ (cache) nên chỉ tải mỗi tấm một lần.
    """
    with pool().connection() as conn:
        return conn.execute(
            """
            SELECT id, ten_goc, kieu, kich_thuoc, nguoi_tai_len, tao_luc
            FROM anh
            ORDER BY tao_luc DESC
            LIMIT %s
            """,
            (gioi_han,),
        ).fetchall()


def xoa_anh(ma: str) -> bool:
    with pool().connection() as conn:
        dong_xoa = conn.execute(
            "DELETE FROM anh WHERE id = %s RETURNING id", (ma,)
        ).fetchone()
    return dong_xoa is not None


def tong_dung_luong_anh() -> int:
    """Tổng số byte mọi ảnh đang chiếm. Trang quản trị hiện con số này ra.

    Postgres gói free chỉ có 1GB dùng chung cho cả nội dung lẫn liên hệ — không
    ai nhìn thấy mức đang dùng thì tới lúc đầy mới biết, và lúc đó thì mọi thứ
    cùng hỏng một lượt chứ không riêng phần ảnh.
    """
    with pool().connection() as conn:
        dong_tong = conn.execute(
            "SELECT COALESCE(SUM(kich_thuoc), 0) AS tong FROM anh"
        ).fetchone()
    return int(dong_tong["tong"])
