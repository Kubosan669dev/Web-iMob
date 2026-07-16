import {
  FolderGit2,
  CalendarCheck,
  Package,
  ShoppingCart,
  Bot,
  Utensils,
  Presentation,
  ArrowUpRight,
} from "lucide-react";
import Container from "../components/ui/Container.jsx";
import SectionTitle from "../components/ui/SectionTitle.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import projects from "../data/projects.json";

// Map chuỗi icon / theme trong projects.json → component & gradient class.
// (Giữ class Tailwind trong JSX để JIT quét được — không đặt class trong JSON)
const PROJECT_ICONS = {
  "calendar-check": CalendarCheck,
  package: Package,
  "shopping-cart": ShoppingCart,
  bot: Bot,
  utensils: Utensils,
  presentation: Presentation,
};

const THEME_GRADIENTS = {
  purple: "from-purple-600/40 via-purple-500/15 to-transparent",
  blue: "from-blue-600/40 via-blue-500/15 to-transparent",
  cyan: "from-cyan-500/40 via-cyan-400/15 to-transparent",
};

// Card dự án: thumbnail = khối gradient + icon (thay ảnh thật sau này nếu có),
// hover: viền tím + icon phóng nhẹ + hiện mũi tên góc phải
function ProjectCard({ project }) {
  const Icon = PROJECT_ICONS[project.icon] ?? FolderGit2;
  const gradient = THEME_GRADIENTS[project.theme] ?? THEME_GRADIENTS.blue;

  return (
    <article className="glass group h-full overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1.5 hover:border-purple-500/50 hover:shadow-glow-purple">
      {/* Thumbnail giả lập bằng gradient + icon */}
      <div
        className={`relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-br ${gradient}`}
      >
        {/* Lưới mờ trang trí */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)," +
              "linear-gradient(90deg, rgba(255,255,255,0.14) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <Icon
          className="h-14 w-14 text-white/80 transition-transform duration-300 group-hover:scale-110"
          aria-hidden="true"
        />
        {/* Mũi tên hiện khi hover */}
        <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/30 opacity-0 backdrop-blur transition-all duration-300 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4 text-white" aria-hidden="true" />
        </span>
      </div>

      {/* Nội dung */}
      <div className="space-y-3 p-6">
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-300"
            >
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-lg font-bold text-white transition-colors group-hover:text-cyan-300">
          {project.title}
        </h3>
        <p className="text-sm leading-relaxed text-gray-400">
          {project.description}
        </p>
      </div>
    </article>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="relative overflow-hidden py-24 lg:py-32">
      {/* Glow góc trái — đổi nhịp với Services (grid) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-1/4 h-[26rem] w-[26rem] rounded-full bg-blue-600/10 blur-3xl"
      />

      <Container className="relative space-y-14">
        <Reveal>
          <SectionTitle
            badge="Dự án tiêu biểu"
            icon={FolderGit2}
            title="FEATURED"
            highlight="PROJECTS"
            description="Một vài sản phẩm chúng tôi đã thiết kế và triển khai — từ mini app, phần mềm quản trị đến trợ lý AI."
          />
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <Reveal key={project.id} delay={(index % 3) * 0.1} className="h-full">
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
