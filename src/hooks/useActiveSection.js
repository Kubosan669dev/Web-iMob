import { useEffect, useState } from "react";

// useActiveSection: scroll-spy bằng IntersectionObserver.
// Section nào đang nằm ở "dải giữa" màn hình → id của nó là active.
// `ids` phải là mảng THAM CHIẾU ỔN ĐỊNH (khai báo ngoài component)
// để effect không chạy lại mỗi render.
export default function useActiveSection(ids) {
  const [activeId, setActiveId] = useState(ids[0] ?? null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      // Thu hẹp vùng quan sát: chỉ tính phần 40%→55% chiều cao viewport,
      // nhờ đó tại 1 thời điểm chỉ có ~1 section được coi là active.
      { rootMargin: "-40% 0px -55% 0px" }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [ids]);

  return activeId;
}
