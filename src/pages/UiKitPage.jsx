import { MessageCircle, Cpu, Rocket, Zap } from "lucide-react";
import Container from "../components/ui/Container.jsx";
import Button from "../components/ui/Button.jsx";
import Badge from "../components/ui/Badge.jsx";
import Card from "../components/ui/Card.jsx";
import SectionTitle from "../components/ui/SectionTitle.jsx";

// ------------------------------------------------------------------
// UiKitPage: style-guide NỘI BỘ (route /ui-kit) — không link ra ngoài.
// Cập nhật 17/08/2026 theo hệ thiết kế kiểu Apple + màu thương hiệu thật
// lấy từ logo và ấn phẩm chính thức của iMob.
// ------------------------------------------------------------------

function DemoBlock({ title, children }) {
  return (
    <section className="space-y-6 border-t border-line pt-10">
      <h3 className="font-mono text-xs uppercase tracking-widest text-ink-faint">
        {title}
      </h3>
      {children}
    </section>
  );
}

// Ô màu trong palette
function Swatch({ name, varName, hex, ghiChu }) {
  return (
    <div className="space-y-2">
      <div
        className="h-20 rounded-card border border-line"
        style={{ backgroundColor: hex }}
      />
      <p className="text-sm font-semibold text-ink">{name}</p>
      <p className="font-mono text-xs text-ink-faint">
        {varName} · {hex}
      </p>
      {ghiChu && <p className="text-xs leading-snug text-ink-soft">{ghiChu}</p>}
    </div>
  );
}

