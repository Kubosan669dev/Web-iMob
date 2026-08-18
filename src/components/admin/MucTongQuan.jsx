import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Inbox,
  Package,
  RefreshCw,
  Server,
} from "lucide-react";
import * as api from "../../services/adminService.js";

// ============================================================
// Màn hình Tổng quan — thứ hiện ra ngay khi đăng nhập.
//
// Vì sao cần: trước đây đăng nhập xong là rơi thẳng vào form sửa Hero, mà việc
// đầu tiên người quản trị thật sự cần biết lại là "có ai nhắn gì mới không" và
// "máy chủ còn sống không". Màn hình này trả lời hai câu đó trước.
//
// MỖI Ô SỐ ĐỀU BẤM ĐƯỢC, dẫn thẳng tới chỗ xử lý. Một con số không bấm được
// chỉ là đồ trang trí — nhìn thấy "3 tin chưa xử lý" rồi vẫn phải tự đi tìm
// mục Tin nhắn thì con số đó chẳng giúp được gì.
// ============================================================

function O({ nhan, so, phu, icon: Icon, canChuY = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "group flex flex-col rounded-card p-5 text-left transition-colors " +
        (canChuY ? "bg-brand-soft hover:bg-brand/15" : "bg-mist hover:bg-line/60")
      }
    >
      <span className="flex items-center gap-2">
        <Icon
          className={"h-4 w-4 " + (canChuY ? "text-brand" : "text-ink-faint")}
          aria-hidden="true"
        />
        <span className="text-sm font-medium text-ink-soft">{nhan}</span>
      </span>
      <span
        className={
          "tieu-de-lon mt-3 text-[2rem] " + (canChuY ? "text-brand" : "text-ink")
        }
      >
        {so}
      </span>
      <span className="mt-0.5 flex items-center gap-1 text-[0.8125rem] text-ink-soft">
        {phu}
        <ArrowRight
          className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      </span>
    </button>
  );
}

function ngayGon(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MucTongQuan({ noiDung, diChuyen }) {
  const [lienHe, setLienHe] = useState(null);
  const [mayChu, setMayChu] = useState(null);
  const [dangTai, setDangTai] = useState(false);

  const tai = useCallback(async () => {
    setDangTai(true);
    // Hai lời gọi độc lập nhau — allSettled để một cái hỏng không kéo cái kia
    // xuống. Máy chủ ngủ dậy giữa chừng thì thường chỉ một trong hai lỗi.
    const [ds, tt] = await Promise.allSettled([
      api.danhSachLienHe(),
      api.trangThaiMayChu(),
    ]);
    setLienHe(ds.status === "fulfilled" ? ds.value : []);
    setMayChu(tt.status === "fulfilled" ? tt.value : null);
    setDangTai(false);
  }, []);

  useEffect(() => {
    tai();
  }, [tai]);

  const soSanPham = noiDung?.projects?.danhSach?.length ?? 0;
  const ds = lienHe ?? [];
  const chuaXuLy = ds.filter((r) => !r.da_xu_ly).length;
  const dbOk = mayChu?.database === "ok";

  return (
    <div className="space-y-5">
      {/* ---------- Bốn ô số ---------- */}
      <section className="rounded-block bg-panel p-6 sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="tieu-de-lon text-xl text-ink">Tổng quan</h2>
          <button
            type="button"
            onClick={tai}
            disabled={dangTai}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-ink-soft transition-colors hover:bg-mist hover:text-ink disabled:opacity-50"
          >
            <RefreshCw
              className={"h-3.5 w-3.5 " + (dangTai ? "animate-spin" : "")}
              aria-hidden="true"
            />
            Làm mới
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <O
            nhan="Chưa xử lý"
            so={lienHe === null ? "—" : chuaXuLy}
            phu={chuaXuLy > 0 ? "cần trả lời khách" : "đã xong hết"}
            icon={chuaXuLy > 0 ? AlertTriangle : CheckCircle2}
            canChuY={chuaXuLy > 0}
            onClick={() => diChuyen("tin-nhan")}
          />
          <O
            nhan="Tin nhắn"
            so={lienHe === null ? "—" : ds.length}
            phu="từ form và chatbot"
            icon={Inbox}
            onClick={() => diChuyen("tin-nhan")}
          />
          <O
            nhan="Sản phẩm"
            so={soSanPham}
            phu="đang hiện trên trang chủ"
            icon={Package}
            onClick={() => diChuyen("san-pham")}
          />
          <O
            nhan="Máy chủ"
            so={mayChu === null ? "—" : dbOk ? "Tốt" : "Lỗi"}
            phu={
              mayChu === null
                ? "không kết nối được"
                : dbOk
                  ? "database đã kết nối"
                  : "database chưa kết nối"
            }
            icon={Server}
            canChuY={mayChu !== null && !dbOk}
            onClick={tai}
          />
        </div>

        {mayChu !== null && !dbOk && (
          <p className="mt-5 flex items-start gap-2.5 rounded-xl bg-loi-nen px-4 py-3 text-sm text-loi">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              Máy chủ sống nhưng không nối được database. Nội dung sửa ở đây sẽ
              không lưu được, và tin nhắn khách gửi tới sẽ mất. Website vẫn chạy
              bình thường bằng bản nội dung đóng gói sẵn.
            </span>
          </p>
        )}
      </section>

      {/* ---------- Tin nhắn mới nhất ---------- */}
      <section className="rounded-block bg-panel p-6 sm:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="tieu-de-lon text-xl text-ink">Khách vừa liên hệ</h2>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-ink-soft transition-colors hover:text-brand"
          >
            Xem website
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>

        {lienHe === null ? (
          <p className="py-8 text-sm text-ink-soft">Đang tải…</p>
        ) : ds.length === 0 ? (
          <div className="rounded-card border border-dashed border-line px-6 py-10 text-center">
            <p className="text-sm text-ink">Chưa có ai để lại thông tin.</p>
            <p className="mt-1.5 text-[0.8125rem] text-ink-soft">
              Khách gửi form liên hệ hoặc để lại số qua chatbot sẽ hiện ở đây.
            </p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-line">
              {ds.slice(0, 5).map((r) => (
                <li key={r.id} className="flex items-start gap-3 py-3">
                  <span
                    className={
                      "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full " +
                      (r.da_xu_ly ? "bg-line" : "bg-canhbao-cham")
                    }
                    title={r.da_xu_ly ? "Đã xử lý" : "Chưa xử lý"}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {r.ho_ten || "(không để tên)"}
                      <span className="ml-2 font-normal text-ink-soft">
                        {r.so_dien_thoai || r.email || ""}
                      </span>
                    </p>
                    {(r.dich_vu || r.loi_nhan) && (
                      <p className="mt-0.5 truncate text-[0.8125rem] text-ink-soft">
                        {r.dich_vu ? `${r.dich_vu} — ` : ""}
                        {r.loi_nhan}
                      </p>
                    )}
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-ink-faint">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {ngayGon(r.tao_luc)}
                  </span>
                </li>
              ))}
            </ul>

            {ds.length > 5 && (
              <button
                type="button"
                onClick={() => diChuyen("tin-nhan")}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
              >
                Xem tất cả {ds.length} tin
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </>
        )}
      </section>
    </div>
  );
}
