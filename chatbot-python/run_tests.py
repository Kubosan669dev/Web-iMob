"""Chạy bộ test_cases trong file dữ liệu và kiểm tra vài lằn ranh quan trọng.

    python run_tests.py

Với mỗi câu test, in ra câu trả lời của bot và tự kiểm:
  - Câu hỏi giá  -> câu trả lời KHÔNG được chứa số tiền.
  - Câu dụ đổi vai (prompt injection) -> bot phải từ chối, hướng về hotline.
  - Vài câu có nội dung bắt buộc (bảo hành, địa chỉ, số tính năng, source code).
"""

import os
import sys
from pathlib import Path

# TẮT Gemini trong lúc chạy test — phải đặt TRƯỚC khi nạp imob_bot.
#
# Vì sao: bộ test này kiểm những lằn ranh KHÔNG ĐƯỢC PHÉP SAI (không đưa số
# tiền, không đổi vai khi bị dụ). Nếu để Gemini bật, cùng một câu hỏi có thể ra
# kết quả khác nhau giữa hai lần chạy, test hỏng lúc được lúc không thì mất
# sạch giá trị. Ngoài ra test phải chạy được khi không có mạng và không được
# tiêu quota của công ty mỗi lần ai đó gõ `python run_tests.py`.
#
# Muốn thử Gemini thật thì chạy backend rồi gọi /api/chat, đừng bật ở đây.
os.environ["GEMINI_API_KEY"] = ""

from api_bai_viet import LOAI_HOP_LE, tao_duong_dan  # noqa: E402
import api_thanh_vien as tv  # noqa: E402
import api_tu_lieu as tl  # noqa: E402
import auth  # noqa: E402
import db  # noqa: E402
import loi_nhap_lieu as lnl  # noqa: E402
from imob_bot import ChatBot, KienThuc  # noqa: E402
from imob_bot import guardrails as gr
from imob_bot.text_utils import bo_dau

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

THU_MUC = Path(__file__).resolve().parent
FILE_THAT = THU_MUC / "data" / "imob_chatbot_data.json"
FILE_MAU = THU_MUC / "data" / "sample_data.json"


def kiem_tra(inp: str, ans: str):
    """Trả về danh sách (tên_kiểm_tra, đạt?) áp dụng cho câu test này."""
    ki = bo_dau(inp.lower())
    ka = bo_dau(ans.lower())
    kq = []

    if gr.la_prompt_injection(inp):
        kq.append(("chong prompt injection (huong ve hotline)",
                   "hotline" in ka or "vai tro" in ka))
    elif gr.la_cau_hoi_gia(inp):
        kq.append(("hoi gia -> khong lo so tien", not gr.chua_so_gia(ans)))

    if "bao hanh" in ki or "hong thi" in ki:
        kq.append(("bao hanh: co '2 nam' va '1 nam'", "2 nam" in ka and "1 nam" in ka))
    if " o dau" in (" " + ki) or "van phong" in ki:
        # Doi 18/08/2026: cong ty xac nhan dia chi la van phong HL68 Building
        # (phuong Ha Long), khong phai To 8 khu 3 Bai Chay nhu ban truoc. Bat
        # theo "hl68" vi day la phan dac trung nhat, khong dinh dau tieng Viet.
        kq.append(("dia chi: co 'hl68'", "hl68" in ka))
    if "bao nhieu tinh nang" in ki:
        kq.append(("tinh nang: co so '7'", "7" in ans))
    if "source code" in ki or "ma nguon" in ki:
        kq.append(("ban giao: co 'source code'/'ma nguon'",
                   "source code" in ka or "ma nguon" in ka))

    kq.append(("co tra loi (khong rong)", bool(ans.strip())))
    return kq


