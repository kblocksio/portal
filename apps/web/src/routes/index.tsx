import { createFileRoute } from "@tanstack/react-router";
import platformMd from "../mock-data/acme.platform.md?raw";
import { MarkdownWrapper } from "@/components/markdown";
import { useBreadcrumbs } from "@/app-context";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  useBreadcrumbs(() => {
    return [{ name: "Home", url: "/" }];
  }, []);

  return (
    <div className="container mx-auto flex flex-col gap-4">
      <div className="fixed inset-0 -z-10">
        <img
          src="/images/wallpaper.webp"
          alt="wallpaper"
          className="h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 h-[1500px] bg-gradient-to-b from-white to-transparent" />
      </div>
      <MarkdownWrapper content={platformMd} />
    </div>
  );
}
