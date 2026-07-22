# KẾ HOẠCH XÂY DỰNG WEBSITE DỊCH VỤ CÔNG NGHỆ + AI CHATBOT

> Lấy cảm hứng từ imob.vn · Frontend-only · Backend AI Python làm riêng sau
> Cập nhật: 16/07/2026

---

## 1. MỤC TIÊU & PHẠM VI

**Làm:** Website giới thiệu dịch vụ công nghệ — dark theme hiện đại kiểu công ty AI/SaaS, hiệu ứng glow + glassmorphism, responsive, kèm giao diện AI Chatbot (fake data, sẵn sàng nối backend Python qua `POST /api/chat`).

**Không làm:** Database, trang quản trị, đăng nhập, backend NodeJS.

**Quyết định đã chốt:**
| Vấn đề | Quyết định |
|---|---|
| Chatbot đặt ở đâu | Widget nổi góc phải (kiểu Intercom) + 1 section giới thiệu trên trang chủ |
| Màn hình intro "Power On" của imob | ❌ Không làm — vào thẳng trang chủ |
| Dropdown SERVICES ▼ | Anchor tới section, chưa làm trang chi tiết (Router vẫn cài sẵn) |
| Icon | Chỉ dùng Lucide (bỏ React Icons — trùng công năng) |
| Thương hiệu | Đặt trong `utils/constants.js` để đổi dễ; không nên deploy công khai với đúng tên "iMob" (thương hiệu của người khác) |
| Ngôn ngữ chatbot | **Tiếng Việt mặc định** (UI, fake data, system prompt sau này); tự trả lời tiếng Anh nếu khách nhắn tiếng Anh — xử lý bằng prompt, không cần code thêm |

---

## 2. KẾT QUẢ PHÂN TÍCH IMOB.VN

Phân tích từ source thật: site build bằng **Next.js + Tailwind + Lucide** (generate bằng v0.dev). Trang chủ là **1 trang anchor-scroll** (`#about`, `#services`, `#contact`) + 3 trang chi tiết dịch vụ. **imob.vn không có chatbot** — phần chatbot là ta tự thiết kế mới.

**Design tokens thật của imob:**
- Nền đen thuần; grid nền `linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px)` 2 chiều, ô 50px, opacity ~10%
- Màu: blue-500 `#3b82f6` · purple-500 `#a855f7` · cyan-400 `#22d3ee`
- Heading gradient `from-blue-400 via-purple-400 to-cyan-400` + `bg-clip-text`
- Glass: `bg-gray-900/90 + backdrop-blur-xl + border-blue-500/30`
- Glow: `shadow-blue-500/30`, `drop-shadow(0 0 10px …)`, blob `blur-2xl animate-pulse`
- Font mono cho chữ kỹ thuật; particles `animate-ping` rải rác

**Nội dung thật (dùng làm placeholder):**
- **Hero:** badge "GIẢI PHÁP SỐ THẾ HỆ MỚI" · h1 "DIGITAL FUTURE STARTS HERE" · nút "KHÁM PHÁ DỊCH VỤ" / "TƯ VẤN MIỄN PHÍ" · bên phải là **terminal giả lập** (`$ imob --status`, chips AI PROCESSING / CLOUD SYNC / IOT NETWORK) — không phải 3D
- **About:** "VỀ IMOB" / "GIẢI PHÁP IMOB" + cards Trusted Partners / Expert Team / Custom Solutions
- **Services (3):** Phát triển Zalo MiniApp · Giải pháp Phần mềm & Phần cứng · Đào tạo Chuyển đổi số
- **Contact:** form (Họ tên, Email, SĐT, Dịch vụ quan tâm, Tin nhắn) + info + QR
- **Footer:** 4 cột (company / LINKS / SERVICES / FOLLOW US) + copyright

---

## 3. TECH STACK (đã khóa phiên bản — tránh kẹt config)