# ============================================================
# BỘ ĐO RIÊNG CHO CHỐT CHẶN GIÁ (thêm 21/08/2026)
#
# Vì sao tách riêng: chua_so_gia() là chốt chặn CUỐI trong bot.tra_loi() — hễ
# nó kêu là cả câu trả lời bị vứt, thay bằng câu báo giá chuẩn. Nên nó sai kiểu
# nào cũng nguy:
#   · bỏ sót  -> bot đọc số tiền ra cho khách, đúng thứ tuyệt đối không được
#   · bắt oan -> bot trả lời lạc đề mà KHÔNG có lỗi nào hiện ra
#
# Vế "bắt oan" đã xảy ra thật và nằm im rất lâu: biểu thức cũ bắt "một con số
# rồi tới chữ k" mà không kiểm sau chữ k là gì, nên "30 km" và "19 kg" bị đọc
# thành "30 nghìn", "19 nghìn". Mọi câu hỏi về robot đều nhận câu báo giá.
# Chỉ lộ ra khi kho kiến thức bắt đầu có thông số kỹ thuật.
#
# Hai danh sách dưới đây khoá cả hai chiều lại.
# ============================================================
PHAI_CHAN = [
    "gia 50 trieu dong",
    "khoang 1,5 ty",
    "chi 200k thoi",
    "2.000.000 vnd",
    "$500",
    "500 $",
    "150 usd",
    "tu 30 nghin",
    "1.500k mot goi",
]

KHONG_DUOC_CHAN = [
    "pin di duoc 30 km mot lan sac",
    "may nang 19 kg",
    "robot nang 90 kg",
    "camera 4K Ultra HD",
    "do phan giai 8K",
    "man hinh 13,3 inch",
    "sac 80% trong khoang 1,5 gio",
    "vuot vat can 150 mm",
    "loi nuoc 130 mm",
    "nhiet do 10-50 do C",
    "uptime 99,9%",
    "ho tro 24/7",
    "kich thuoc 460 x 460 x 1200 mm",
    "toc do duoi 8 km/h",
]


def kiem_chot_chan_gia():
    """Trả về danh sách (tên_kiểm_tra, đạt?)."""
    kq = []
    for c in PHAI_CHAN:
        kq.append(("chan dung so tien: %r" % c, gr.chua_so_gia(c)))
    for c in KHONG_DUOC_CHAN:
        kq.append(("khong bat oan thong so: %r" % c, not gr.chua_so_gia(c)))
    return kq


# ============================================================
# ĐƯỜNG DẪN BÀI VIẾT (thêm 21/09/2026)
#
# tao_duong_dan() biến tiêu đề tiếng Việt thành phần đuôi URL. Sai ở đây thì
# không có lỗi nào hiện ra — chỉ là bài viết nằm ở một địa chỉ xấu hoặc khó gõ,
# và sửa về sau thì mọi link đã chia sẻ chết theo.
#
# Chữ 'đ' là chỗ dễ sai nhất: nó KHÔNG phải 'd' cộng dấu mà là một chữ cái
# riêng trong bảng mã, nên bước bỏ dấu thông thường không đụng tới nó. Quên
# thay tay thì "đào tạo" ra thành "ao-tao" — vẫn chạy, chỉ là sai.
# ============================================================
DUONG_DAN_MONG_DOI = [
    ("Yên Tử Số ra mắt", "yen-tu-so-ra-mat"),
    ("Đào tạo chuyển đổi số", "dao-tao-chuyen-doi-so"),
    ("Zalo Mini App Bảo tàng Quảng Ninh", "zalo-mini-app-bao-tang-quang-ninh"),
    ("Đường ĐI — thử: dấu?!", "duong-di-thu-dau"),
    ("ĐỦ ĐẦY ĐỦ", "du-day-du"),
    ("   ", "bai-viet"),          # tiêu đề rỗng vẫn phải ra một đường dẫn dùng được
    ("Bài 1 & Bài 2", "bai-1-bai-2"),
]


