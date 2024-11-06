import { PropsWithChildren } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
          <DialogTitle>Open API Spec</DialogTitle>
          {children}
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={(e: any) => {
              e.preventDefault();
              onClose();
            }}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
