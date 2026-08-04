// Map tên icon (chuỗi trong data/servicePages.json) → component lucide.
// Cùng cách làm với SERVICE_ICONS trong sections/Services.jsx — JSON không
// chứa được component nên lưu dạng chuỗi, tra ở đây khi render.
import {
  Smartphone,
  Cpu,
  GraduationCap,
  Users,
  Wrench,
  Wallet,
  Bell,
  Shield,
  Palette,
  Store,
  Briefcase,
  Settings,
  Workflow,
  Monitor,
  Gauge,
  Headphones,
  Expand,
  Package,
  Utensils,
  ShoppingCart,
  Bot,
  Target,
  Brain,
  Presentation,
  Layers,
} from "lucide-react";

// Layers = icon dự phòng khi tên trong JSON gõ sai / chưa có trong map.
export const SERVICE_ICONS = {
  smartphone: Smartphone,
  cpu: Cpu,
  "graduation-cap": GraduationCap,
  users: Users,
  wrench: Wrench,
  wallet: Wallet,
  bell: Bell,
  shield: Shield,
  palette: Palette,
  store: Store,
  briefcase: Briefcase,
  settings: Settings,
  workflow: Workflow,
  monitor: Monitor,
  gauge: Gauge,
  headphones: Headphones,
  expand: Expand,
  package: Package,
  utensils: Utensils,
  "shopping-cart": ShoppingCart,
  bot: Bot,
  target: Target,
  brain: Brain,
  presentation: Presentation,
};

// Lấy component icon theo tên; không có thì trả Layers để không vỡ giao diện.
export function iconOf(name) {
  return SERVICE_ICONS[name] ?? Layers;
}
