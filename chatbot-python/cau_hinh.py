"""Nạp file .env vào biến môi trường.

VÌ SAO CÓ FILE RIÊNG: db.py và auth.py đọc biến môi trường ngay lúc được nạp
(DATABASE_URL, JWT_SECRET ở cấp module). Nếu gọi load_dotenv() muộn hơn thì
lúc chúng đọc, biến vẫn còn rỗng. Nên mọi file cần cấu hình đều `import cau_hinh`
ĐẦU TIÊN — Python chỉ chạy nội dung module một lần nên gọi bao nhiêu lần cũng
chỉ nạp một lần.

Trên Render KHÔNG có file .env — biến môi trường đặt thẳng trong dashboard
(khai báo ở render.yaml). load_dotenv() không thấy file thì lặng lẽ bỏ qua,
nên cùng một đoạn code chạy được ở cả hai nơi.
"""

from pathlib import Path

from dotenv import load_dotenv

# override=False: biến đã có sẵn trong môi trường thật thì được ưu tiên hơn
# file .env. Quan trọng trên Render — không để file lỡ lọt vào repo ghi đè
# cấu hình thật.
load_dotenv(Path(__file__).resolve().parent / ".env", override=False)
