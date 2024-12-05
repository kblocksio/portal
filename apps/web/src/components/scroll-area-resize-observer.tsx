import { memo, useEffect, useRef } from "react";

export const ScrollAreaResizeObserver = memo(function ScrollAreaResizeObserver({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <div className="relative w-full" ref={containerRef}>
      <div className="absolute inset-0 overflow-hidden">
        <div ref={contentRef}>{children}</div>
      </div>
    </div>
  );
});
