// AnimatedGridBackground: nền "công nghệ" dùng chung cho Hero và các section.
// Gồm 3 lớp (đều pointer-events-none, không chặn tương tác):
//   1. Lưới 50px giống imob.vn — để TĨNH (rẻ hiệu năng), mờ dần từ tâm bằng mask
//   2. Glow blobs blur lớn, nhấp nháy lệch pha nhau (animate-glow-pulse)
//   3. Particles nhỏ animate-ping rải rác
// Prop `particles={false}` để tắt lớp 3 ở section cần yên tĩnh hơn.

const GRID_STYLE = {
  backgroundImage:
    "linear-gradient(rgba(59,130,246,0.4) 1px, transparent 1px)," +
    "linear-gradient(90deg, rgba(59,130,246,0.4) 1px, transparent 1px)",
  backgroundSize: "50px 50px",
  maskImage:
    "radial-gradient(ellipse 80% 70% at 50% 40%, black 40%, transparent 100%)",
  WebkitMaskImage:
    "radial-gradient(ellipse 80% 70% at 50% 40%, black 40%, transparent 100%)",
};

export default function AnimatedGridBackground({ particles = true, className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* 1. Lưới */}
      <div className="absolute inset-0 opacity-[0.13]" style={GRID_STYLE} />

      {/* 2. Glow blobs */}
      <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl animate-glow-pulse" />
      <div className="absolute -right-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-purple-600/15 blur-3xl animate-glow-pulse [animation-delay:1.5s]" />
      <div className="absolute -bottom-16 left-1/3 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl animate-glow-pulse [animation-delay:3s]" />

      {/* 3. Particles */}
      {particles && (
        <>
          <span className="absolute left-1/4 top-1/4 h-1.5 w-1.5 rounded-full bg-blue-400 opacity-60 animate-ping" />
          <span className="absolute right-1/4 top-2/3 h-1 w-1 rounded-full bg-purple-400 opacity-40 animate-ping [animation-delay:1s]" />
          <span className="absolute bottom-1/4 left-2/3 h-1.5 w-1.5 rounded-full bg-cyan-400 opacity-50 animate-ping [animation-delay:0.5s]" />
          <span className="absolute right-1/3 top-[18%] h-1 w-1 rounded-full bg-blue-300 opacity-50 animate-ping [animation-delay:2s]" />
        </>
      )}
    </div>
  );
}
