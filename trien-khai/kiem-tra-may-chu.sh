#!/usr/bin/env bash
# ============================================================
# KIỂM TRA MÁY CHỦ ĐỊNH KỲ — chạy mỗi tháng một lần.
#
#     sudo bash /var/www/imob/kiem-tra-may-chu.sh
#
# Script này KHÔNG sửa gì trên máy. Nó chỉ đọc và báo cáo.
#
# ------------------------------------------------------------
# VÌ SAO SO SÁNH VỚI LẦN TRƯỚC CHỨ KHÔNG CHỈ LIỆT KÊ
#
# Đổ ra một danh sách 400 gói phần mềm thì không ai đọc, và đọc cũng không
# biết cái nào mới. Câu hỏi thật là "so với tháng trước, có gì vừa mọc thêm".
# Nên script lưu lại ảnh chụp mỗi lần chạy, rồi in ra PHẦN KHÁC BIỆT.
#
# Lần chạy đầu tiên chưa có gì để so — đó là mốc gốc.
# ============================================================
set -uo pipefail

KHO="/var/log/kiem-tra-may-chu"
mkdir -p "$KHO"
HOM_NAY="$KHO/$(date +%Y-%m-%d_%H%M).txt"
LAN_TRUOC="$(ls -1t "$KHO"/*.txt 2>/dev/null | head -1)"

# ---------- Phần 1: ảnh chụp (đem đi so sánh) ----------
chup_anh() {
  echo "### TAI KHOAN DANG NHAP DUOC"
  awk -F: '($3>=1000 && $3<65534) || $1=="root" {print $1" (uid "$3", shell "$7")"}' /etc/passwd | sort

  echo
  echo "### KHOA SSH DUOC PHEP VAO"
  # Mỗi dòng là một người có thể đăng nhập. Dòng lạ = có người được thêm vào.
  while IFS=: read -r u _ uid _ _ home _; do
    [[ $uid -ge 1000 || $u == root ]] || continue
    f="$home/.ssh/authorized_keys"
    [[ -f $f ]] || continue
    while read -r dong; do
      [[ -n $dong && ${dong:0:1} != "#" ]] || continue
      vt=$(echo "$dong" | ssh-keygen -lf - 2>/dev/null | awk '{print $2" "$3}')
      echo "$u <- ${vt:-khong doc duoc}"
    done < "$f"
  done < /etc/passwd | sort

  echo
  echo "### CONG DANG MO NGHE"
  # Cổng lạ = có người cắm thêm dịch vụ. 127.0.0.1 là chỉ nghe trong máy.
  ss -tlnH 2>/dev/null | awk '{print $4}' | sort -u

  echo
  echo "### DICH VU TU BAT KHI KHOI DONG"
  systemctl list-unit-files --state=enabled --type=service --no-legend 2>/dev/null \
    | awk '{print $1}' | sort

  echo
  echo "### LICH CHAY NGAM (cron)"
  # Chỗ hay bị giấu thứ chạy nền nhất.
  for u in $(cut -f1 -d: /etc/passwd); do
    crontab -l -u "$u" 2>/dev/null | grep -vE '^\s*(#|$)' | sed "s/^/$u: /"
  done
  for f in /etc/cron.d/*; do
    [[ -f $f ]] && grep -vE '^\s*(#|$)' "$f" 2>/dev/null | sed "s|^|$(basename "$f"): |"
  done
  echo "(het)"

  echo
  echo "### THU MUC CAP MOT TRONG CAC NOI HAY BI CHIEM"
  for d in /var/www /opt /srv /home /root; do
    [[ -d $d ]] || continue
    find "$d" -maxdepth 1 -mindepth 1 2>/dev/null | sort | sed "s|^|$d: |"
  done

  echo
  echo "### DOCKER"
  if command -v docker >/dev/null 2>&1; then
    docker ps -a --format '{{.Image}} ({{.Names}})' 2>/dev/null | sort
    echo "nguoi trong nhom docker: $(getent group docker | cut -d: -f4)"
  else
    echo "chua cai docker"
  fi

  echo
  echo "### GOI PHAN MEM DA CAI"
  dpkg-query -W -f='${Package}\n' 2>/dev/null | sort
}

chup_anh > "$HOM_NAY"

# ---------- Phần 2: báo cáo đọc bằng mắt ----------
echo "============================================================"
echo " KIEM TRA MAY CHU — $(date '+%d/%m/%Y %H:%M')"
echo " $(hostname) — $(hostname -I | awk '{print $1}')"
echo "============================================================"

echo
echo "--- 1. AI DA DANG NHAP SSH THANH CONG (30 ngay qua) ---"
journalctl -u ssh --since "30 days ago" --no-pager 2>/dev/null \
  | grep -oE 'Accepted [a-z]+ for [a-z0-9_-]+ from [0-9.]+' \
  | awk '{print $NF" -> "$4" ("$2")"}' | sort | uniq -c | sort -rn \
  | sed 's/^/   /' || echo "   (khong doc duoc nhat ky)"
echo "   >> Dia chi IP la = co nguoi ngoai danh sach da vao duoc."

echo
echo "--- 1b. TEN MIEN DA DUOC DUNG DE VAO MAY CHU NAY ---"
# Chi ke nhung dong co dang ten mien o cot dau (bo qua dia chi IP va dong cu
# theo dinh dang mac dinh). Ten mien LA o day = co nguoi tro ten mien cua ho
# ve may chu nay ma khong bao ai.
cat /var/log/nginx/access.log /var/log/nginx/access.log.1 2>/dev/null   | awk '$1 ~ /^[a-zA-Z]/ && $1 ~ /\./ {print $1}' | sort | uniq -c | sort -rn | head -15 | sed 's/^/   /'
echo "   >> Chi imob.vn, www.imob.vn va dia chi IP la hop le."
echo "   >> Ten mien khac xuat hien = co nguoi muon may chu nay chay ke cho ho."
echo
echo "--- 2. DO MAT KHAU THAT BAI ---"
SO_HONG=$(journalctl -u ssh --since "30 days ago" --no-pager 2>/dev/null | grep -c 'Failed password')
echo "   So lan sai mat khau 30 ngay qua: ${SO_HONG:-0}"
if command -v fail2ban-client >/dev/null 2>&1; then
  fail2ban-client status sshd 2>/dev/null | grep -E 'Currently banned|Total banned|Banned IP' | sed 's/^/   /'
fi

echo
echo "--- 3. DUNG LUONG DIA ---"
df -h / | tail -1 | awk '{print "   O dia: dung "$3" / "$2"  ("$5")"}'
echo "   10 thu muc ngon nhat:"
du -xhd2 /var/www /opt /srv /home /root 2>/dev/null | sort -rh | head -10 | sed 's/^/     /'

echo
echo "--- 4. TIEN TRINH NGON NHAT ---"
echo "   RAM:"
ps -eo rss,comm --sort=-rss --no-headers | head -5 \
  | awk '{printf "     %6.0f MB  %s\n", $1/1024, $2}'
echo "   CPU:"
ps -eo pcpu,comm --sort=-pcpu --no-headers | head -5 | sed 's/^/     /'
free -h | grep -E '^(Mem|Swap)' | sed 's/^/   /'

echo
echo "--- 5. CONG DANG MO ---"
# Phai in CA DIA CHI chu khong chi so cong. 127.0.0.1:5432 la an toan (chi nghe
# trong may), 0.0.0.0:5432 la ca the gioi goi duoc — hai thu khac han nhau, ma
# nhin moi so cong thi khong phan biet noi.
ss -tlnpH 2>/dev/null | awk '{
  proc=$NF; gsub(/users:\(\(/,"",proc); gsub(/\).*/,"",proc); gsub(/"/,"",proc);
  split(proc,p,","); printf "   %-26s <- %s\n", $4, p[1]
}' | sort -u
echo "   >> 0.0.0.0 hoac [::] = nghe ra ben ngoai.  127.0.0.1 hoac [::1] = chi trong may."
echo "   >> Chi 22, 80, 443 duoc phep ra internet (xem Security Group tren Portal)."
echo "   >> Cong la nghe tren 0.0.0.0 = co nguoi cam them dich vu."

