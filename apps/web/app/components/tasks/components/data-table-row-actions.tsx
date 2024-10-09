"use client"

import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { useCreateResourceWizard } from "~/CreateResourceWizardContext"
import { Resource } from "~/ResourceContext"
import { ResourceType } from "@repo/shared"

interface DataTableRowActionsProps {
  resource: Resource;
  resourceType: ResourceType;
}

export function DataTableRowActions({
  resource,
  resourceType,
}: DataTableRowActionsProps) {
  const { openWizard: openEditWizard } = useCreateResourceWizard();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          openEditWizard({ resource, resourceType });
        }}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
