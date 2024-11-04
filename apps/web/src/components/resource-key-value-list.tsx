import React, {
  PropsWithChildren,
  useState,
  useContext,
  useCallback,
} from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ClipboardCheckIcon, ClipboardIcon, LinkIcon } from "lucide-react";
import {
  cn,
  getResourceOutputs,
  parseRef,
  splitAndCapitalizeCamelCase,
} from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import JsonView from "@uiw/react-json-view";
import linkifyHtml from "linkify-html";
import { ResourceContext } from "@/resource-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { ResourceLink } from "./resource-link";

const CopyToClipboard = ({
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
    <Button
      variant="ghost"
      onClick={handleCopy}
      className={cn(
        className,
        "group/copy inline-flex w-full items-center px-2 text-left",
      )}
      size="icon"
    >
      {children}
      <Icon className="size-4 shrink-0 grow-0 sm:hidden sm:group-hover/copy:inline-block" />
      <div className="grow"></div>
    </Button>
  );
};

type KeyValueListProps = {
  data: Record<string, any>;
  resourceObjUri: string;
};

export const KeyValueList: React.FC<KeyValueListProps> = ({
  data,
  resourceObjUri,
}) => {
  const { objects } = useContext(ResourceContext);
  const renderValue = useCallback(
    (value: any) => {
      if (typeof value === "string") {
        //handle ref:// spacial case
        if (value.includes("ref://")) {
          const { objUri: refUri, attribute } = parseRef(value, resourceObjUri);
          const referencedObject = objects[refUri];
          if (referencedObject && attribute) {
            const referencedPropValue =
              getResourceOutputs(referencedObject)?.[attribute];
            if (referencedPropValue) {
              return (
                <div className="flex items-center space-x-2 truncate">
                  <div className="text-muted-foreground flex gap-2 truncate italic">
                    <TooltipProvider>
                      <Tooltip delayDuration={0}>
                        <TooltipTrigger>
                          <LinkIcon className="h-4 w-4" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <ResourceLink
                            resource={referencedObject}
                            attribute={attribute}
                          />
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {renderValue(referencedPropValue)}
                  </div>
                </div>
              );
            }
          }
        }

        return (
          <CopyToClipboard text={value}>
            <span
              className="truncate"
              dangerouslySetInnerHTML={{
                __html: linkifyHtml(value, {
                  className: "text-blue-500 hover:underline",
                  target: "_blank noreferrer",
                }),
              }}
            />
          </CopyToClipboard>
        );
      }

      if (typeof value === "boolean") {
        return <Badge>{value.toString()}</Badge>;
      }

      if (
        Array.isArray(value) ||
        (typeof value === "object" && value !== null)
      ) {
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
    },
    [objects, resourceObjUri],
  );

  const renderKey = (key: string) => {
    return (
      <div className="flex items-center gap-2">
        {splitAndCapitalizeCamelCase(key)}
      </div>
    );
  };

  return Object.entries(data).map(([key, value]) => (
    <React.Fragment key={key}>
      <PropertyKey>{renderKey(key)}</PropertyKey>
      <PropertyValue>{renderValue(value)}</PropertyValue>
    </React.Fragment>
  ));
};

export const PropertyKey = ({ children }: PropsWithChildren) => (
  <div className="text-muted-foreground flex items-center whitespace-nowrap text-sm font-medium">
    {children}
  </div>
);

export const PropertyValue = ({ children }: PropsWithChildren) => {
  const isLink = typeof children === "string" && /<a\s/i.test(children);

  return (
    <div className="truncate">
      {isLink && <span dangerouslySetInnerHTML={{ __html: children }} />}
      {!isLink && <span className="truncate">{children}</span>}
    </div>
  );
};
