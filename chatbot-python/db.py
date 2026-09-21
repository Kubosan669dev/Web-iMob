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
    "doiTac": THU_MUC_DATA / "doiTac.json",
}

# Giá trị cột `nguoi_sua` cho bản do MÁY nạp từ file JSON trong mã nguồn.
# Đây là DẤU HIỆU "khoá này chưa ai sửa tay", và _nap_noi_dung_lan_dau() dựa
# hẳn vào nó để biết được phép cập nhật khoá nào. ⚠️ Đổi chuỗi này là mọi bản
# ghi cũ trong database bỗng trở thành "có người sửa" và không bao giờ được
# cập nhật theo mã nguồn nữa.
NGUOI_SUA_TU_DONG = "nạp lần đầu"

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

-- ⚠️ XOÁ BẢNG tai_khoan_demo (21/09/2026).
--
-- Bảng đó lưu một mật khẩu DẠNG THÔ, cố ý, để in công khai lên màn hình đăng
-- nhập cho người kiểm thử tự vào. Tính năng đã bỏ theo yêu cầu, nên để bảng
-- nằm lại là giữ một mật khẩu rõ trong database mà không ai còn dùng tới —
-- đúng thứ mình vừa muốn dọn đi.
--
-- Dòng này chạy mỗi lần khởi động và vô hại khi bảng đã biến mất. Khoảng vài
-- tháng nữa, khi chắc chắn mọi máy chủ đều đã chạy qua bản này, gỡ đi được.
DROP TABLE IF EXISTS tai_khoan_demo;

-- Dọn nốt tài khoản mang vai 'khach_thu' nếu còn sót. Quên bước này là để hở
-- một cửa vào vĩnh viễn bằng một mật khẩu từng được in công khai.
DELETE FROM nguoi_dung WHERE vai_tro = 'khach_thu';

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

-- Bài viết của mục "Câu chuyện khách hàng".
--
-- VÌ SAO LÀ BẢNG RIÊNG, KHÔNG PHẢI MỘT KHOÁ TRONG noi_dung: mọi khoá trong
-- noi_dung được đọc HẾT một lượt mỗi lần khách mở bất kỳ trang nào
-- (GET /api/noi-dung). Nhét bài viết vào đó thì ai vào trang chủ cũng kéo về
-- toàn bộ thân bài của mọi bài viết — càng viết nhiều trang chủ càng nặng,
-- trong khi trang chủ không dùng tới chữ nào. Bảng riêng còn cho phép lọc
-- nháp/đã đăng ngay trong câu SQL và cho mỗi bài một đường dẫn riêng.
--
-- duong_dan là phần đuôi URL (/cau-chuyen/<duong_dan>), không dấu. UNIQUE vì
-- hai bài trùng đường dẫn thì một bài vĩnh viễn không ai mở được.
--
-- noi_dung là CHỮ THUẦN, không phải HTML. Giao diện tách đoạn theo dòng trống
-- rồi vẽ bằng <p>. Cố ý không nhận HTML: nội dung do người dùng gõ mà đem
-- chèn thẳng vào trang là mở cửa cho XSS.
CREATE TABLE IF NOT EXISTS bai_viet (
    id            BIGSERIAL PRIMARY KEY,
    duong_dan     TEXT UNIQUE NOT NULL,
    -- 'cau_chuyen' (chuyện khách hàng) hoặc 'tin_cong_ty' (thông báo của iMob).
    -- Hai loại nằm chung MỘT bảng vì chúng giống hệt nhau về cấu trúc và về
    -- cách soạn; tách hai bảng là nhân đôi mọi thứ để đổi lấy một chữ.
    loai          TEXT NOT NULL DEFAULT 'cau_chuyen',
    tieu_de       TEXT NOT NULL,
    tom_tat       TEXT NOT NULL DEFAULT '',
    noi_dung      TEXT NOT NULL DEFAULT '',
    anh_bia       TEXT,
    ten_khach     TEXT,
    da_dang       BOOLEAN NOT NULL DEFAULT false,
    dang_luc      TIMESTAMPTZ,
    tao_luc       TIMESTAMPTZ NOT NULL DEFAULT now(),
    cap_nhat_luc  TIMESTAMPTZ NOT NULL DEFAULT now(),
    nguoi_sua     TEXT
);

-- Bảng đã tạo từ bản trước (chạy thật 21/09/2026) thì CREATE TABLE IF NOT
-- EXISTS ở trên không đụng tới, nên phải thêm cột riêng. Bài cũ mặc định là
-- câu chuyện khách hàng — đúng với thực tế vì lúc đó chưa có loại nào khác.
ALTER TABLE bai_viet
    ADD COLUMN IF NOT EXISTS loai TEXT NOT NULL DEFAULT 'cau_chuyen';

