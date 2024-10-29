import { MarkdownWrapper } from "./markdown";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "./ui/sheet";
import { X } from "lucide-react";

export interface ResourceTypeDocsDrawerProps {
  docs: string | undefined;
  onClose: () => void;
}
export const ResourceTypeDocsDrawer = ({
  docs,
  onClose,
}: ResourceTypeDocsDrawerProps) => {
  return (
    <Sheet open={!!docs} onOpenChange={(x) => (!x ? onClose() : null)}>
      <SheetContent className="w-5/6 xl:w-5/6">
        <SheetClose asChild className="relative z-10">
          <Button variant="ghost" size="icon" className="absolute right-6">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </SheetClose>
        <ScrollArea className="mt-[-8px] h-full pb-6 pl-6 pr-6 pt-0">
          <MarkdownWrapper content={docs ?? ""} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
