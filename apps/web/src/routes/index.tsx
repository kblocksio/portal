import { createFileRoute } from "@tanstack/react-router";
import platformMd from "../mock-data/acme.platform.md?raw";
import { MarkdownWrapper } from "~/components/markdown";
import { MyProjects } from "~/components/my-projects";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="container flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
      {/* organization specific introduction */}
      <MarkdownWrapper content={platformMd} />
      {/* My Projects */}
      <MyProjects />
    </div>
  );
}
