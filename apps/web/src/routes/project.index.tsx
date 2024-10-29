import { createFileRoute } from "@tanstack/react-router";
import { Project } from "@repo/shared";
import { useAppContext } from "@/app-context";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

const fallbackProject: Project = {
  label: "All projects",
  value: "all",
  description:
    "Below is a comprehensive list of all Kubernetes resources associated with the current account, spanning across all projects added to the application.",
};

export const Route = createFileRoute("/project/")({
  component: ProjectRoute,
});

function ProjectRoute() {
  const { setSelectedProject } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    setSelectedProject(fallbackProject);
    navigate({
      to: "/project/$project",
      params: { project: fallbackProject.value },
    });
  }, []);

  return null;
}
