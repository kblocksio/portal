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
import { useCreateResource } from "@/create-resource-context";

export const ResourceActionsMenu = ({
  resource,
  resourceType,
  onDeleteClick,
}: {
  resource: Resource;
  resourceType: ResourceType;
  onDeleteClick?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { handleCreateOrEdit: openEditWizard } = useCreateResource();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isReapplyOpen, setIsReapplyOpen] = useState(false);
  const [isReadOpen, setIsReadOpen] = useState(false);

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
            openEditWizard(resource, resourceType);
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
