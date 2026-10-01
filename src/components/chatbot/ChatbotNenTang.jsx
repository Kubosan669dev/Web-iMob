import { useEffect } from "react";
import { GOC_BOT, KHOA_BOT, PHIEN_BAN_BOT } from "./botNenTang.js";

// ============================================================
// Khung chat của nền tảng iMob CMS. Xem cấu hình và công tắc ở botNenTang.js.
//
// Việc của component: chèn 2 file của nền tảng vào trang MỘT LẦN, và giấu khung
// chat khi rời khỏi các trang dùng Layout (vd sang /admin).
//
// VÌ SAO GIẤU BẰNG THUỘC TÍNH TRÊN <html> CHỨ KHÔNG ĐỤNG THẲNG VÀO KHUNG CHAT:
// khung chat do script của nền tảng tự gắn vào <body>, nằm ngoài React, và gắn
// vào LÚC NÀO thì mình không biết — script tải bất đồng bộ. Nếu khách rời trang
// trước khi script tải xong mà mình đi tìm khung chat để giấu, sẽ không thấy gì
// để giấu, rồi khung chat hiện ra ở /admin. Một thuộc tính trên <html> cộng một
// quy tắc CSS (index.css) thì đúng bất kể khung chat xuất hiện trước hay sau.
//
// Không gỡ script khi rời trang: script đã chạy thì không "chạy ngược" được,
// và tải lại mỗi lần quay về chỉ làm khung chat mất lịch sử đang nói dở.
// ============================================================
const ID_CSS = "imob-bot-nen-tang-css";
const ID_JS = "imob-bot-nen-tang-js";

function chenMotLan() {
  if (!document.getElementById(ID_CSS)) {
    const css = document.createElement("link");
    css.id = ID_CSS;
    css.rel = "stylesheet";
    // ⚠️ PHẢI có /widget/. Thiếu nó, máy chủ vẫn trả mã 200 nhưng là trang HTML
    // của dashboard chứ không phải CSS — khung chat vỡ mà không báo lỗi gì
    // (đã kiểm tra 30/09/2026).
    css.href = `${GOC_BOT}/widget/widget.css?v=${PHIEN_BAN_BOT}`;
    document.head.appendChild(css);
  }
  if (!document.getElementById(ID_JS)) {
    const js = document.createElement("script");
    js.id = ID_JS;
    js.src = `${GOC_BOT}/widget/widget.min.js?v=${PHIEN_BAN_BOT}`;
    js.async = true;
    js.dataset.apiKey = KHOA_BOT; // -> data-api-key
    // Ghi rõ địa chỉ hệ thống chatbot. Khung chat có đọc thuộc tính này; để
    // trống thì nó tự đoán, và đoán sai là gọi nhầm sang API của imob.vn.
    js.dataset.apiBase = GOC_BOT; // -> data-api-base
    document.body.appendChild(js);
  }
}

export default function ChatbotNenTang() {
  useEffect(() => {
    chenMotLan();
    delete document.documentElement.dataset.botNenTang;
    return () => {
      document.documentElement.dataset.botNenTang = "an";
    };
  }, []);
  return null;
}
