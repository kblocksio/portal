import { getIconComponent } from "@/lib/get-icon";
import { Project } from "@/resource-context";
import { Button } from "./ui/button";
import { useNavigate } from "@tanstack/react-router";

export const ProjectLink = ({ project }: { project: Project }) => {
  const navigate = useNavigate();
  const Icon = getIconComponent({ icon: project.icon ?? "heroicon://folder" });
  return (
    <Button
      variant="link"
      className="h-2"
      onClick={(e) => {
        navigate({
          to: "/projects/$name",
          params: { name: project.metadata.name },
        });
        e.stopPropagation();
      }}
    >
      <div className="flex items-center gap-2 p-0">
        <Icon className="h-4 w-4" />
        {project.title ?? project.metadata.name}
      </div>
    </Button>
  );
};
