import { Handshake, Users, Shield, Brain, Star } from "lucide-react";
import Container from "../components/ui/Container.jsx";
import SectionTitle from "../components/ui/SectionTitle.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import ChuyenDoiCard from "../components/ui/ChuyenDoiCard.jsx";
import { iconOf } from "../components/service/icons.js";
import { useAbout, useCongTy, useSanPham } from "../context/NoiDungContext.jsx";
import { soLieuHienThi } from "../utils/soLieu.js";

// Nội dung section đọc từ data/about.json — sửa được ở /admin, tab Giới thiệu.
//
// TRỪ DẢI SỐ LIỆU: ba con số đó ĐẾM từ danh sách sản phẩm (utils/soLieu.js),
// không nằm trong about.json nữa. Bản trước ghi tay "50+ / 30+ / 99%" và
// không ai kiểm chứng được — xem lý do đầy đủ trong utils/soLieu.js.
//
// Toàn bộ chữ trong section này lấy từ ba ấn phẩm chính thức của công ty:
// sứ mệnh, triết lý phục vụ, bốn giá trị cốt lõi và năm năng lực nổi bật.
//
// Map tên icon (chuỗi trong JSON) → component lucide: JSON không chứa được
// component. Bốn giá trị dùng map riêng ở đây; dải năng lực dùng chung
// `iconOf` với các section khác vì danh sách icon ở đó dài hơn.
const FEATURE_ICONS = {
  users: Users,
  shield: Shield,
  brain: Brain,
  handshake: Handshake,
};

export default function About() {
  const congTy = useCongTy();
  const about = useAbout();
  const soLieu = soLieuHienThi(useSanPham());

  return (
    <section id="about" className="bg-mist py-24 lg:py-32">
      <Container className="space-y-20 lg:space-y-24">
        {/* ---------- Tiêu đề = sứ mệnh công ty ---------- */}
        <Reveal>
          <SectionTitle
            badge={about.phuDe}
            title={about.tieuDe}
            highlight={about.tieuDeNhan}
            description={about.moTa}
          />
        </Reveal>

        {/* ---------- Triết lý + số liệu ‖ khối Trước → Sau ---------- */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="space-y-10">
            <Reveal>
              {/* Cỡ chữ lớn hơn đoạn văn thường: đây là câu công ty tự nói về
                  cách mình làm việc, đáng được đọc chậm. */}
              <p className="text-[1.0625rem] leading-relaxed text-ink-soft sm:text-[1.25rem]">
                {about.philosophy}
              </p>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="grid grid-cols-3 gap-6 border-t border-line pt-8">
                {soLieu.map((stat) => (
                  <div key={stat.label}>
                    <p className="tieu-de-lon text-[clamp(1.75rem,4vw,2.75rem)] text-brand">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm leading-snug text-ink-soft">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <ChuyenDoiCard className="mx-auto max-w-md" />
          </Reveal>
        </div>

        {/* ---------- Bốn giá trị cốt lõi ---------- */}
        <div className="grid gap-5 sm:grid-cols-2">
          {about.features.map((feature, index) => {
            // ?? Star: nếu JSON ghi tên icon lạ thì vẫn có icon dự phòng,
            // không để trang trắng vì một lỗi gõ nhầm trong dữ liệu.
            const Icon = FEATURE_ICONS[feature.icon] ?? Star;
            return (
              <Reveal key={feature.title} delay={(index % 2) * 0.1} className="h-full">
                <div className="flex h-full flex-col rounded-block bg-panel p-8">
                  <Icon className="h-8 w-8 text-brand" aria-hidden="true" />
                  <h3 className="tieu-de-lon mt-5 text-xl text-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-soft">
                    {feature.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* ---------- Năng lực nổi bật ----------
            `?.` và kiểm tra độ dài: trường `nangLuc` mới thêm 17/08/2026, một
            website đã chạy với database seed từ trước có thể chưa có nó. Thiếu
            thì cả khối biến mất, không vỡ trang. (NoiDungContext giờ đã trộn
            theo từng trường nên trường hợp này hiếm — vẫn chặn cho chắc.) */}
        {about.nangLuc?.length > 0 && (
          <Reveal>
            <div className="rounded-block bg-panel px-8 py-10 sm:px-12">
              <p className="text-center text-sm font-semibold text-ink-faint">
                Năng lực nổi bật
              </p>
              <ul className="mt-8 grid gap-8 sm:grid-cols-3 lg:grid-cols-5">
                {about.nangLuc.map((nl) => {
                  const Icon = iconOf(nl.icon);
                  return (
                    <li
                      key={nl.label}
                      className="flex flex-col items-center gap-3 text-center"
                    >
                      <Icon className="h-7 w-7 text-brand" aria-hidden="true" />
                      <span className="text-[0.9375rem] font-medium leading-snug text-ink">
                        {nl.label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>
        )}

        {/* ---------- Slogan chốt section ----------
            Câu định vị chính thức của công ty, in nghiêng cỡ lớn giữa nhiều
            khoảng trắng — kiểu câu kết Apple hay đặt cuối một trang sản phẩm. */}
        {congTy.slogan && (
          <Reveal>
            <p className="tieu-de-lon mx-auto max-w-3xl text-center text-[clamp(1.5rem,3.2vw,2.25rem)] text-ink">
              {congTy.name} — <span className="text-brand">{congTy.slogan}</span>
            </p>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
