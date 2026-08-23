# -*- coding: utf-8 -*-
# Cat ba anh THAT cho hinh minh hoa dau trang.
# Kich thuoc xuat = 2x co hien thi, de net tren man hinh 2 diem anh ma van nhe.
import pathlib
from PIL import Image

GOC = pathlib.Path(r"c:\Users\NAMKUBO\Documents\web\public\anh")
RA = GOC / "hero"
RA.mkdir(exist_ok=True)


def ghi(im, ten, chatluong=86):
    d = RA / ten
    im.convert("RGB").save(d, "WEBP", quality=chatluong, method=6)
    print(f"{ten:22s} {im.size[0]}x{im.size[1]}  {d.stat().st_size/1024:.1f} KB")


# ---- 1. Man hinh lon: trang Yen Tu (dung trang trong anh cong ty gui) ----
# Nguon 1330x831 = 1.60, dung ti le man hinh can. Chi thu nho.
web = Image.open(GOC / "website-phuong-yen-tu.webp")
ghi(web.resize((520, 325), Image.LANCZOS), "hero-web.webp")

# ---- 2. Laptop: ban do so Dong Trieu ----
bando = Image.open(GOC / "ban-do-so-dong-trieu.webp")
ghi(bando.resize((400, 250), Image.LANCZOS), "hero-bando.webp")

# ---- 3. Dien thoai: cat rieng phan MAN HINH trong khung may cua anh ghep.
# Khung may (vien toi) do duoc: x 329..869, y 30..737 -> ruot lui vao ~11px.
app = Image.open(GOC / "yen-tu-so.webp").crop((341, 42, 858, 728))
print("man hinh app cat duoc:", app.size, "ti le %.3f" % (app.width / app.height))
ghi(app.resize((round(app.width * 0.42), round(app.height * 0.42)), Image.LANCZOS), "hero-app.webp")
