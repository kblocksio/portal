import { useEffect, useRef } from "react";

export const ScrollAreaResizeObserver = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;

    if (!container || !content) return;

    const resizeObserver = new ResizeObserver(() => {
      container.style.height = `${content.scrollHeight}px`;
    });

    resizeObserver.observe(content);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div className="absolute inset-0 overflow-x-auto overflow-y-hidden">
        <div ref={contentRef}>{children}</div>
      </div>
    </div>
  );
};
