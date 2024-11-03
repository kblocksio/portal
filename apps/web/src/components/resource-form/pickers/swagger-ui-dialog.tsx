import { PropsWithChildren } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SwaggerUIDialogProps extends PropsWithChildren {
  isOpen: boolean;
  onClose: () => void;
}

export function SwaggerUIDialog({
  isOpen,
  onClose,
  children,
}: SwaggerUIDialogProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="flex h-[90vh] max-w-[90vh] flex-col justify-between overflow-auto">
        <DialogHeader>
          <DialogTitle>
            Open API Spec
          </DialogTitle>
          {children}
        </DialogHeader>
        <DialogFooter>
          <DialogClose
            onClick={(e: any) => {
              e.preventDefault();
              onClose();
            }}
          >
            {"Close"}
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
