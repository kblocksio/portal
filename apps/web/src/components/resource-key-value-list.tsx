import React, {
  PropsWithChildren,
  useState,
  useContext,
  useCallback,
} from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ClipboardCheckIcon, ClipboardIcon } from "lucide-react";
import { cn, getResourceOutputs } from "@/lib/utils";
import { getObjectURIFromRef } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { splitAndCapitalizeCamelCase } from "./resource-form/label-formater";
import JsonView from "@uiw/react-json-view";
import linkifyHtml from "linkify-html";
import { ResourceContext } from "@/resource-context";
import { getResourceIconColors } from "@/lib/hero-icon";
import { Link } from "./ui/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

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

type KeyValueListProps = {
  data: Record<string, any>;
  resourceObjUri: string;
};

export const KeyValueList: React.FC<KeyValueListProps> = ({
  data,
  resourceObjUri,
}) => {
  const { objects, resourceTypes } = useContext(ResourceContext);
  const renderValue = useCallback(
    (value: any) => {
      if (typeof value === "string") {
        //handle ref:// spacial case
        if (value.includes("ref://")) {
          const referendedObjUri = getObjectURIFromRef(value, resourceObjUri);
          const propKey = value.replace("}", "").split("/").pop();
          const referencedObject = objects[referendedObjUri];
          if (referencedObject && propKey) {
            const referencedPropValue =
              getResourceOutputs(referencedObject)?.[propKey];
            if (referencedPropValue) {
              const selectedResourceType =
                resourceTypes[referencedObject.objType];
              const Icon = selectedResourceType?.iconComponent;

              return (
                <div className="grid grid-cols-[1fr_auto] items-center space-x-2 truncate">
                  <div className="text-muted-foreground truncate italic">
                    {renderValue(referencedPropValue)}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {Icon && (
                        <Icon
                          className={`h-5 w-5 ${getResourceIconColors({
                            color: referencedObject.color,
                          })}`}
                        />
                      )}
                    </div>
                    <Link
                      to={
                        `/resources/${referendedObjUri.replace(
                          "kblocks://",
                          "",
                        )}` as any
                      }
                      onMouseEnter={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="underline"
                    >
                      <div className="text-md flex items-center gap-2">
                        {referencedObject.metadata.name}
                      </div>
                    </Link>
                  </div>
                </div>
              );
            }
          }
        }

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
    [objects, resourceTypes],
  );

  const renderKey = (key: string, value: any) => {
    const isRef = typeof value === "string" && value.includes("ref://");
    return (
      <div className="flex items-center gap-2">
        {splitAndCapitalizeCamelCase(key)}
        {isRef && (
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger>
                <Badge variant="default" className="h-4 text-xs">
                  ref
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="truncate p-2">{value}</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  return Object.entries(data).map(([key, value]) => (
    <React.Fragment key={key}>
      <PropertyKey>{renderKey(key, value)}</PropertyKey>
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