def kiem_duong_dan():
    kq = []
    for tieu_de, mong_doi in DUONG_DAN_MONG_DOI:
        that = tao_duong_dan(tieu_de)
        kq.append((f"duong dan {tieu_de!r} -> {mong_doi!r} (nhan {that!r})",
                   that == mong_doi))

    # Hai chuoi loai phai khop TUNG KY TU voi ban JavaScript
    # (src/services/baiVietService.js). Lech mot chu thi may chu tra 400 va
    # bai khong luu duoc — nen khoa lai o day.
    kq.append((f"co dung 2 loai bai (nhan {sorted(LOAI_HOP_LE)})",
               LOAI_HOP_LE == {"cau_chuyen", "tin_cong_ty"}))

    dai = tao_duong_dan("rat dai " * 40)
    kq.append((f"duong dan khong qua 80 ky tu (nhan {len(dai)})", len(dai) <= 80))
    kq.append(("duong dan khong ket thuc bang dau gach", not dai.endswith("-")))

    # --- O "Duong dan" nguoi dung go vao (24/09/2026) ---
    # Loi 422 khi dang bai: go qua 80 ky tu, hoac dan link, vao o nay. Nay:
    # link bai tren imob.vn -> lay phan duoi; link trang khac -> 400 kem giai
    # thich; chu dai -> tu rut gon.
    import api_bai_viet as bv
    from fastapi import HTTPException

    for vao, ra in (
        ("https://imob.vn/tin-tuc/ngay-nay-nam-truoc", "ngay-nay-nam-truoc"),
        ("www.imob.vn/cau-chuyen/yen-tu-so", "yen-tu-so"),
        ("/tin-tuc/abc-def", "abc-def"),
        ("http://localhost:5173/tin-tuc/bai-thu", "bai-thu"),
        ("Ngày này năm trước", "ngay-nay-nam-truoc"),
    ):
        that = bv.duong_dan_tu_o_nhap(vao)
        kq.append((f"o duong dan {vao!r} -> {ra!r} (nhan {that!r})", that == ra))

    chu_dai = "Ngày này năm trước iMob cùng Quảng Ninh tham gia Triển lãm " * 3
    that = bv.duong_dan_tu_o_nhap(chu_dai)
    kq.append((f"o duong dan: chu dai {len(chu_dai)} ky tu duoc rut con <= 80 (nhan {len(that)})",
               len(chu_dai) > 80 and len(that) <= 80))

    for vao in ("https://www.facebook.com/imob.vn/posts/123",
                "https://imob.vn.gia-mao.com/tin-tuc/abc",   # duoi gia mao
                "https://imob.vn/"):                         # khong co phan duoi
        try:
            bv.duong_dan_tu_o_nhap(vao)
            bi_chan = False
        except HTTPException as e:
            bi_chan = e.status_code == 400
        kq.append((f"o duong dan {vao!r} phai bi tu choi 400", bi_chan))

    # Gioi han cho chu GO VAO phai du cho thu nguoi ta that su dan: link anh
    # Facebook 200-400 ky tu. Truoc day la 100 va 80.
    kq.append(("gioi han anh bia >= 1000", bv.DAI_NHAT_ANH_BIA >= 1000))
    kq.append(("gioi han o duong dan > 80", bv.DAI_NHAT_DUONG_DAN_NHAP > 80))
    return kq


# ============================================================
# Tai khoan thanh vien (21/09/2026)
# ============================================================
# Vi sao cac phep kiem nay dang gia: dang ky la duong dan CONG KHAI, ai goi
# cung duoc, va no ghi thang mot dong moi vao bang tai khoan. Mot lo hong o
# day khong bao loi — no chi lang le de lot mot cai ten, roi hau qua hien ra
# o cho khac va muon hon nhieu.
TEN_DUOC = ["nam.tran", "hoa_2026", "abc", "a" * 24, "user-1"]
TEN_BI_CHAN = [
    ("ab", "qua ngan"),
    ("a" * 25, "qua dai"),
    ("Nam", "con chu hoa"),
    ("nam tran", "co khoang trang"),
    ("nguyen.van", None),          # hop le — de lam doi chung, xu ly ben duoi
    ("admin", "ten cua cong ty"),
    ("hotro", "ten cua cong ty"),
    ("-abc", "bat dau bang dau gach"),
    (".abc", "bat dau bang dau cham"),
]