```bash
# Runtime
npm install react react-dom react-router-dom lucide-react react-markdown motion \
  @fontsource-variable/inter @fontsource-variable/jetbrains-mono

# Dev
npm install -D vite @vitejs/plugin-react tailwindcss @tailwindcss/vite \
  eslint @eslint/js eslint-plugin-react-hooks eslint-plugin-react-refresh globals
```

| Thư viện | Phiên bản | Lưu ý quan trọng cho intern |
|---|---|---|
| React | 19.2 | — |
| Vite | 8.x | — |
| **Tailwind CSS** | **v4** | KHÔNG có `tailwind.config.js`/postcss. Config bằng CSS: `@import "tailwindcss"` + `@theme`. **Đừng theo tutorial v3!** |
| **Motion** | 12.x | Tên mới của Framer Motion: `import { motion } from "motion/react"` |
| React Router | 7.x | Dùng `BrowserRouter` declarative |
| lucide-react | 1.x | Icon duy nhất của dự án |
| react-markdown | 10.x | Render markdown trong chatbot |
| @fontsource-variable | 5.x | Font self-host: Inter (sans) + JetBrains Mono (terminal/badge) |

---

## 4. CẤU TRÚC THƯ MỤC

```
src/
├── components/
│   ├── ui/        # Button, Badge, Card, Container, SectionTitle
│   ├── layout/    # Navbar, MobileMenu, Footer
│   └── chatbot/   # ChatWidget, ChatWindow, MessageBubble, TypingIndicator, ChatInput
├── sections/      # Hero, About, Services, Projects, ChatbotIntro, Contact
├── pages/         # HomePage.jsx (ghép sections), UiKitPage.jsx (style guide nội bộ)
├── data/          # services.json, projects.json, chatResponses.json
├── hooks/         # useScrollPosition, useActiveSection, useChat
├── services/      # chatService.js (mock ⇄ API thật)
├── utils/         # constants.js (brand, menu, liên hệ — KHÔNG hardcode trong component)
├── styles/        # index.css (@theme design tokens — nguồn màu duy nhất)
├── App.jsx        # BrowserRouter + Layout + ChatWidget toàn cục
└── main.jsx
```

**Nguyên tắc code:** component nhỏ, mỗi file một việc · dữ liệu nằm trong `data/*.json` · màu/hiệu ứng chỉ lấy từ tokens · comment giải thích "tại sao" ở chỗ cần thiết.

---

## 5. QUY TRÌNH MỖI BƯỚC (bắt buộc)

1. **Giải thích kiến trúc** ngắn gọn trước khi viết code
2. Viết code
3. Tự kiểm tra theo **DoD** (Definition of Done) của bước
4. **DỪNG — chờ xác nhận** rồi mới sang bước tiếp
5. `git commit` theo bước (lịch sử sạch, rollback dễ)

---

## 6. CÁC BƯỚC CHI TIẾT (7 bước · ước lượng ~8–10 ngày cho intern)

### Bước 1 — Khởi tạo + Design System (~1 ngày)
- [ ] Scaffold Vite + React 19, cài deps, ESLint 10 flat config, git init
- [ ] `vite.config.js`: plugin Tailwind v4 + **proxy `/api` → `http://localhost:8000`** (sẵn cho Python)
- [ ] `styles/index.css` `@theme`: palette (night `#05050a`, surface `#0b0b14`, primary `#3b82f6`, accent `#a855f7`, neon `#22d3ee`), glow shadows, keyframes (`float`, `glow-pulse`, `gradient-x`, `spin-slow`), utilities `text-gradient` + `glass`
- [ ] 5 UI components: `Container`, `Button` (primary gradient tím→xanh / outline / ghost × sm/md/lg), `Badge`, `Card` (glass, hover glow), `SectionTitle`
- [ ] Route `/ui-kit`: style guide nội bộ — duyệt tông màu tại đây TRƯỚC khi xây section
- **DoD:** `npm run lint` sạch · `npm run build` pass · dev server chạy, trang /ui-kit hiển thị đủ palette/buttons/cards · commit

