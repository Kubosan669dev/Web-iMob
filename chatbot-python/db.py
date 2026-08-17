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
    tao_luc       TIMESTAMPTZ NOT NULL DEFAULT now()
);

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
        _tao_admin_lan_dau()
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


def _tao_admin_lan_dau() -> None:
    """Tạo tài khoản admin từ ADMIN_USER / ADMIN_PASSWORD nếu chưa có ai."""
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
            ON CONFLICT (ten_dang_nhap) DO NOTHING
            """,
            (ten, bam_mat_khau(mat_khau)),
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
            "SELECT ten_dang_nhap, mat_khau_hash FROM nguoi_dung WHERE ten_dang_nhap = %s",
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
