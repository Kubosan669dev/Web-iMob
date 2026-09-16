#!/usr/bin/env bash
# ============================================================
# TRIỂN KHAI — chạy MỖI LẦN muốn đưa bản mới lên máy chủ CMC.
#
# Từ máy của anh, sau khi đã git push:
#     ssh imob-cmc "bash /var/www/imob/trien-khai.sh"
#
# Chạy bằng TÀI KHOẢN NGƯỜI THẬT, không phải root, không phải 'imob'.
#   - 'imob' là tài khoản chạy dịch vụ: cố ý không đăng nhập được và chỉ ĐỌC
#     mã nguồn, nên nó không tự sửa được mã của chính nó.
#   - Tài khoản của anh sở hữu thư mục mã nguồn, và được cấp đúng 4 quyền hẹp
#     trong /etc/sudoers.d/imob-deploy (xem trien-khai/sudoers-imob).
#
# ------------------------------------------------------------
# VÌ SAO DÙNG THƯ MỤC RELEASE + SYMLINK CHỨ KHÔNG SỬA TẠI CHỖ
#
# Bản đầu của script này làm `git reset --hard` rồi build ngay trong thư mục
# đang chạy. Nghe gọn, nhưng có một lỗi nặng: `vite build` XOÁ SẠCH dist/
# trước khi ghi bản mới. Tức là suốt lúc npm ci + build (vài chục giây trên
# máy 2 lõi), nginx vẫn phục vụ nhưng thư mục đã trống — khách vào thấy trang
# trắng hoặc 404. Không ai để ý vì mình test sau khi deploy xong.
#
# Cách này dựng bản mới ở THƯ MỤC KHÁC, xong xuôi hết rồi mới chuyển symlink.
# Chuyển symlink là thao tác nguyên tử: không có khoảnh khắc nào ở giữa.
# Suốt quá trình build, khách vẫn đang xem bản cũ chạy tốt.
#
# Đổi lại: hỏng ở bất kỳ bước nào thì bản cũ vẫn nguyên, không cần cứu gì.
# ============================================================
set -euo pipefail

GOC="/var/www/imob"
NHANH="${1:-main}"
KHO_MA="https://github.com/Kubosan669dev/Web-iMob.git"
GIU_LAI=3                      # số bản cũ giữ lại để quay lui
BAN_MOI="$GOC/releases/$(date +%Y%m%d-%H%M%S)"

CU=""
if [[ -L "$GOC/current" ]]; then
  CU="$(readlink -f "$GOC/current")"
fi

don_dep_khi_hong() {
  # Chỉ xoá thư mục bản mới đang dựng dở. KHÔNG đụng vào symlink current,
  # nên bản cũ vẫn đang phục vụ khách bình thường.
  if [[ -d "$BAN_MOI" ]]; then
    echo "!! Hỏng giữa chừng — xoá bản dựng dở, giữ nguyên bản đang chạy." >&2
    rm -rf "$BAN_MOI"
  fi
}
trap don_dep_khi_hong ERR

echo "==> 1/7  Lấy mã nguồn nhánh '$NHANH'"
mkdir -p "$GOC/releases"
git clone --depth 1 --branch "$NHANH" "$KHO_MA" "$BAN_MOI" --quiet
cd "$BAN_MOI"
MA_COMMIT="$(git rev-parse --short HEAD)"
echo "    commit $MA_COMMIT"

echo "==> 2/7  Nối file cấu hình dùng chung"
# .env nằm ở shared/ nên sống sót qua mọi lần deploy và không bao giờ lọt vào
# kho mã. Nối bằng symlink để cả API lẫn script đều thấy nó ở chỗ quen thuộc.
ln -sfn "$GOC/shared/.env" "$BAN_MOI/.env"

echo "==> 3/7  Cài thư viện Python"
"$GOC/moitruong/bin/pip" install -q -r chatbot-python/requirements.txt