### Bước 2 — Layout: Navbar + Footer + Mobile menu (~1.5–2 ngày)
- Hook `useScrollPosition` → Navbar fixed: đầu trang trong suốt, cuộn xuống thì `glass` + shadow + border-b
- Trái: logo gradient + "iMob" + tagline nhỏ. Giữa: HOME / ABOUT / SERVICES ▼ / CONTACT. Phải: nút **LIÊN HỆ** gradient
- Dropdown SERVICES: panel glass, 3 dịch vụ, anchor `#services`
- Hook `useActiveSection` (IntersectionObserver scroll-spy) → item active: nền `purple-500/10` + viền tím + icon `Zap` bên trái (đúng spec)
- MobileMenu: hamburger → panel trượt từ phải (`AnimatePresence`), stagger items, khóa scroll khi mở
- Footer 4 cột + social + copyright
- **DoD:** hiệu ứng scroll đúng · dropdown mở mượt · scroll-spy đổi active đúng section · mobile menu đóng/mở/bấm-link đều ổn · lint + commit

### Bước 3 — Hero (~1–1.5 ngày)
- Component `AnimatedGridBackground` (TÁI SỬ DỤNG cho section khác): grid CSS 50px + radial mask + 2-3 glow blobs `blur-3xl` + particles `animate-ping`
- Trái: Badge ⚡ "GIẢI PHÁP SỐ THẾ HỆ MỚI" · h1 3 dòng có `text-gradient` · mô tả · 2 nút: **LIÊN HỆ** (anchor `#contact`) + **CHAT AI** (outline — Bước 6 sẽ gắn mở widget)
- Phải: `TerminalCard` giả lập ($ lệnh, log chạy tuần tự, status chips) — nhẹ hơn và "đúng chất" hơn 3D
- Entrance animation stagger (motion), section `id="home"`
- **DoD:** 60fps · không layout shift · mobile xếp dọc đẹp · lint + commit

### Bước 4 — About + Services (~1–1.5 ngày)
- Pattern reveal dùng chung: `motion` `whileInView` fade-up, `viewport={{ once: true }}`
- About (`id="about"`): SectionTitle + 2 cột (nội dung + 3 feature cards + stats)
- Services (`id="services"`): 3 `ServiceCard` render từ `data/services.json` (icon, title, desc, features, "TÌM HIỂU THÊM" → `#contact`); hover: viền gradient + glow + nhấc nhẹ
- **DoD:** reveal chạy đúng 1 lần · card đều chiều cao · đổi JSON là đổi nội dung · commit

### Bước 5 — Projects + Contact (~1 ngày)
- Projects (`id="projects"`): grid 3 cột từ `projects.json` (thumbnail gradient placeholder, tags, title, desc, hover overlay)
- Contact (`id="contact"`): 2 cột — info cards (phone/email/địa chỉ) + `ContactForm` (validate required + email regex; submit giả → toast thành công; hàm `submitContact()` đặt trong `services/` chờ backend)
- **DoD:** form validate được · 2 cột → 1 cột mobile · commit

### Bước 6 — AI Chatbot (~2–2.5 ngày)
- `data/chatResponses.json`: câu trả lời theo keyword (dịch vụ, giá, liên hệ…) + fallback, có markdown
- `services/chatService.js` — **1 interface duy nhất:**
  ```js
  // Hiện tại (mock): delay 800–1500ms + match keyword từ JSON
  // Sau này (thật): fetch POST `${VITE_API_URL}/api/chat`  body {message}  →  {response}
  // Chuyển đổi bằng biến env VITE_USE_MOCK — component KHÔNG phải sửa
  sendMessage(message) → Promise<{ response }>
  ```
- Hook `useChat`: `messages[]`, `isTyping`, `error`, `send()`
- UI (giống ChatGPT): `ChatWidget` (nút nổi góc phải + pulse ring) → `ChatWindow` (panel glass): header (avatar Bot + chấm online) · `MessageList` auto-scroll · `MessageBubble` (AI trái / user phải, avatar, render `react-markdown`) · `TypingIndicator` 3 chấm · `ChatInput` (textarea auto-resize, Enter gửi, disable khi đang trả lời) · hiệu ứng typing từng ký tự
- Section `ChatbotIntro` trên trang chủ + gắn nút CHAT AI ở Hero mở widget
- Mobile: ChatWindow full-screen
- **DoD:** gửi → typing → trả lời markdown đúng · auto-scroll · mobile không tràn · commit

