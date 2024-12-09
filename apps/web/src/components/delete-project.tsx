import { useEffect, useState } from "react";
import { deleteResource } from "@/lib/backend";
import { Loader2, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import type { Project } from "@kblocks-portal/server";
import { ResourceIcon } from "@/lib/get-icon";

interface DeleteProjectDialogProps {
  projects: Project[];
  isOpen: boolean;
  onClose: () => void;
  onDeleteClick?: () => void;
}

export function DeleteProjectDialog({
  projects,
  isOpen,
  onClose,
  onDeleteClick,
}: DeleteProjectDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await Promise.all(
        projects.map((project) => deleteResource(project.objUri)),
      );
      onClose();
    } catch (error: any) {
      setDeleteError(
        error.message ?? "An error occurred while deleting the projects",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setDeleteError(null);
    // Only close the menu if there's no error
    if (!deleteError) {
      onClose();
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete the following projects?
          </AlertDialogTitle>
          <div className="flex flex-col gap-4 text-sm">
            <ul className="space-y-1">
              {projects.map((project) => {
                return (
                  <li key={project.objUri} className="flex items-center gap-2">
                    <ResourceIcon icon={project.icon} className="size-4" />
                    <span className="text-foreground">
                      {project.metadata.namespace &&
                        `${project.metadata.namespace}/`}
                      {project.metadata.name}
                    </span>
                  </li>
                );
              })}
            </ul>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              projects and remove their data from the cluster.
            </AlertDialogDescription>
          </div>
          {deleteError && (
            <div className="mt-4 flex items-start rounded-md border border-red-200 bg-red-50 p-4">
              <AlertCircle className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
              <div className="text-sm text-red-800">
                <strong className="font-medium">Error:</strong> {deleteError}
              </div>
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onDeleteClick?.();
              handleDelete();
            }}
            className="bg-destructive text-destructive-foreground"
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="h-4 w-4" /> : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