export default function UiKitPage() {
  return (
    <div className="min-h-screen py-20">
      <Container className="space-y-14">
        {/* ---------- Header ---------- */}
        <header className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-widest text-brand">
            /ui-kit · internal style guide
          </p>
          <h1 className="tieu-de-lon text-[clamp(2rem,5vw,3.5rem)] text-ink">
            iMob <span className="text-brand">Design System</span>
          </h1>
          <p className="max-w-2xl text-[1.0625rem] leading-relaxed text-ink-soft">
            Trang nội bộ, dùng để duyệt tông màu, chữ và component gốc. Hệ thiết
            kế lấy ngôn ngữ của apple.com — nền phẳng, khoảng trắng rộng, một
            màu nhấn duy nhất — nhưng dùng đúng màu chàm tím trong logo iMob.
          </p>
        </header>

        {/* ---------- Palette ---------- */}
        <DemoBlock title="01 · Palette">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            <Swatch name="Paper" varName="--color-paper" hex="#ffffff" ghiChu="Nền chính" />
            <Swatch name="Mist" varName="--color-mist" hex="#f5f5f7" ghiChu="Dải nền xen kẽ · mặt card" />
            <Swatch name="Ink" varName="--color-ink" hex="#1a1a2e" ghiChu="Chữ chính · 17:1" />
            <Swatch name="Ink soft" varName="--color-ink-soft" hex="#55556b" ghiChu="Chữ phụ · 7.1:1" />
            <Swatch name="Ink faint" varName="--color-ink-faint" hex="#6f6f80" ghiChu="Chú thích · 4.9:1" />
            <Swatch
              name="Brand"
              varName="--color-brand"
              hex="#4b31d4"
              ghiChu="Màu logo. 7.8:1 trên nền trắng — dùng được cả làm chữ lẫn làm nền nút"
            />
            <Swatch name="Brand deep" varName="--color-brand-deep" hex="#2f1d96" ghiChu="Trạng thái hover" />
            <Swatch name="Line" varName="--color-line" hex="#e5e5ea" ghiChu="Đường kẻ phân cách" />
          </div>
          <div className="rounded-block bg-mist p-6 text-[0.9375rem] leading-relaxed text-ink-soft">
            <strong className="font-semibold text-ink">Chỉ một màu nhấn.</strong>{" "}
            Bảng màu cũ có thêm màu phụ vàng cát; đã bỏ. Muốn nhấn mạnh thì tăng
            cỡ chữ hoặc thêm khoảng trắng, đừng thêm màu — thêm màu thứ hai là
            mất ngay vẻ điềm tĩnh của cả trang.
          </div>
        </DemoBlock>

        {/* ---------- Typography ---------- */}
        <DemoBlock title="02 · Typography">
          <div className="space-y-6">
            <h2 className="tieu-de-lon text-[clamp(2.5rem,6.5vw,5.5rem)] text-ink">
              Công nghệ cho
              <br />
              <span className="text-brand">chính quyền số</span>
              <br />
              ở Quảng Ninh.
            </h2>
            <p className="max-w-2xl text-[1.0625rem] leading-relaxed text-ink-soft sm:text-[1.3125rem]">
              Font chính: Be Vietnam Pro — thiết kế riêng cho tiếng Việt, dấu đặt
              đúng chỗ. Đây là chỗ cố ý không bắt chước Apple: font của họ không
              có bản web dùng được, và cũng không được vẽ cho dấu tiếng Việt.
            </p>
            <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-ink-soft">
              Tiêu đề dùng utility <code className="font-mono text-brand">tieu-de-lon</code>:
              chữ càng to thì khoảng cách giữa các chữ cái càng phải siết lại
              (-0.022em), không thì dòng chữ trông rời rạc. Không viết hoa toàn
              bộ tiêu đề — tiếng Việt viết hoa bị chồng dấu, đọc chậm hơn hẳn.
            </p>
          </div>
        </DemoBlock>

        {/* ---------- Badge (dòng dẫn) ---------- */}
        <DemoBlock title="03 · Dòng dẫn trên tiêu đề">
          <div className="space-y-3">
            <Badge>Sản phẩm</Badge>
            <Badge>Về chúng tôi</Badge>
            <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-ink-soft">
              Trước đây đây là viên thuốc có viền, có nền, có icon, chữ IN HOA
              giãn rộng. Giờ chỉ là một câu ngắn tô màu thương hiệu. Bớt một
              viền, một mảng nền và một icon trên mỗi section — cộng lại là khác
              biệt lớn về độ sạch của cả trang. Prop <code className="font-mono">icon</code> đã bỏ.
            </p>
          </div>
        </DemoBlock>

        {/* ---------- Buttons ---------- */}
        <DemoBlock title="04 · Buttons">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg">Nhận khảo sát miễn phí</Button>
              <Button variant="outline" size="lg">
                <MessageCircle className="h-4 w-4" /> Chat với AI
              </Button>
              <Button variant="ghost" size="lg">
                Tìm hiểu thêm
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="md">Size md</Button>
              <Button variant="outline" size="md">
                Size md
              </Button>
              <Button size="sm">Size sm</Button>
              <Button variant="outline" size="sm">
                Size sm
              </Button>
            </div>
            <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-ink-soft">
              Viên thuốc bo tròn hoàn toàn, không viền, không bóng. Nút phụ là
              một viên xám nhạt chứ không phải nút viền rỗng — viền rỗng tạo
              thêm một đường kẻ nữa trên trang. Hover chỉ đổi màu nền.
            </p>
          </div>
        </DemoBlock>

        {/* ---------- Cards ---------- */}
        <DemoBlock title="05 · Cards">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <Cpu className="h-8 w-8 text-brand" />
              <h4 className="tieu-de-lon mt-5 text-xl text-ink">Card thường</h4>
              <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-soft">
                Bo góc lớn, nền xám nhạt, không viền không bóng. Thứ tách card
                khỏi nền là chênh lệch sắc độ, chỉ vậy thôi.
              </p>
            </Card>
            <Card hover>
              <Rocket className="h-8 w-8 text-brand" />
              <h4 className="tieu-de-lon mt-5 text-xl text-ink">Card hover</h4>
              <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-soft">
                Di chuột vào: nền đậm thêm một bậc. Không phóng to, không nhấc
                lên — chuyển động thừa làm giao diện trông rẻ tiền.
              </p>
            </Card>
            <Card className="flex flex-col items-center justify-center text-center">
              <Zap className="h-8 w-8 animate-float text-brand" />
              <p className="mt-4 font-mono text-xs uppercase tracking-widest text-ink-soft">
                animate-float
              </p>
            </Card>
          </div>
        </DemoBlock>

        {/* ---------- SectionTitle ---------- */}
        <DemoBlock title="06 · SectionTitle">
          <div className="space-y-16">
            <SectionTitle
              badge="Sản phẩm"
              title="Đã chạy thật,"
              highlight="ở Quảng Ninh."
              description="Mặc định CĂN GIỮA — apple.com căn giữa gần như mọi tiêu đề section, và đó là một phần lý do trang họ trông cân."
            />
            <SectionTitle
              align="left"
              badge="Căn trái"
              title="Biến thể"
              highlight="hai cột."
              description="Chỉ dùng cho bố cục hai cột, nơi tiêu đề phải thẳng hàng với đoạn văn bên dưới."
            />
          </div>
        </DemoBlock>
      </Container>
    </div>
  );
}