echo "==> 4/7  Chạy bộ kiểm thử máy chủ"
# Chạy TRƯỚC khi dựng giao diện. Hỏng thì set -e dừng ngay, symlink chưa
# chuyển, khách vẫn đang dùng bản cũ và không thấy gì bất thường.
( cd chatbot-python && PYTHONUTF8=1 "$GOC/moitruong/bin/python" run_tests.py )

echo "==> 5/7  Dựng giao diện"
# npm ci (không phải npm install): cài đúng phiên bản ghi trong
# package-lock.json, nên bản trên máy chủ giống hệt bản đã thử ở máy.
npm ci --silent

# VITE_API_URL để TRỐNG là CỐ Ý — website và API chung một tên miền qua nginx
# nên mã nguồn gọi đường dẫn tương đối /api/* (src/utils/constants.js:83).
# Điền tên miền vào đây là tự chuốc lấy CORS mà chẳng được gì.
VITE_USE_BACKEND=true VITE_API_URL="" npm run build

if [[ ! -f "$BAN_MOI/dist/index.html" ]]; then
  echo "!! Build xong nhưng không có dist/index.html — dừng lại." >&2
  exit 1
fi

# node_modules chỉ cần lúc BUILD. Thứ đem phục vụ khách là dist/. Xoá đi để
# mỗi bản release không ngốn thêm vài trăm MB ổ đĩa — quay lui vẫn chạy được
# vì dist/ còn nguyên.
rm -rf "$BAN_MOI/node_modules"

echo "==> 6/7  Chuyển sang bản mới"
ln -sfn "$BAN_MOI" "$GOC/current"
sudo systemctl restart imob-api

echo "==> 7/7  Kiểm tra"
trap - ERR                      # từ đây hỏng thì quay lui, không xoá bản mới

quay_lui() {
  echo "!! $1" >&2
  if [[ -n "$CU" && -d "$CU" ]]; then
    echo "!! Đang quay lui về $(basename "$CU")" >&2
    ln -sfn "$CU" "$GOC/current"
    sudo systemctl restart imob-api
    echo "!! Đã quay lui. Xem nhật ký: sudo journalctl -u imob-api -n 50" >&2
  else
    echo "!! Không có bản cũ để quay lui (đây là lần deploy đầu)." >&2
  fi
  exit 1
}

# Đợi dịch vụ đứng dậy. Không có vòng chờ này thì lệnh kiểm tra chạy lúc
# uvicorn còn đang nạp scikit-learn -> báo hỏng oan.
API_SONG=0
for _ in $(seq 1 30); do
  if curl -fsS --max-time 2 http://127.0.0.1:8001/health >/dev/null 2>&1; then
    API_SONG=1
    break
  fi
  sleep 1
done
[[ $API_SONG -eq 1 ]] || quay_lui "API không phản hồi sau 30 giây."

# Kiểm tra qua nginx chứ không chỉ gọi thẳng uvicorn — để bắt được cả trường
# hợp nginx trỏ sai thư mục sau khi symlink đổi.
#
# Phải soi NỘI DUNG chứ không chỉ xem mã trả về. Bản đầu chỉ kiểm tra "có 200
# không" — và nó báo thành công trong khi nginx đang phục vụ trang mặc định
# "Welcome to nginx!", vì trang đó cũng trả 200. Kiểm tra kiểu ấy không sai,
# nó chỉ không kiểm tra đúng thứ mình cần biết.
curl -fsS --max-time 5 http://127.0.0.1/ 2>/dev/null | grep -q 'id="root"' \
  || quay_lui "nginx không trả về trang của mình (có thể đang trả trang mặc định)."

echo "==> Dọn bản cũ (giữ $GIU_LAI bản gần nhất)"
cd "$GOC/releases"
ls -1dt */ 2>/dev/null | tail -n +$((GIU_LAI + 1)) | xargs -r rm -rf

echo ""
echo "============================================"
echo " XONG. Đang chạy: $MA_COMMIT"
echo " Thư mục:         $(basename "$BAN_MOI")"
echo "============================================"
