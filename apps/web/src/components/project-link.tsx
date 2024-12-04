import { ResourceIcon } from "@/lib/get-icon";
import { Button } from "./ui/button";
import { useNavigate } from "@tanstack/react-router";
import type { TrpcProject } from "@kblocks-portal/server";

export const ProjectLink = ({ project }: { project: TrpcProject }) => {
  const navigate = useNavigate();
  return (
    <Button
      variant="link"
      className="h-2"
      onClick={(e) => {
        navigate({
          to: "/projects/$name",
          params: { name: project.name },
        });
        e.stopPropagation();
      }}
    >
      <div className="flex items-center gap-2 p-0">
        <ResourceIcon
          icon={project.icon ?? "heroicon://folder"}
          className="h-4 w-4"
        />
        {project.title ?? project.name}
      </div>
    </Button>
  );
};
