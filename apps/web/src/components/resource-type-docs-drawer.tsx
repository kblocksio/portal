import { MarkdownWrapper } from "./markdown";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import {
  Sheet,
  SheetContent,
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
        <ScrollArea className="mt-[-8px] h-full pb-6 pl-6 pr-6 pt-0">
          <MarkdownWrapper content={docs ?? ""} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
