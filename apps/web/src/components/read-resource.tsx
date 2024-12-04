import { useEffect, useState } from "react";
import { readResource } from "@/lib/backend";
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
import type { TrpcResource } from "@kblocks-portal/server";

interface ReadResourceDialogProps {
  resource: TrpcResource;
  isOpen: boolean;
  onClose: () => void;
  onReadClick?: () => void;
}

export function ReadResourceDialog({
  resource,
  isOpen,
  onClose,
  onReadClick,
}: ReadResourceDialogProps) {
  const [isReading, setIsReading] = useState(false);
  const [readError, setReadError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const handleRead = async () => {
    setIsReading(true);
    setReadError(null);
    try {
      await readResource(resource.objUri);
      onClose();
    } catch (error: any) {
      setReadError(
        error.message ?? "An error occurred while reading the resource",
      );
    } finally {
      setIsReading(false);
    }
  };

  const handleCancel = () => {
    setReadError(null);
    // Only close the menu if there's no error
    if (!readError) {
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
            Are you sure you want to send a read request for{" "}
            <span className="font-mono">
              {resource.namespace && `${resource.namespace}/`}
              {resource.name}
            </span>
            ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will send a read request to the server.
          </AlertDialogDescription>
          {readError && (
            <div className="mt-4 flex items-start rounded-md border border-red-200 bg-red-50 p-4">
              <AlertCircle className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-red-400" />
              <div className="text-sm text-red-800">
                <strong className="font-medium">Error:</strong> {readError}
              </div>
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onReadClick?.();
              handleRead();
            }}
            className="bg-destructive text-destructive-foreground"
            disabled={isReading}
          >
            {isReading ? <Loader2 className="h-4 w-4" /> : "Refresh"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