def kiem_tai_khoan():
    kq = []

    # --- Ten dang nhap ---
    for ten in TEN_DUOC:
        kq.append((f"ten {ten!r} phai duoc nhan", tv.kiem_ten(ten) is None))
    for ten, vi_sao in TEN_BI_CHAN:
        if vi_sao is None:
            kq.append((f"ten {ten!r} phai duoc nhan", tv.kiem_ten(ten) is None))
        else:
            kq.append((f"ten {ten!r} phai bi chan ({vi_sao})",
                       tv.kiem_ten(ten) is not None))

    kq.append(("chuan_hoa_ten cat khoang trang va ha chu thuong",
               tv.chuan_hoa_ten("  NAM.Tran  ") == "nam.tran"))

    # --- Mat khau ---
    kq.append(("mat khau 7 ky tu bi chan",
               tv.kiem_mat_khau_moi("1234567", "nam") is not None))
    kq.append(("mat khau 8 ky tu binh thuong duoc nhan",
               tv.kiem_mat_khau_moi("caychuoi92", "nam") is None))
    kq.append(("mat khau qua de bi chan",
               tv.kiem_mat_khau_moi("12345678", "nam") is not None))
    kq.append(("mat khau trung ten dang nhap bi chan",
               tv.kiem_mat_khau_moi("nam.tran", "nam.tran") is not None))
    # bcrypt cat cut o 72 byte ma khong keu. Phai chan truoc, khong thi nguoi
    # dat mat khau dai se mat phan duoi ma khong biet.
    kq.append(("mat khau qua 72 byte bi chan",
               tv.kiem_mat_khau_moi("Mật khẩu rất dài " * 8, "nam") is not None))

    # --- Ten hien thi ---
    kq.append(("ho ten gom khoang trang thua",
               tv.don_ho_ten("  Trần   Văn  Nam  ") == "Trần Văn Nam"))
    # Xuong dong phai thanh KHOANG TRANG, khong phai bi xoa thang — xoa thang
    # thi hai chu bi dinh lien vao nhau.
    kq.append(("ho ten: xuong dong -> khoang trang",
               tv.don_ho_ten("Tran" + chr(10) + "Nam") == "Tran Nam"))
    kq.append(("ho ten: tab -> khoang trang",
               tv.don_ho_ten("Tran" + chr(9) + "Nam") == "Tran Nam"))
    kq.append((f"ho ten cat con {tv.DAI_HO_TEN_TOI_DA} ky tu",
               len(tv.don_ho_ten("x" * 200)) == tv.DAI_HO_TEN_TOI_DA))

    # --- Vai tro ---
    # Chuoi nay phai khop TUNG KY TU voi ban JavaScript
    # (src/services/taiKhoanService.js). Lech mot chu thi giao dien tuong moi
    # nguoi deu la quan tri — hoac nguoc lai.
    kq.append((f"vai thanh vien dung chuoi 'thanh_vien' (nhan {auth.VAI_THANH_VIEN!r})",
               auth.VAI_THANH_VIEN == "thanh_vien"))
    kq.append(("hai vai khac nhau", auth.VAI_QUAN_TRI != auth.VAI_THANH_VIEN))

    # tao_ve BAT BUOC ghi ro vai. Bo mac dinh di la de mot cho quen vai se vo
    # ngay luc chay, thay vi lang le phat ve quan tri cho khach.
    try:
        auth.tao_ve("ai-do")
        thieu_vai_bi_chan = False
    except TypeError:
        thieu_vai_bi_chan = True
    kq.append(("tao_ve khong cho bo trong vai tro", thieu_vai_bi_chan))

    # Than request dang ky KHONG duoc co o nao ten vai_tro. Co la khach tu
    # chon duoc vai cho minh.
    kq.append(("yeu cau dang ky khong nhan vai_tro",
               "vai_tro" not in tv.YeuCauDangKy.model_fields))

    return kq


# ============================================================
# Tu lieu thanh vien gui (22/09/2026)
# ============================================================
def kiem_tu_lieu():
    kq = []
    XD = chr(10)   # xuong dong
    TAB = chr(9)

    # don_chu GIU xuong dong (cau tra loi dai can chia doan) nhung bo moi ky
    # tu dieu khien khac. Bo het xuong dong thi ca bai thanh mot cuc chu.
    kq.append(("don_chu giu xuong dong",
               tl.don_chu("Doan mot." + XD + XD + "Doan hai.", 999)
               == "Doan mot." + XD + XD + "Doan hai."))
    kq.append(("don_chu doi tab thanh khoang trang",
               tl.don_chu("Tran" + TAB + "Nam", 999) == "Tran Nam"))
    kq.append(("don_chu gom khoang trang thua",
               tl.don_chu("  Tran   Van   Nam  ", 999) == "Tran Van Nam"))
    kq.append(("don_chu gom 3 dong trong thanh 1",
               tl.don_chu("A" + XD * 5 + "B", 999) == "A" + XD + XD + "B"))
    kq.append(("don_chu cat dung do dai", len(tl.don_chu("x" * 500, 300)) == 300))
    kq.append(("don_chu chiu duoc chuoi rong", tl.don_chu("", 300) == ""))

    # Ba chuoi trang thai phai khop TUNG KY TU voi ban JavaScript
    # (src/services/taiKhoanService.js va components/admin/MucTuLieu.jsx).
    # Lech mot chu thi giao dien xep bai vao nhom khong ai nhin thay.
    kq.append((f"du 3 trang thai (nhan {sorted(tl.TRANG_THAI_HOP_LE)})",
               tl.TRANG_THAI_HOP_LE == {"cho_duyet", "da_duyet", "tu_choi"}))
    kq.append(("trang thai mac dinh la cho_duyet", db.TRANG_THAI_CHO == "cho_duyet"))

    # Gioi han do dai phai khop voi ban JavaScript. Lech thi nguoi dung go du
    # so ky tu giao dien cho phep roi bi may chu cat bot ma khong bao gi.
    kq.append(("gioi han cau hoi 300", tl.DAI_CAU_HOI_TOI_DA == 300))
    kq.append(("gioi han cau tra loi 4000", tl.DAI_CAU_TRA_LOI_TOI_DA == 4000))
    kq.append(("gioi han ghi chu 1000", tl.DAI_GHI_CHU_TOI_DA == 1000))

    # Than request gui tu lieu KHONG duoc co o nao ten trang_thai hay
    # nguoi_duyet — co la thanh vien tu duyet cho minh duoc.
    o = set(tl.YeuCauGui.model_fields)
    kq.append((f"yeu cau gui chi nhan 3 o (nhan {sorted(o)})",
               o == {"cau_hoi", "cau_tra_loi", "ghi_chu"}))
    return kq