echo
echo "--- 6. GOI PHAN MEM CAI GAN DAY ---"
# cat thay vi grep nhieu file: thieu mot file (dpkg.log.1 chua xoay vong) thi
# grep tra ma loi, va vi co 'pipefail' nen ca duong ong bi coi la hong -> in ra
# "khong co nhat ky" mac du danh sach ben tren van dung. Loi bao sai con phien
# hon khong bao.
GOI_MOI=$(cat /var/log/dpkg.log /var/log/dpkg.log.1 2>/dev/null \
  | grep ' install ' | awk '{print $1" "$4}' | sort -u | tail -15)
if [[ -n "$GOI_MOI" ]]; then echo "$GOI_MOI" | sed 's/^/   /'; else echo "   (khong co nhat ky)"; fi

# ---------- Phần 3: khác biệt so với lần trước ----------
echo
echo "============================================================"
if [[ -n "$LAN_TRUOC" && "$LAN_TRUOC" != "$HOM_NAY" ]]; then
  echo " THAY DOI SO VOI $(basename "$LAN_TRUOC")"
  echo "============================================================"
  KHAC=$(diff "$LAN_TRUOC" "$HOM_NAY" | grep -E '^[<>]' || true)
  if [[ -z "$KHAC" ]]; then
    echo " Khong co gi thay doi."
  else
    echo " >  = MOI xuat hien    < = da BIEN MAT"
    echo
    echo "$KHAC"
  fi
else
  echo " LAN CHAY DAU TIEN — day la moc goc."
  echo "============================================================"
  echo " Thang sau chay lai, script se chi ra dung nhung gi moc them."
fi

echo
echo "Anh chup luu tai: $HOM_NAY"
