import { useState } from "react";
import {
  Send,
  Phone,
  Mail,
  MapPin,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import Container from "../components/ui/Container.jsx";
import SectionTitle from "../components/ui/SectionTitle.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import { SITE } from "../utils/constants.js";
import { submitContact } from "../services/contactService.js";
import services from "../data/services.json";

/* ---------- Thông tin liên hệ (đọc từ constants) ---------- */
const CONTACT_INFO = [
  { icon: Phone, label: "Điện thoại", value: SITE.phone },
  { icon: Mail, label: "Email", value: SITE.email },
  { icon: MapPin, label: "Địa chỉ", value: SITE.address },
];

/* ---------- Form ---------- */
const EMPTY_FORM = { name: "", email: "", phone: "", service: "", message: "" };

const INPUT_CLS =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm " +
  "text-white placeholder-gray-500 outline-none transition-colors " +
  "focus:border-purple-500/60 focus:bg-purple-500/[0.04]";

// Ô nhập có nhãn + thông báo lỗi bên dưới
function Field({ label, required = false, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label} {required && <span className="text-purple-400">*</span>}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-xs text-red-400">{error}</span>}
    </label>
  );
}

function ContactForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success

  const setField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    // Người dùng sửa ô nào thì xoá lỗi ô đó
    setErrors((errs) => ({ ...errs, [key]: undefined }));
  };

  // Validate: các trường bắt buộc + định dạng email
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Vui lòng nhập họ tên.";
    if (!form.email.trim()) errs.email = "Vui lòng nhập email.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      errs.email = "Email không đúng định dạng.";
    if (!form.message.trim()) errs.message = "Bạn muốn trao đổi điều gì?";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setStatus("sending");
    await submitContact(form);
    setStatus("success");
    setForm(EMPTY_FORM);
    // Ẩn banner thành công sau 5s
    setTimeout(() => setStatus("idle"), 5000);
  };

  return (
    <Card className="p-7 sm:p-8">
      <h3 className="mb-6 text-xl font-bold text-white">
        Gửi tin nhắn cho chúng tôi
      </h3>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Họ và tên" required error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={setField("name")}
              placeholder="Nguyễn Văn A"
              className={INPUT_CLS}
            />
          </Field>
          <Field label="Số điện thoại">
            <input
              type="tel"
              value={form.phone}
              onChange={setField("phone")}
              placeholder="09xx xxx xxx"
              className={INPUT_CLS}
            />
          </Field>
        </div>

        <Field label="Email" required error={errors.email}>
          <input
            type="email"
            value={form.email}
            onChange={setField("email")}
            placeholder="ban@email.com"
            className={INPUT_CLS}
          />
        </Field>

        <Field label="Dịch vụ quan tâm">
          <select
            value={form.service}
            onChange={setField("service")}
            className={`${INPUT_CLS} appearance-none [&>option]:bg-surface`}
          >
            <option value="">— Chọn dịch vụ —</option>
            {services.map((s) => (
              <option key={s.id} value={s.title}>
                {s.title}
              </option>
            ))}
            <option value="Tư vấn công nghệ">Tư vấn công nghệ</option>
            <option value="Khác">Khác</option>
          </select>
        </Field>

        <Field label="Tin nhắn" required error={errors.message}>
          <textarea
            rows={4}
            value={form.message}
            onChange={setField("message")}
            placeholder="Mô tả ngắn gọn nhu cầu của bạn..."
            className={`${INPUT_CLS} resize-none`}
          />
        </Field>

        {/* Banner thành công */}
        {status === "success" && (
          <p className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            Đã gửi thành công! Chúng tôi sẽ phản hồi trong vòng 24h.
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={status === "sending"}
        >
          {status === "sending" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Đang gửi...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden="true" /> Gửi tin nhắn
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}

/* ---------- Section ---------- */
export default function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden py-24 lg:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 bottom-0 h-[26rem] w-[26rem] rounded-full bg-purple-600/10 blur-3xl"
      />

      <Container className="relative space-y-14">
        <Reveal>
          <SectionTitle
            badge="Liên hệ"
            icon={Send}
            title="CONNECT WITH"
            highlight="FUTURE"
            description="Sẵn sàng đồng hành cùng bạn trong hành trình chuyển đổi số. Để lại lời nhắn — chúng tôi phản hồi trong 24h."
          />
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-5">
          {/* ---------- Cột trái: thông tin ---------- */}
          <div className="space-y-5 lg:col-span-2">
            <Reveal>
              <h3 className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">
                Thông tin liên hệ
              </h3>
            </Reveal>
            {CONTACT_INFO.map((info, index) => (
              <Reveal key={info.label} delay={index * 0.1}>
                <Card hover className="flex items-center gap-4 p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/30 bg-gradient-to-br from-blue-500/25 to-cyan-500/25">
                    <info.icon className="h-5 w-5 text-cyan-300" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-gray-500">
                      {info.label}
                    </p>
                    <p className="truncate text-sm font-semibold text-white">
                      {info.value}
                    </p>
                  </div>
                </Card>
              </Reveal>
            ))}
            <Reveal delay={0.3}>
              <p className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-xs leading-relaxed text-gray-500">
                💡 Cần trả lời ngay? Hỏi nhanh trợ lý{" "}
                <strong className="text-gray-300">Chat AI</strong> ở góc màn
                hình — hoạt động 24/7.
              </p>
            </Reveal>
          </div>

          {/* ---------- Cột phải: form ---------- */}
          <Reveal delay={0.15} className="lg:col-span-3">
            <ContactForm />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
