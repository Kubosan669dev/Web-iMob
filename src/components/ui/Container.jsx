// Container: giới hạn bề rộng nội dung + padding ngang responsive.
// Mọi section đều bọc nội dung trong Container để lề thẳng hàng toàn site.
export default function Container({ className = "", children }) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
