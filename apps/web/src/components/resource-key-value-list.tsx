import React, { useContext, useCallback } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { LinkIcon } from "lucide-react";
import { getResourceOutputs, parseRef } from "@/lib/utils";
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
import { PropertyKey, PropertyValue } from "./ui/property";
import { CopyToClipboardButton } from "./copy-to-clipboard";
import { Checkbox } from "./ui/checkbox";

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
                  <div className="text-foreground flex gap-1 truncate italic">
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
          <div className="inline-flex w-full">
            <CopyToClipboardButton text={value}>
              {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
              <span
                className="min-w-0 truncate"
                onClick={(event) => {
                  // If target is a link, prevent the click event from bubbling up
                  if ((event.target as HTMLElement).tagName === "A") {
                    event.stopPropagation();
                  }
                }}
                dangerouslySetInnerHTML={{
                  __html: linkifyHtml(value, {
                    className: "text-blue-500 hover:underline",
                    target: "_blank noreferrer",
                  }),
                }}
              />
            </CopyToClipboardButton>
          </div>
        );
      }

      if (typeof value === "boolean") {
        return (
          <div className="flex items-center gap-2">
            <Checkbox checked={value} className="cursor-default" />
            {value ? "Enabled" : "Disabled"}
          </div>
        );
      }

      if (
        Array.isArray(value) ||
        (typeof value === "object" && value !== null)
      ) {
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-full">
                View
              </Button>
            </PopoverTrigger>
            <PopoverContent side="right" className="ml-2">
              <JsonView value={value} className="max-h-[80vh] overflow-auto" />
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

  return Object.entries(data).map(([key, value]) => (
    <React.Fragment key={key}>
      <PropertyKey>{key}</PropertyKey>
      <PropertyValue>{renderValue(value)}</PropertyValue>
    </React.Fragment>
  ));
};