def kiem_loi_nhap_lieu():
    """Cau loi 422 phai NEU DUNG O va DUNG SO, bang tieng Viet.

    Co that ngay 23/09/2026: nguoi soan bai bam Luu tam lan, nam lan nhan dung
    mot cau "May chu bao loi 422." Cac phep kiem duoi day giu cho cau do khong
    quay lai.
    """
    kq = []

    dai = [{"type": "string_too_long", "loc": ("body", "tom_tat"),
            "ctx": {"max_length": 500}, "input": "a" * 812}]
    cau = lnl.cau_tieng_viet(dai)
    kq.append(("cau loi neu ten o bang tieng Viet", "Tóm tắt" in cau))
    kq.append(("cau loi neu do dai dang co", "812" in cau))
    kq.append(("cau loi neu gioi han", "500" in cau))
    kq.append(("cau loi neu so ky tu phai bot", "312" in cau))
    kq.append(("cau loi khong lot chu tieng Anh cua pydantic",
               "String should have" not in cau and "string_too_long" not in cau))

    thieu = [{"type": "missing", "loc": ("body", "tieu_de"), "input": {}}]
    cau_thieu = lnl.cau_tieng_viet(thieu)
    kq.append(("o thieu -> bao 'chua co gi'",
               "Tiêu đề" in cau_thieu and "chưa có gì" in cau_thieu))

    # Ten o chua co trong bang van phai chi dung cho, khong duoc nuot mat.
    la = [{"type": "string_too_long", "loc": ("body", "truong_la"),
           "ctx": {"max_length": 5}, "input": "x" * 9}]
    kq.append(("ten o la van hien ra (khong nuot mat)",
               "truong_la" in lnl.cau_tieng_viet(la)))

    # Chi so mang phai bi bo qua, lay ten o that.
    long_loc = [{"type": "missing", "loc": ("body", "muc", 2, "cau_hoi"), "input": {}}]
    kq.append(("bo qua chi so mang, lay ten o cuoi",
               "Câu hỏi" in lnl.cau_tieng_viet(long_loc)))

    # Nhieu loi: neu toi da ba o roi dem phan con lai.
    nhieu = [{"type": "string_too_long", "loc": ("body", k),
              "ctx": {"max_length": 10}, "input": "c" * 30}
             for k in ("tieu_de", "tom_tat", "noi_dung", "ten_khach", "duong_dan")]
    cau_nhieu = lnl.cau_tieng_viet(nhieu)
    kq.append(("nhieu loi: chi neu 3 o dau", cau_nhieu.count("đang dài") == 3))
    kq.append(("nhieu loi: dem so o con lai", "Còn 2 ô nữa" in cau_nhieu))

    kq.append(("danh sach rong van co cau tra ve", bool(lnl.cau_tieng_viet([]))))

    # GIOI HAN ben Python va ben JS PHAI BANG NHAU. Lech thi hoac form chan oan,
    # hoac form bao con cho ma may chu tra 422 — kieu loi khong ai ngo toi vi
    # nhin rieng tung ben deu thay dung.
    import re
    import api_bai_viet as bv
    from pathlib import Path
    # Duong dan tinh tu CHINH FILE NAY, khong tinh tu thu muc dang dung: chay
    # bo kiem thu tu thu muc goc du an la mot viec rat binh thuong.
    js = (Path(__file__).resolve().parent.parent / "src" / "services" / "baiVietService.js").read_text(encoding="utf-8")
    khoi = js.split("export const GIOI_HAN = {")[1].split("};")[0]
    mau = r"(\w+):\s*(\d+)"
    tu_js = {m.group(1): int(m.group(2)) for m in re.finditer(mau, khoi)}
    for o, so_py in (("tieu_de", bv.DAI_NHAT_TIEU_DE),
                     ("tom_tat", bv.DAI_NHAT_TOM_TAT),
                     ("noi_dung", bv.DAI_NHAT_NOI_DUNG),
                     ("duong_dan", bv.DAI_NHAT_DUONG_DAN_NHAP),
                     ("anh_bia", bv.DAI_NHAT_ANH_BIA)):
        kq.append((f"gioi han {o} khop giua Python va JS", tu_js.get(o) == so_py))

    return kq