-- Câu truy vấn của trang công khai luôn là "đúng loại, da_dang = true,
-- mới nhất trước" — ba cột đúng thứ tự đó.
CREATE INDEX IF NOT EXISTS bai_viet_theo_loai
    ON bai_viet (loai, da_dang, dang_luc DESC);
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
    """Đổ file JSON trong mã nguồn vào bảng noi_dung — nhưng CHỈ những khoá
    chưa từng có người sửa trong trang admin.

    ---- Vì sao phải phân biệt "ai sửa" (đổi 22/08/2026) ----
    Bản trước dùng ON CONFLICT DO NOTHING: có rồi thì thôi. An toàn nhưng sai
    ở một chỗ đắt giá — sửa file JSON trong mã rồi deploy thì database VẪN GIỮ
    BẢN CŨ, mà website lại lấy database phủ lên bản mặc định. Kết quả: mã
    nguồn đúng, web chạy sai, và không có lỗi nào hiện ra.

    Đã dính đúng lỗi này ngay hôm thêm dải đối tác: lần deploy đầu nạp danh
    sách 11 đơn vị CHƯA có logo; lần deploy sau file JSON đã có đủ 8 logo
    nhưng database không nhận, nên trên web thật dải đối tác không có logo
    nào. Bảng màu mới cũng vậy — máy chủ vẫn trả về bảng cũ.

    Cách phân biệt: cột `nguoi_sua`. Chỉ có ĐÚNG HAI nơi ghi vào bảng này —
    hàm này (ghi hằng NGUOI_SUA_TU_DONG) và ghi_noi_dung() khi người dùng bấm
    Lưu trong /admin (ghi tên đăng nhập). Nên `nguoi_sua` còn nguyên giá trị
    tự động nghĩa là CHƯA AI ĐỘNG TỚI khoá đó, cập nhật theo mã nguồn là an
    toàn tuyệt đối. Ngược lại, khoá nào người dùng đã sửa thì giữ nguyên —
    công sức gõ trong admin không bao giờ bị deploy xoá mất.

    `IS DISTINCT FROM` để không dập cap_nhat_luc mỗi lần khởi động lại máy chủ
    khi nội dung y hệt.

    Muốn ép lấy bản trong mã cho một khoá ĐÃ TỪNG SỬA thì vào /admin bấm
    "Nạp lại từ file gốc" — nút đó đọc JSON từ bundle của website rồi PUT đè.
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
            kq = conn.execute(
                """
                INSERT INTO noi_dung (khoa, du_lieu, nguoi_sua)
                VALUES (%s, %s, %s)
                ON CONFLICT (khoa) DO UPDATE
                       SET du_lieu      = EXCLUDED.du_lieu,
                           cap_nhat_luc = now()
                     WHERE noi_dung.nguoi_sua = %s
                       AND noi_dung.du_lieu IS DISTINCT FROM EXCLUDED.du_lieu
                """,
                (khoa, Jsonb(du_lieu), NGUOI_SUA_TU_DONG, NGUOI_SUA_TU_DONG),
            )
            if kq.rowcount:
                log.info("Khoá '%s' lấy theo bản trong mã nguồn.", khoa)


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


# ============================================================
# Bài viết — mục "Câu chuyện khách hàng"
#
# Hai đường đọc tách hẳn nhau:
#   · danh_sach_bai_viet(chi_da_dang=True)  — trang công khai
#   · danh_sach_bai_viet(chi_da_dang=False) — trang quản trị, thấy cả bài nháp
#
# Tách bằng THAM SỐ chứ không bằng hai hàm giống nhau, để chỗ lọc `da_dang`
# chỉ nằm ở đúng một dòng SQL. Hai hàm song song thì sớm muộn cũng có một hàm
# được sửa mà hàm kia quên, và bản quên chính là bản làm lộ bài nháp.
# ============================================================

# Danh sách KHÔNG kéo theo cột noi_dung: thân bài có thể vài nghìn chữ, mà
# trang danh sách chỉ vẽ tiêu đề với tóm tắt. Xem thêm ghi chú ở danh_sach_anh.
COT_TOM_LUOC = (
    "id, duong_dan, loai, tieu_de, tom_tat, anh_bia, ten_khach, "
    "da_dang, dang_luc, tao_luc, cap_nhat_luc, nguoi_sua"
)


def danh_sach_bai_viet(
    chi_da_dang: bool = True,
    loai: str | None = None,
    gioi_han: int = 100,
) -> list[dict]:
    """loai=None nghĩa là lấy mọi loại — trang quản trị dùng kiểu đó."""
    if not co_db():
        return []
    with pool().connection() as conn:
        if chi_da_dang:
            return conn.execute(
                f"""
                SELECT {COT_TOM_LUOC} FROM bai_viet
                WHERE da_dang = true
                  AND (%s::text IS NULL OR loai = %s)
                ORDER BY dang_luc DESC NULLS LAST, id DESC
                LIMIT %s
                """,
                (loai, loai, gioi_han),
            ).fetchall()
        # Trang quản trị: bài nháp lên trước để người viết thấy ngay việc dở dang.
        return conn.execute(
            f"""
            SELECT {COT_TOM_LUOC} FROM bai_viet
            ORDER BY da_dang ASC, cap_nhat_luc DESC
            LIMIT %s
            """,
            (gioi_han,),
        ).fetchall()


def lay_bai_viet_theo_duong_dan(duong_dan: str, chi_da_dang: bool = True) -> dict | None:
    """Một bài đầy đủ (có thân bài) để vẽ trang đọc."""
    if not co_db():
        return None
    with pool().connection() as conn:
        return conn.execute(
            """
            SELECT * FROM bai_viet
            WHERE duong_dan = %s AND (%s = false OR da_dang = true)
            """,
            (duong_dan, chi_da_dang),
        ).fetchone()


def lay_bai_viet(ma: int) -> dict | None:
    if not co_db():
        return None
    with pool().connection() as conn:
        return conn.execute("SELECT * FROM bai_viet WHERE id = %s", (ma,)).fetchone()


def duong_dan_dang_dung(duong_dan: str, tru_ma: int | None = None) -> bool:
    """Đường dẫn này đã có bài khác dùng chưa? (bỏ qua chính bài đang sửa)"""
    with pool().connection() as conn:
        return conn.execute(
            "SELECT 1 FROM bai_viet WHERE duong_dan = %s AND id IS DISTINCT FROM %s",
            (duong_dan, tru_ma),
        ).fetchone() is not None


def them_bai_viet(
    duong_dan: str,
    loai: str,
    tieu_de: str,
    tom_tat: str,
    noi_dung: str,
    anh_bia: str | None,
    ten_khach: str | None,
    da_dang: bool,
    nguoi_sua: str,
) -> dict:
    """Thêm một bài. dang_luc chỉ được đặt khi bài THẬT SỰ được đăng."""
    with pool().connection() as conn:
        return conn.execute(
            """
            INSERT INTO bai_viet (duong_dan, loai, tieu_de, tom_tat, noi_dung,
                                  anh_bia, ten_khach, da_dang, dang_luc, nguoi_sua)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s,
                    CASE WHEN %s THEN now() ELSE NULL END, %s)
            RETURNING *
            """,
            (duong_dan, loai, tieu_de, tom_tat, noi_dung, anh_bia, ten_khach,
             da_dang, da_dang, nguoi_sua),
        ).fetchone()


def sua_bai_viet(
    ma: int,
    duong_dan: str,
    loai: str,
    tieu_de: str,
    tom_tat: str,
    noi_dung: str,
    anh_bia: str | None,
    ten_khach: str | None,
    da_dang: bool,
    nguoi_sua: str,
) -> dict | None:
    """Sửa một bài.

    dang_luc GIỮ NGUYÊN nếu bài vốn đã đăng — sửa lỗi chính tả trong một bài
    cũ không được làm nó nhảy lên đầu danh sách như bài mới. Chỉ đặt dang_luc
    vào đúng lần đầu chuyển từ nháp sang đăng; gỡ xuống nháp thì xoá đi để lần
    đăng sau lấy mốc mới.
    """
    with pool().connection() as conn:
        return conn.execute(
            """
            UPDATE bai_viet SET
                duong_dan    = %s,
                loai         = %s,
                tieu_de      = %s,
                tom_tat      = %s,
                noi_dung     = %s,
                anh_bia      = %s,
                ten_khach    = %s,
                da_dang      = %s,
                dang_luc     = CASE
                                 WHEN %s = false THEN NULL
                                 WHEN dang_luc IS NULL THEN now()
                                 ELSE dang_luc
                               END,
                cap_nhat_luc = now(),
                nguoi_sua    = %s
            WHERE id = %s
            RETURNING *
            """,
            (duong_dan, loai, tieu_de, tom_tat, noi_dung, anh_bia, ten_khach,
             da_dang, da_dang, nguoi_sua, ma),
        ).fetchone()


def xoa_bai_viet(ma: int) -> bool:
    with pool().connection() as conn:
        return conn.execute(
            "DELETE FROM bai_viet WHERE id = %s RETURNING id", (ma,)
        ).fetchone() is not None
