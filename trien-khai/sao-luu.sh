#!/usr/bin/env bash
# ============================================================
# SAO LƯU cơ sở dữ liệu và file cấu hình.
#
#     sudo bash /var/www/imob/sao-luu.sh
#
# Cron tự chạy 3h sáng hằng ngày. Giữ 14 bản gần nhất.
#
# ------------------------------------------------------------
# SAO LƯU HAI THỨ, KHÔNG PHẢI MỘT
#
#   1. Cơ sở dữ liệu  — nội dung web, liên hệ khách, ảnh tải lên
#   2. shared/.env    — mật khẩu CSDL, khoá ký phiên đăng nhập
#
# File .env KHÔNG nằm trong kho mã (cố ý). Mất máy chủ mà chỉ có bản sao lưu
# cơ sở dữ liệu thì dựng lại được dữ liệu nhưng KHÔNG mở được nó, vì mật khẩu
# đã biến mất cùng cái máy. Đó là lý do phải sao lưu cả hai.
#
# ------------------------------------------------------------
# ⚠️ BẢN SAO NẰM CÙNG Ổ ĐĨA VỚI BẢN GỐC
#
# Nó cứu được: xoá nhầm bảng, hỏng dữ liệu, sửa sai muốn quay lui.
# Nó KHÔNG cứu được: mất nguyên máy chủ, hỏng ổ đĩa, xoá nhầm máy trên Portal.
#
# Muốn an toàn thật thì phải kéo bản sao về máy khác. Lệnh chạy ở máy cá nhân:
#     scp chung:/var/sao-luu/imob/*.sql.gz D:\sao-luu-imob\
#
# ------------------------------------------------------------
# CÁCH PHỤC HỒI
#
#     gunzip -c /var/sao-luu/imob/imob_cms-2026-09-19_0300.sql.gz \
#       | sudo -u postgres psql -d imob_cms
#
# Phục hồi đè lên cơ sở dữ liệu đang chạy. Nên dừng API trước:
#     sudo systemctl stop imob-api   (phục hồi xong thì start lại)
# ============================================================
set -uo pipefail

KHO="/var/sao-luu/imob"
TEN_DB="imob_cms"
FILE_ENV="/var/www/imob/shared/.env"
GIU_NGAY=14

mkdir -p "$KHO"
chmod 700 "$KHO"          # chứa mật khẩu -> chỉ root đọc được

NGAY="$(date +%Y-%m-%d_%H%M)"
FILE_DB="$KHO/${TEN_DB}-${NGAY}.sql.gz"

echo "==> 1/4  Đổ cơ sở dữ liệu"
if ! sudo -u postgres pg_dump "$TEN_DB" | gzip -9 > "$FILE_DB"; then
  echo "!! pg_dump hỏng — xoá file dở dang" >&2
  rm -f "$FILE_DB"
  exit 1
fi
chmod 600 "$FILE_DB"

echo "==> 2/4  Kiểm tra bản vừa tạo"
# Một bản sao lưu chưa từng được kiểm tra thì chưa phải bản sao lưu. Hai phép
# thử: file nén còn nguyên vẹn, và bên trong thật sự có bảng chứ không rỗng.
if ! gzip -t "$FILE_DB" 2>/dev/null; then
  echo "!! File nén hỏng — xoá đi, coi như lần này thất bại" >&2
  rm -f "$FILE_DB"
  exit 1
fi
SO_BANG=$(gunzip -c "$FILE_DB" | grep -c '^CREATE TABLE' || true)
if [[ "$SO_BANG" -lt 1 ]]; then
  echo "!! Bản sao không có bảng nào — nhiều khả năng sai tên CSDL" >&2
  rm -f "$FILE_DB"
  exit 1
fi
echo "    $SO_BANG bảng, $(du -h "$FILE_DB" | cut -f1)"

echo "==> 3/4  Sao lưu file cấu hình"
if [[ -f "$FILE_ENV" ]]; then
  cp "$FILE_ENV" "$KHO/env-${NGAY}"
  chmod 600 "$KHO/env-${NGAY}"
  echo "    đã lưu .env"
else
  echo "    ⚠️  không thấy $FILE_ENV" >&2
fi

echo "==> 4/4  Dọn bản cũ (giữ $GIU_NGAY ngày)"
SO_XOA=$(find "$KHO" -maxdepth 1 -type f -mtime +$GIU_NGAY -print -delete | wc -l)
echo "    xoá $SO_XOA file cũ, còn $(find "$KHO" -maxdepth 1 -name '*.sql.gz' | wc -l) bản sao lưu"

echo ""
echo "XONG. Tổng dung lượng kho sao lưu: $(du -sh "$KHO" | cut -f1)"
