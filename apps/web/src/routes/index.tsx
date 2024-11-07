import { createFileRoute } from "@tanstack/react-router";
import platformMd from "../mock-data/acme.platform.md?raw";
import { MarkdownWrapper } from "@/components/markdown";
import { useAppContext } from "@/app-context";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { setBreadcrumbs } = useAppContext();

  useEffect(() => {
    setBreadcrumbs([{ name: "Home", url: "/" }]);
  }, []);

  return (
    <div className="container mx-auto flex flex-col gap-4">
      <div className="fixed inset-0 -z-10">
        <img src="/images/wallpaper.webp" alt="wallpaper" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent h-[900px]" />
      </div>
      <MarkdownWrapper content={platformMd} />

    </div>
  );
}