### Bước 7 — Responsive audit + Polish (~1 ngày)
- Rà 3 breakpoint: **375 / 768 / 1280+** từng section
- `useReducedMotion` — tôn trọng `prefers-reduced-motion`
- SEO: title/description/og tags, favicon (đã có SVG)
- Perf: lazy-load, kiểm bundle; dọn hardcode sót vào constants
- **DoD:** `npm run build && npm run preview` OK · Lighthouse Performance/A11y ≥ 90 · 0 lỗi console · commit

---

## 7. KẾT NỐI BACKEND PYTHON SAU NÀY (đã chuẩn bị sẵn)

```
Frontend  ──POST /api/chat {"message": "..."}──▶  Python (FastAPI, cổng 8000)
          ◀──────── {"response": "..."} ────────
```
- Dev: proxy `/api` trong `vite.config.js` đã trỏ `localhost:8000` — chạy Python lên là chat thật hoạt động
- Chỉ cần đặt `.env`: `VITE_USE_MOCK=false` (và `VITE_API_URL` nếu deploy khác domain)

---

## 7b. LỘ TRÌNH TỰ BUILD BACKEND AI (bạn tự làm — repo Python riêng)

**Nguyên tắc:** backend chỉ cần tôn trọng hợp đồng `POST /api/chat` là frontend chạy, không sửa gì thêm.

**Cấp độ khuyến nghị (làm tuần tự):**
1. **Cấp 1 — Gọi API LLM** (~1–2 ngày): FastAPI + SDK GPT/Claude/Gemini, system prompt tiếng Việt. Bắt đầu tại đây.
2. **Cấp 2 — Model local (tùy chọn)**: Ollama + Qwen/Vistral — miễn phí, cần máy khỏe, chất lượng thấp hơn cấp 1.
3. **Cấp 3 — RAG** (+3–5 ngày): nhúng dữ liệu dịch vụ/báo giá của bạn → chatbot trả lời đúng thông tin doanh nghiệp.
4. ~~Cấp 4 — Fine-tune~~: chưa cần ở giai đoạn này.

**Skeleton tối thiểu (cấp 1):**
```python
# main.py — chạy: uvicorn main:app --port 8000 --reload
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
async def chat(req: ChatRequest):
    # TODO: gọi LLM tại đây, truyền system prompt tiếng Việt
    return {"response": f"Bạn vừa nói: {req.message}"}
```
- Dev: không cần CORS (Vite proxy `/api` → `localhost:8000` lo hết). Deploy khác domain mới cần `CORSMiddleware`.
- Bật chat thật: đặt `.env` frontend `VITE_USE_MOCK=false`.
- Gợi ý nâng cấp sau: lưu lịch sử hội thoại (truyền kèm `history`), streaming từng chữ (SSE) — frontend sẽ nâng cấp tương ứng khi bạn cần.

---

## 8. BẪY THƯỜNG GẶP (intern đọc kỹ)

