import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { DeleteResourceDialog } from "./delete-resource";
import { Resource, ResourceType } from "~/ResourceContext";
import { useCreateResourceWizard } from "~/CreateResourceWizardContext";

export const ResourceActionsMenu = ({
  resource,
  resourceType,
}: {
  resource: Resource;
  resourceType: ResourceType;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { openWizard: openEditWizard } = useCreateResourceWizard();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

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
            openEditWizard({ resource, resourceType });
            closeMenu();
          }}
        >
          Edit
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
          onClose={() => {
            setIsDeleteOpen(false);
            closeMenu();
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