def main():
    kt = KienThuc.tu_file(FILE_THAT if FILE_THAT.exists() else FILE_MAU)
    tests = kt.data.get("test_cases", [])
    if not tests:
        print("Không có test_cases trong dữ liệu.")
        return

    tong = dat = 0
    for t in tests:
        inp = t.get("input", "")
        bot = ChatBot(kt)                    # bot mới mỗi test -> không dính trạng thái cũ
        ans = bot.tra_loi(inp)

        print(f"\n[{t.get('id', '?')}] {inp}")
        print(f"   -> {ans[:150]}{'...' if len(ans) > 150 else ''}")
        if t.get("expect"):
            print(f"   (mong đợi: {t['expect']})")
        for ten, ok in kiem_tra(inp, ans):
            tong += 1
            dat += 1 if ok else 0
            print(f"      {'PASS' if ok else 'FAIL'} — {ten}")

    print("\n[chot-chan-gia] Do rieng bieu thuc nhan dien so tien")
    for ten, ok in kiem_chot_chan_gia():
        tong += 1
        dat += 1 if ok else 0
        if not ok:
            print(f"      FAIL — {ten}")
    print(f"      {len(PHAI_CHAN)} cau phai chan · "
          f"{len(KHONG_DUOC_CHAN)} cau khong duoc bat oan")

    print()
    print("[bai-viet] Duong dan sinh tu tieu de tieng Viet")
    so_loi = 0
    for ten, ok in kiem_duong_dan():
        tong += 1
        dat += 1 if ok else 0
        if not ok:
            so_loi += 1
            print(f"      FAIL — {ten}")
    print(f"      {len(DUONG_DAN_MONG_DOI)} tieu de + 2 rang buoc do dai"
          f"{'' if so_loi == 0 else f' — {so_loi} loi'}")

    print()
    print("[tai-khoan] Luat dat ten, mat khau va vai tro")
    phep = kiem_tai_khoan()
    so_loi = 0
    for ten, ok in phep:
        tong += 1
        dat += 1 if ok else 0
        if not ok:
            so_loi += 1
            print(f"      FAIL - {ten}")
    print(f"      {len(phep)} phep kiem"
          f"{'' if so_loi == 0 else f' - {so_loi} loi'}")

    print()
    print("[tu-lieu] Don chu, trang thai va gioi han do dai")
    phep = kiem_tu_lieu()
    so_loi = 0
    for ten, ok in phep:
        tong += 1
        dat += 1 if ok else 0
        if not ok:
            so_loi += 1
            print(f"      FAIL - {ten}")
    print(f"      {len(phep)} phep kiem"
          f"{'' if so_loi == 0 else f' - {so_loi} loi'}")

    print()
    print("[loi-422] Cau loi nhap lieu bang tieng Viet")
    phep = kiem_loi_nhap_lieu()
    so_loi = 0
    for ten, ok in phep:
        tong += 1
        dat += 1 if ok else 0
        if not ok:
            so_loi += 1
            print(f"      FAIL - {ten}")
    print(f"      {len(phep)} phep kiem"
          f"{'' if so_loi == 0 else f' - {so_loi} loi'}")

    print("\n" + "=" * 55)
    print(f"KẾT QUẢ: {dat}/{tong} kiểm tra ĐẠT.")
    sys.exit(0 if dat == tong else 1)


if __name__ == "__main__":
    main()
