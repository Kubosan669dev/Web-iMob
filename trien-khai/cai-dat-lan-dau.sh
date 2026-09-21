#!/usr/bin/env bash
# ============================================================
# CÀI ĐẶT LẦN ĐẦU trên máy chủ CMC Cloud (Elastic Compute, Ubuntu 22.04/24.04).
#
# Chạy MỘT LẦN. Cách chạy:
#     scp trien-khai/cai-dat-lan-dau.sh ubuntu@<IP>:~/
#     ssh ubuntu@<IP>
#     nano cai-dat-lan-dau.sh          # sửa 2 biến ở đầu file
#     chmod +x cai-dat-lan-dau.sh
#     sudo ./cai-dat-lan-dau.sh
#
# Script này KHÔNG chứa mật khẩu nào. Mật khẩu cơ sở dữ liệu và khoá ký phiên
# đăng nhập được sinh ngẫu nhiên ngay trên máy chủ rồi ghi vào
# /var/www/imob/shared/.env (quyền 600) — không đi qua máy ai, không nằm trong
# kho mã, không hiện ra màn hình.
#
# ⚠️ ĐIỀU KIỆN BẮT BUỘC TRƯỚC KHI CHẠY — hai tường lửa, không phải một:
#   1. Security Group trên Portal CMC đã mở 22, 80, 443  (lớp ngoài, ở cloud)
#   2. ufw trong máy — script này tự lo                   (lớp trong, ở OS)
# Thiếu lớp 1 thì mọi thứ trong máy đúng hết mà ngoài vẫn không vào được, và
# không có thông báo lỗi nào chỉ ra điều đó. Xem sổ tay CMC Mục 2.5.
# ============================================================
set -euo pipefail

# ---- Sửa 2 dòng này trước khi chạy ----
KHO_MA="https://github.com/Kubosan669dev/Web-iMob.git"
TEN_MIEN="TEN_MIEN.VN"      # chưa có tên miền thì điền Elastic IP của máy

# ---- Không cần sửa ----
# HAI tài khoản khác nhau, cố ý:
#   NGUOI_CHAY       chạy dịch vụ API. Không đăng nhập được, CHỈ ĐỌC mã nguồn.
#                    Ai chiếm được tiến trình API cũng không sửa nổi mã.
#   NGUOI_TRIEN_KHAI người thật, đẩy mã lên. Sở hữu thư mục mã nguồn, nhưng
#                    không đọc được .env và không có quyền root.
NGUOI_CHAY="imob"
# Máy chủ CMC chỉ có tài khoản root, không có 'ubuntu' như ảnh của nhà khác.
# Đăng nhập thẳng bằng root thì SUDO_USER rỗng và logname thường cũng rỗng nốt
# -> phải lùi về 'root', KHÔNG lùi về 'ubuntu' (tài khoản đó không tồn tại,
# lệnh chown ở cuối script sẽ hỏng và dừng giữa chừng).
NGUOI_TRIEN_KHAI="${SUDO_USER:-$(logname 2>/dev/null || echo root)}"
id -u "$NGUOI_TRIEN_KHAI" >/dev/null 2>&1 || NGUOI_TRIEN_KHAI="root"
GOC="/var/www/imob"
TEN_DB="imob_cms"
NGUOI_DB="imob"

if [[ $EUID -ne 0 ]]; then
  echo "Phải chạy bằng sudo." >&2
  exit 1
fi

echo "==> 1/9  Cập nhật hệ thống và cài gói cần dùng"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq \
  nginx git curl ufw fail2ban unzip ca-certificates \
  python3 python3-venv python3-pip \
  postgresql postgresql-contrib \
  certbot python3-certbot-nginx

