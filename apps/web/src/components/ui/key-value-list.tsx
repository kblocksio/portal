import React, {
  useState,
} from "react";
import { ClipboardCheckIcon, ClipboardIcon } from "lucide-react";
import linkifyHtml from "linkify-html";
import JsonView from "@uiw/react-json-view";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { PropertyKey, PropertyValue } from "@/components/ui/property";
import { splitAndCapitalizeCamelCase, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type KeyValueListProps = {
  data: Record<string, any>;
};

export const KeyValueList: React.FC<KeyValueListProps> = ({ data }) => {
  function renderValue(value: any) {
    if (typeof value === "string") {
      return (
        <div className="group flex items-center space-x-2 truncate">
          <span
            className="truncate"
            dangerouslySetInnerHTML={{
              __html: linkifyHtml(value, {
                className: "text-blue-500 hover:underline",
                target: "_blank noreferrer",
              }),
            }}
          />
          <CopyToClipboard
            className="opacity-0 group-hover:opacity-100"
            text={value}
          />
        </div>
      );
    }

    if (typeof value === "boolean") {
      return <Badge>{value.toString()}</Badge>;
    }

    if (Array.isArray(value) || (typeof value === "object" && value !== null)) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="h-0">
              View
            </Button>
          </PopoverTrigger>
          <PopoverContent side="right" className="ml-2">
            <JsonView value={value} />
          </PopoverContent>
        </Popover>
      );
    }

    if (typeof value === "undefined" || value === null) {
      return "(n/a)";
    }

    return value;
  }

  return Object.entries(data).map(([key, value]) => (
    <React.Fragment key={key}>
      <PropertyKey>{splitAndCapitalizeCamelCase(key)}</PropertyKey>
      <PropertyValue>{renderValue(value)}</PropertyValue>
    </React.Fragment>
  ));
};

const CopyToClipboard = ({
  text,
  className,
}: {
  text: string;
  className?: string;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    navigator.clipboard.writeText(text);
    setTimeout(() => setCopied(false), 2000); // reset after 2 seconds
  };

  return (
    <Button
      variant="ghost"
      onClick={handleCopy}
      className={cn(className, "h-4 w-4")}
    >
      {copied ? <ClipboardCheckIcon /> : <ClipboardIcon />}
    </Button>
  );
};
