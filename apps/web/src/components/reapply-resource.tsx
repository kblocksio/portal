import { useEffect, useState } from "react";
import { reapplyResource } from "@/lib/backend";
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
import { Resource } from "@/resource-context";

interface ReapplyResourceDialogProps {
  resource: Resource;
  isOpen: boolean;
  onClose: () => void;
  onReapplyClick?: () => void;
}

export function ReapplyResourceDialog({
  resource,
  isOpen,
  onClose,
  onReapplyClick,
}: ReapplyResourceDialogProps) {
  const [isReapplying, setIsReapplying] = useState(false);
  const [reapplyError, setReapplyError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const handleReapply = async () => {
    setIsReapplying(true);
    setReapplyError(null);
    try {
      await reapplyResource(resource.objUri);
      onClose();
    } catch (error: any) {
      setReapplyError(
        error.message ?? "An error occurred while reapplying the resource",
      );
    } finally {
      setIsReapplying(false);
    }
  };

  const handleCancel = () => {
    setReapplyError(null);
    // Only close the menu if there's no error
    if (!reapplyError) {
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
            Are you sure you want to reapply{" "}
            <span className="font-mono">
              {resource.metadata.namespace && `${resource.metadata.namespace}/`}
              {resource.metadata.name}
            </span>
            ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will reapply the resource to the cluster.
          </AlertDialogDescription>
          {reapplyError && (
            <div className="mt-4 flex items-start rounded-md border border-red-200 bg-red-50 p-4">
              <AlertCircle className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
              <div className="text-sm text-red-800">
                <strong className="font-medium">Error:</strong> {reapplyError}
              </div>
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onReapplyClick?.();
              handleReapply();
            }}
            className="bg-destructive text-destructive-foreground"
            disabled={isReapplying}
          >
            {isReapplying ? <Loader2 className="h-4 w-4" /> : "Reapply"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
