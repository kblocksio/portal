import { createFileRoute } from "@tanstack/react-router";
import { MarkdownWrapper } from "@/components/markdown";
import { useAppContext, useBreadcrumbs } from "@/app-context";
import { trpc } from "@/trpc";
import { useMemo } from "react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { selectedOrganization } = useAppContext();

  // TODO: this is a temporary solution to display the readme of the first organization
  const readme = useMemo(() => {
    if (!selectedOrganization) return "";
    return selectedOrganization.readme;
  }, [selectedOrganization]);

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
      {readme && <MarkdownWrapper content={readme} />}
    </div>
  );
}
