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
      <MarkdownWrapper content={platformMd} />
    </div>
  );
}
