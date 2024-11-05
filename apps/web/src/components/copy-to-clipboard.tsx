import {
  PropsWithChildren,
  useState,
} from "react";
import { ClipboardCheckIcon, ClipboardIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const CopyToClipboardButton = ({
  text,
  className,
  children,
}: PropsWithChildren<{
  text: string;
  className?: string;
}>) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    navigator.clipboard.writeText(text);
    setTimeout(() => setCopied(false), 2000); // reset after 2 seconds
  };

  const Icon = copied ? ClipboardCheckIcon : ClipboardIcon;

  return (
    <button
      onClick={handleCopy}
      className={cn(
        className,
        "group/copy hover:bg-muted inline-flex items-center gap-1 truncate rounded-md px-1 py-0.5 text-left",
      )}
    >
      {children}
      <Icon className="-mr-1 ml-2 size-4 shrink-0 grow-0 sm:hidden sm:group-hover/copy:inline-block" />
      <div className="grow"></div>
    </button>
  );
};
