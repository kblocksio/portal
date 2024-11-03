import React, {
  PropsWithChildren,
  useState,
  useContext,
  useCallback,
} from "react";
import { Button } from "./ui/button";
import {
  Badge,
  ClipboardCheckIcon,
  ClipboardIcon,
} from "lucide-react";
import { cn, getResourceOutputs } from "@/lib/utils";
import { getObjectURIFromRef } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { splitAndCapitalizeCamelCase } from "@/lib/utils";
import JsonView from "@uiw/react-json-view";
import linkifyHtml from "linkify-html";
import { ResourceContext } from "@/resource-context";
import { getResourceIconColors } from "@/lib/hero-icon";
import { Link } from "./ui/link";

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
};

export const KeyValueList: React.FC<KeyValueListProps> = ({ data }) => {
  const { objects, resourceTypes } = useContext(ResourceContext);
  const renderValue = useCallback(
    (value: any) => {
      if (typeof value === "string") {
        //handle ref:// spacial case
        if (value.includes("ref://")) {
          const objUri = getObjectURIFromRef(value);
          const propKey = value.replace("}", "").split("/").pop();
          const referencedObject = objects[objUri];
          if (referencedObject && propKey) {
            const propValue = getResourceOutputs(referencedObject)?.[propKey];
            if (propValue) {
              const selectedResourceType =
                resourceTypes[referencedObject.objType];
              const Icon = selectedResourceType?.iconComponent;

              return (
                <div className="group flex items-center space-x-2 truncate">
                  <span className="truncate">{value}</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="h-0">
                        Show Value
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent side="top" className="ml-2 truncate">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            {Icon && (
                              <Icon
                                className={`h-6 w-6 ${getResourceIconColors({
                                  color: referencedObject.color,
                                })}`}
                              />
                            )}
                          </div>
                          <div>
                            <Link
                              to={
                                `/resources/${objUri.replace(
                                  "kblocks://",
                                  "",
                                )}` as any
                              }
                              className="text-blue-500 hover:underline"
                            >
                              <h1 className="text-md flex items-center gap-2 font-bold">
                                {referencedObject.metadata.name}
                              </h1>
                            </Link>
                            <p className="text-muted-foreground flex gap-4 text-sm leading-none">
                              {selectedResourceType?.group}/
                              {selectedResourceType?.version}.
                              {selectedResourceType?.kind}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                          <KeyValueList data={{ [propKey]: propValue }} />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
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

  return Object.entries(data).map(([key, value]) => (
    <React.Fragment key={key}>
      <PropertyKey>{splitAndCapitalizeCamelCase(key)}</PropertyKey>
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
