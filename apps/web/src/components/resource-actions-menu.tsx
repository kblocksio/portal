import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { DeleteResourceDialog } from "./delete-resource";
import { ReapplyResourceDialog } from "./reapply-resource";
import { ReadResourceDialog } from "./read-resource";
import { Resource, ResourceType } from "@/resource-context";
import { useNavigate } from "@tanstack/react-router";
import { ProjectsMenu } from "./projects-menu";
export const ResourceActionsMenu = ({
  resource,
  onDeleteClick,
}: {
  resource: Resource;
  resourceType: ResourceType;
  onDeleteClick?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isReapplyOpen, setIsReapplyOpen] = useState(false);
  const [isReadOpen, setIsReadOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => setIsOpen(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        className="focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <MoreVertical className="h-5 w-5 text-gray-500 hover:text-gray-700" />
      </DropdownMenuTrigger>
      <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem
          onSelect={() => {
            navigate({
              to: `/resources/edit/${resource.objUri.replace("kblocks://", "")}`,
            });
            closeMenu();
          }}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            setIsReapplyOpen(true);
          }}
        >
          Reapply
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            setIsReadOpen(true);
          }}
        >
          Refresh
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive"
          onSelect={(e) => {
            e.preventDefault();
            setIsDeleteOpen(true);
          }}
        >
          Delete...
        </DropdownMenuItem>

        <ProjectsMenu objUri={resource.objUri} />

        <DeleteResourceDialog
          resource={resource}
          isOpen={isDeleteOpen}
          onDeleteClick={() => {
            onDeleteClick?.();
          }}
          onClose={() => {
            setIsDeleteOpen(false);
            closeMenu();
          }}
        />
        <ReapplyResourceDialog
          resource={resource}
          isOpen={isReapplyOpen}
          onClose={() => {
            setIsReapplyOpen(false);
            closeMenu();
          }}
        />
        <ReadResourceDialog
          resource={resource}
          isOpen={isReadOpen}
          onClose={() => {
            setIsReadOpen(false);
            closeMenu();
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

