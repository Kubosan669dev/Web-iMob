import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import Container from "../components/ui/Container.jsx";
import SectionTitle from "../components/ui/SectionTitle.jsx";
import Button from "../components/ui/Button.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import { useCongTy } from "../context/NoiDungContext.jsx";
import { submitContact } from "../services/contactService.js";
import services from "../data/services.json";

/* ---------- Thông tin liên hệ ---------- */
// CỐ Ý dựng bên trong component chứ KHÔNG phải ở cấp module như trước.
// Bản cũ viết `const CONTACT_INFO = [...SITE.phone...]` ngoài component nên mảng
// bị "đóng băng" ngay lúc file được nạp: sửa số điện thoại trong /admin thì
// Navbar/Footer đổi theo, riêng khối này vẫn hiện số cũ cho tới khi build lại.
//
// Ô "Điện thoại" và "Email" bấm được — trên điện thoại là gọi/soạn thư ngay.
function dungThongTinLienHe(congTy) {
  return [
    {
      icon: Phone,
      label: "Điện thoại",
      value: congTy.phone,
      href: `tel:${congTy.phone.replace(/\s/g, "")}`,
    },
    { icon: Mail, label: "Email", value: congTy.email, href: `mailto:${congTy.email}` },
    { icon: MapPin, label: "Văn phòng", value: congTy.address },
    { icon: Clock, label: "Giờ làm việc", value: congTy.workingHours },
  ];
}

/* ---------- Form ---------- */
const EMPTY_FORM = { name: "", email: "", phone: "", service: "", message: "" };

// Ô nhập kiểu Apple: KHÔNG viền, bo góc vừa. Viền chỉ xuất hiện khi ô được
// chọn. Bớt được một đường kẻ trên mỗi ô — form 5 ô là bớt 5 đường.
//
// ĐỔI 18/08/2026: nền ô từ xám sang TRẮNG. Khối Liên hệ giờ nằm trên nền
// trắng (để không dính liền khối "Về iMob" cũng nền xám), nên thẻ bao ngoài
// thành xám — ô nhập mà vẫn xám nữa thì chìm hẳn vào thẻ, không thấy đâu là
// chỗ gõ chữ.
const INPUT_CLS =
  "w-full rounded-xl border border-transparent bg-panel px-4 py-3.5 text-[1.0625rem] " +
  "text-ink placeholder-ink-faint outline-none transition-colors " +
  "focus:border-brand";

// Ô nhập có nhãn + thông báo lỗi bên dưới
function Field({ label, required = false, error, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink-soft">
        {label} {required && <span className="text-brand">*</span>}
      </span>
      {children}
      {error && <span className="mt-2 block text-sm text-loi">{error}</span>}
    </label>
  );
}

function ContactForm() {
  const congTy = useCongTy();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [loiGui, setLoiGui] = useState("");

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
    setLoiGui("");

    // Bản cũ gọi submitContact rồi báo "thành công" BẤT KỂ kết quả. Với backend
    // thật thì đó là lỗi nghiêm trọng: khách tưởng đã gửi được, yên tâm chờ, mà
    // thực ra chẳng ai nhận được gì. Giờ phải xem kết quả trả về.
    const ketQua = await submitContact(form);

    if (!ketQua.success) {
      setLoiGui(ketQua.error);
      setStatus("error");
      // CỐ Ý không xoá form: khách còn nguyên nội dung vừa gõ để bấm gửi lại,
      // không phải nhập lại từ đầu.
      return;
    }

    setStatus("success");
    setForm(EMPTY_FORM);
    // Ẩn banner thành công sau 5s
    setTimeout(() => setStatus("idle"), 5000);
  };

  return (
    <div className="rounded-block bg-mist p-8 sm:p-10">
      <h3 className="tieu-de-lon text-2xl text-ink">Gửi yêu cầu tư vấn</h3>
      <p className="mt-2 text-[0.9375rem] text-ink-soft">
        Chúng tôi phản hồi {congTy.responseTime}.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
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

        <Field label="Bạn quan tâm tới">
          <select
            value={form.service}
            onChange={setField("service")}
            className={`${INPUT_CLS} appearance-none`}
          >
            <option value="">— Chọn một mục —</option>
            {services.map((s) => (
              <option key={s.id} value={s.title}>
                {s.title}
              </option>
            ))}
            <option value="Khảo sát & đánh giá app/website">
              Khảo sát &amp; đánh giá app/website
            </option>
            <option value="Tư vấn công nghệ">Tư vấn công nghệ</option>
            <option value="Khác">Khác</option>
          </select>
        </Field>

        <Field label="Nội dung" required error={errors.message}>
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
          <p
            role="status"
            className="flex items-center gap-2.5 rounded-xl bg-brand-soft px-4 py-3.5 text-[0.9375rem] text-brand"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
            Đã gửi thành công! Chúng tôi sẽ phản hồi {congTy.responseTime}.
          </p>
        )}

        {/* Banner lỗi — luôn kèm hotline để khách còn đường liên lạc khác */}
        {status === "error" && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl bg-loi-nen px-4 py-3.5 text-[0.9375rem] text-loi"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <span>
              {loiGui}
              <br />
              Bạn có thể gọi trực tiếp{" "}
              <a
                href={`tel:${congTy.phone.replace(/\s/g, "")}`}
                className="font-semibold underline"
              >
                {congTy.phone}
              </a>
              .
            </span>
          </div>
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
            "Gửi yêu cầu"
          )}
        </Button>
      </form>
    </div>
  );
}

/* ---------- Section ---------- */
export default function Contact() {
  const congTy = useCongTy();
  const thongTinLienHe = dungThongTinLienHe(congTy);

  return (
    <section id="contact" className="py-24 lg:py-32">
      <Container className="space-y-14">
        <Reveal>
          <SectionTitle
            badge="Liên hệ"
            title="Bắt đầu bằng một"
            highlight="buổi khảo sát miễn phí."
            description="Kể cho chúng tôi nghe đơn vị bạn đang vướng ở đâu. Không cần chuẩn bị gì trước."
          />
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-5">
          {/* ---------- Cột trái: thông tin ---------- */}
          <Reveal className="lg:col-span-2">
            <div className="flex h-full flex-col rounded-block bg-mist p-8 sm:p-10">
              <ul className="space-y-7">
                {thongTinLienHe.map((info) => (
                  <li key={info.label} className="flex items-start gap-4">
                    <info.icon
                      className="mt-1 h-5 w-5 shrink-0 text-brand"
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-sm text-ink-faint">{info.label}</p>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-[1.0625rem] font-medium text-ink hover:text-brand"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-[1.0625rem] font-medium leading-snug text-ink">
                          {info.value}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              <p className="mt-auto pt-10 text-[0.9375rem] leading-relaxed text-ink-soft">
                Cần trả lời ngay? Hỏi nhanh trợ lý{" "}
                <strong className="font-medium text-ink">Chat AI</strong> ở góc
                màn hình — hoạt động 24/7.
              </p>
            </div>
          </Reveal>

          {/* ---------- Cột phải: form ---------- */}
          <Reveal delay={0.1} className="lg:col-span-3">
            <ContactForm />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