echo "==> 2/9  Node.js 22"
# Ubuntu có sẵn Node nhưng bản quá cũ, Vite 8 không chạy được.
if ! command -v node >/dev/null 2>&1 || [[ $(node -v | cut -c2- | cut -d. -f1) -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null 2>&1
  apt-get install -y -qq nodejs
fi
echo "    $(node -v)"

echo "==> 3/9  Vùng nhớ tạm (swap)"
# Vite build ngốn RAM theo đợt. Máy 2 GB không có swap thì tiến trình build bị
# nhân hệ điều hành giết giữa chừng (OOM), báo lỗi rất khó hiểu. 2 GB swap là
# phao cứu sinh, không phải để chạy thường xuyên.
if ! swapon --show | grep -q .; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo "/swapfile none swap sw 0 0" >> /etc/fstab
  echo "    đã bật 2 GB"
else
  echo "    đã có sẵn, bỏ qua"
fi

echo "==> 4/9  Múi giờ Việt Nam"
timedatectl set-timezone Asia/Ho_Chi_Minh

echo "==> 5/9  Tài khoản chạy dịch vụ '${NGUOI_CHAY}'"
# --system + nologin: đây là tài khoản để CHẠY phần mềm, không phải để người
# đăng nhập. Ai chiếm được tiến trình API cũng không mở được shell.
id -u "$NGUOI_CHAY" >/dev/null 2>&1 \
  || adduser --system --group --shell /usr/sbin/nologin --no-create-home "$NGUOI_CHAY"

echo "==> 6/9  Tường lửa trong máy + chặn dò mật khẩu"
ufw --force default deny incoming
ufw --force default allow outgoing
ufw allow 22/tcp   comment 'SSH'
ufw allow 80/tcp   comment 'HTTP'
ufw allow 443/tcp  comment 'HTTPS'
ufw --force enable

cat > /etc/fail2ban/jail.local <<'F2B'
[sshd]
enabled  = true
port     = 22
maxretry = 3
findtime = 600
bantime  = 3600
F2B
systemctl enable --now fail2ban >/dev/null 2>&1

echo "==> 7/9  Cơ sở dữ liệu PostgreSQL"
MAT_KHAU_DB="$(openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | head -c 28)"
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${NGUOI_DB}'" | grep -q 1; then
  sudo -u postgres psql -qc "ALTER USER ${NGUOI_DB} WITH PASSWORD '${MAT_KHAU_DB}';"
  echo "    tài khoản DB đã có — đã đặt lại mật khẩu"
else
  sudo -u postgres psql -qc "CREATE USER ${NGUOI_DB} WITH PASSWORD '${MAT_KHAU_DB}';"
fi
sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${TEN_DB}'" | grep -q 1 \
  || sudo -u postgres createdb -O "${NGUOI_DB}" "${TEN_DB}"

echo "==> 8/9  Dựng cây thư mục và lấy file cấu hình"
# Bố cục kiểu release (sổ tay CMC Mục 5.6):
#   current/   -> symlink trỏ bản đang chạy
#   releases/  -> mỗi lần deploy một thư mục mới
#   shared/    -> .env, sống sót qua mọi lần deploy
#   moitruong/ -> môi trường Python, dùng chung, không nằm trong release
mkdir -p "$GOC"/{releases,shared}

TAM="$(mktemp -d)"
git clone --depth 1 "$KHO_MA" "$TAM/ma" --quiet
cp "$TAM/ma/trien-khai/trien-khai.sh" "$GOC/trien-khai.sh"
chmod +x "$GOC/trien-khai.sh"

FILE_ENV="$GOC/shared/.env"
if [[ -f "$FILE_ENV" ]]; then
  echo "    .env đã có — KHÔNG ghi đè, giữ nguyên cấu hình cũ"
else
  cat > "$FILE_ENV" <<ENV
# Sinh tự động bởi cai-dat-lan-dau.sh — $(date '+%d/%m/%Y %H:%M')
# File này KHÔNG nằm trong kho mã. Mất là phải tạo lại.

DATABASE_URL=postgresql://${NGUOI_DB}:${MAT_KHAU_DB}@localhost:5432/${TEN_DB}

# Khoá ký phiên đăng nhập. Đổi giá trị này = mọi người đang đăng nhập bị đá ra.
JWT_SECRET=$(openssl rand -hex 32)

# Website và API đi CHUNG một tên miền qua nginx nên không còn CORS.
# Vẫn khai báo để phòng khi sau này tách máy chủ, và cho Zalo Mini App.
ALLOWED_ORIGINS=https://${TEN_MIEN}

# ⚠️ PHẢI ĐIỀN TAY — tài khoản quản trị /admin, mật khẩu tối thiểu 8 ký tự.
ADMIN_USER=
ADMIN_PASSWORD=

# Tuỳ chọn: khoá Google Gemini cho tầng trả lời dự phòng của chatbot.
# Bỏ trống thì chatbot vẫn chạy bằng kho tri thức trong máy.
GEMINI_API_KEY=

ENV
fi

# Môi trường Python riêng, không đụng Python của hệ điều hành.
python3 -m venv "$GOC/moitruong"
"$GOC/moitruong/bin/pip" install -q --upgrade pip
"$GOC/moitruong/bin/pip" install -q -r "$TAM/ma/chatbot-python/requirements.txt"

echo "==> 9/9  Dịch vụ nền, nginx và phân quyền"
cp "$TAM/ma/trien-khai/imob-api.service" /etc/systemd/system/

# KHÔNG ghi đè cấu hình nginx đã có. certbot sửa thẳng vào file này khi bật
# HTTPS (thêm khối cổng 443, thêm chuyển hướng, trỏ tới chứng chỉ). Chạy lại
# script cài đặt mà ghi đè thì HTTPS biến mất, web tụt về http — mà không có
# lỗi nào hiện ra, chỉ là trình duyệt báo "không bảo mật".
if [[ -f /etc/nginx/sites-available/imob ]]; then
  cp /etc/nginx/sites-available/imob "/etc/nginx/sites-available/imob.sao-luu-$(date +%Y%m%d-%H%M%S)"
  echo "    cấu hình nginx đã có — GIỮ NGUYÊN (đã sao lưu một bản)"
  echo "    muốn lấy bản mới: xoá /etc/nginx/sites-available/imob rồi chạy lại"
else
  sed "s/TEN_MIEN\.VN/${TEN_MIEN}/g" "$TAM/ma/trien-khai/nginx-imob.conf" \
    > /etc/nginx/sites-available/imob
fi
ln -sfn /etc/nginx/sites-available/imob /etc/nginx/sites-enabled/imob
rm -f /etc/nginx/sites-enabled/default

# Quyền hẹp cho người triển khai. visudo -c kiểm tra cú pháp TRƯỚC khi đặt file
# vào chỗ — sai cú pháp file sudoers là hỏng lệnh sudo của CẢ MÁY.
# root thì bỏ qua: cấp thêm quyền cho root là vô nghĩa, mà một file sudoers
# thừa lại là thứ người sau đọc mãi không hiểu để làm gì.
if [[ "$NGUOI_TRIEN_KHAI" != "root" ]]; then
  TAM_SUDO="$(mktemp)"
  sed "s/NGUOI_TRIEN_KHAI/${NGUOI_TRIEN_KHAI}/g" \
    "$TAM/ma/trien-khai/sudoers-imob" > "$TAM_SUDO"
  if visudo -c -q -f "$TAM_SUDO"; then
    install -m 0440 -o root -g root "$TAM_SUDO" /etc/sudoers.d/imob-deploy
    echo "    đã cấp quyền triển khai cho '${NGUOI_TRIEN_KHAI}'"
  else
    echo "    ⚠️  file sudoers sai cú pháp — BỎ QUA để không hỏng sudo" >&2
  fi
  rm -f "$TAM_SUDO"
else
  echo "    chạy bằng root — không cần cấp thêm quyền sudo"
fi
rm -rf "$TAM"

# Mã nguồn: người triển khai SỞ HỮU (để git/npm ghi được),
#           tài khoản chạy dịch vụ chỉ ĐỌC qua nhóm.
chown -R "${NGUOI_TRIEN_KHAI}:${NGUOI_CHAY}" "$GOC"
chmod -R g+rX "$GOC"
# Trừ .env — chỉ tài khoản chạy dịch vụ đọc được, người triển khai thì không.
chown "${NGUOI_CHAY}:${NGUOI_CHAY}" "$FILE_ENV"
chmod 600 "$FILE_ENV"

systemctl daemon-reload
# enable: để API tự bật lại sau khi máy chủ khởi động lại. Thiếu dòng này thì
# mọi thứ chạy tốt cho tới lần reboot đầu tiên — rồi web sống, API chết.
systemctl enable imob-api >/dev/null 2>&1

# nginx -t CHỈ kiểm tra cú pháp, KHÔNG nạp cấu hình mới. Thiếu reload thì nginx
# vẫn phục vụ trang "Welcome to nginx!" mặc định trong khi mọi file đều đúng —
# mất khá lâu mới nghĩ ra vì không có lỗi nào hiện lên cả.
nginx -t && systemctl reload nginx

cat <<XONG

============================================================
Đã cài xong phần tự động. CÒN 3 VIỆC PHẢI LÀM TAY:

  1. Điền tài khoản quản trị vào .env
         sudo nano ${GOC}/shared/.env
     (ADMIN_USER và ADMIN_PASSWORD, mật khẩu từ 8 ký tự)

  2. Triển khai lần đầu — KHÔNG dùng sudo
         bash ${GOC}/trien-khai.sh

  3. Bật HTTPS (chỉ làm được khi tên miền đã trỏ về Elastic IP)
         sudo certbot --nginx -d ${TEN_MIEN} -d www.${TEN_MIEN}

Không cần Deploy Key vì kho mã Web-iMob đang ĐỂ CÔNG KHAI, máy chủ tải về
bằng HTTPS được. Nếu sau này chuyển kho mã sang riêng tư thì phải tạo Deploy
Key và đổi KHO_MA trong ${GOC}/trien-khai.sh sang dạng git@github.com:...

Kiểm tra:
     curl -s localhost/health     # phải ra JSON, không phải HTML
     systemctl status imob-api
============================================================
XONG