1. **Tailwind v4 ≠ v3** — thấy tutorial bảo tạo `tailwind.config.js` + `postcss.config.js` là tutorial CŨ, bỏ qua
2. **Motion**: import từ `"motion/react"`, không phải `"framer-motion"`
3. Đừng lạm dụng animation — mỗi section 1-2 hiệu ứng reveal là đủ; hiệu ứng lặp vô hạn chỉ dành cho nền
4. Màu/khoảng cách lấy từ tokens & component có sẵn — thấy mình đang gõ mã hex trong JSX là đang làm sai
5. Ảnh/asset đều đi qua `assets/` hoặc `public/`, đặt tên kebab-case
6. Commit theo bước, message rõ ràng — đừng dồn 3 bước 1 commit
7. Test mobile bằng DevTools NGAY trong lúc làm, đừng để đến Bước 7
8. **ESLint 10 + eslint-plugin-react-hooks v7**: `configs.recommended` của plugin vẫn là format cũ (legacy) → khai báo thủ công trong `eslint.config.js`: `plugins: { "react-hooks": reactHooks }` + bật từng rule (`rules-of-hooks: error`, `exhaustive-deps: warn`)
9. **lucide-react v1.x đã GỠ brand icons** (Facebook, YouTube, LinkedIn, GitHub…) — không import chúng từ lucide; dùng SVG inline trong `components/icons/BrandIcons.jsx` (path theo simple-icons), không cần thêm thư viện

---

## 9. TRẠNG THÁI HIỆN TẠI (cập nhật 19/07/2026)

### ✅ TOÀN BỘ 7 BƯỚC ĐÃ HOÀN THÀNH

- ✅ **Bước 1–5** (commits `44a3d99` → `7ec9b24`): design system, layout, Hero, About + Services, Projects + Contact
- ✅ **Bước 6 — Chatbot** (commit `f504ea3`, **làm lại 22/07/2026** ở commit `b2be1d9`): ban đầu là backend Python + Ollama qwen2.5:3b chạy local; sau khi thử nghiệm thật thấy model 3B hay bịa nên **bỏ hẳn AI**, chuyển sang kho kiến thức `src/data/kienThuc.json` (15 mục · 53 intent) chạy trong trình duyệt — 153 câu test, 100%. Hướng dẫn dễ hiểu: [HUONG-DAN-CHATBOT.md](HUONG-DAN-CHATBOT.md), lý do đầy đủ: [CHATBOT.md](CHATBOT.md) mục 9
- ✅ **Bước 7 — Polish** (19/07/2026):
  - **Giảm chuyển động**: `<MotionConfig reducedMotion="user">` (phủ toàn bộ motion) + `@media (prefers-reduced-motion)` trong `index.css` (phủ animation CSS) + `useReducedMotion` trong `useChat` (tắt hiệu ứng gõ chữ)
  - **SEO**: Open Graph + Twitter Card + `theme-color` + canonical + robots trong `index.html`
  - **Hiệu năng**: bundle chính **543 kB → 401 kB** (gzip 173 → 128 kB) nhờ tách `react-markdown` (116 kB), `ChatWindow` và `UiKitPage` thành chunk riêng bằng `lazy()`. Hết cảnh báo >500 kB
  - **Sửa lỗi mobile**: nút nổi từng đè lên nút Gửi khi chat mở full màn hình → ẩn nút nổi dưới 640px; khoá cuộn nền khi chat full màn hình
  - **Sửa nội dung sai**: mockup trang chủ từng ghi giá bịa "**30 triệu**" — trái với thiết kế backend (tuyệt đối không báo giá) → đổi thành mời để lại liên hệ

### ⚠️ Việc còn lại trước khi dùng thật

1. 🔴 **Thông tin liên hệ đang là giả** (`+84 900 000 000`, `hotro@example.com`) — sửa **duy nhất** `src/data/company.json`, website và bot cùng đọc file đó
2. 🟡 **Chưa có bảng giá** — bot chỉ mời khách để lại liên hệ
3. 🟡 **og:image** — cần ảnh 1200×630 trong `public/`, và đổi `og:url`/canonical thành tên miền thật khi deploy
4. 🟡 **Kiến thức `nguon: "soan"` và `nguon: "ngoai"` trong `kienThuc.json`** — phần tự soạn cần chủ dự án duyệt, phần tra ngoài (quy định Zalo) nên rà lại theo `link` mỗi nửa năm
5. 🟢 **Responsive**: đã rà bằng đọc code, **chưa render đo thật** ở 375/768/1280 — nên mở DevTools xem lại 3 mức này
6. 🟢 **Lighthouse**: chưa chạy đo (cần Chrome). DoD còn lại của Bước 7
