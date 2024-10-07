import { useEffect, useState } from "react";
import { deleteResource } from "~/lib/backend";
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
import { Resource } from "~/ResourceContext";

interface DeleteResourceDialogProps {
  resource: Resource;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteResourceDialog({ resource, isOpen, onClose }: DeleteResourceDialogProps) {
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
      await deleteResource(resource.objUri);
      onClose();
    } catch (error: any) {
      setDeleteError(error.message ?? "An error occurred while deleting the resource");
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
    <AlertDialog open={open} onOpenChange={(open) => {
      if (!open) {
        onClose();
      }
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete <span className="font-mono">
              {resource.metadata.namespace && `${resource.metadata.namespace}/`}
              {resource.metadata.name}
            </span>?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the resource and remove its data from the cluster.
          </AlertDialogDescription>
          {deleteError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
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
              handleDelete();
            }}
            className="bg-destructive text-destructive-foreground"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4" />
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
