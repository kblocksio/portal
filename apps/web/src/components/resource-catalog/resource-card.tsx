import { getResourceIconColors } from "@/lib/hero-icon";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ResourceType } from "@/resource-context";
import {
  CircleIcon,
  StarIcon,
} from "@radix-ui/react-icons"
import { MarkdownWrapper } from "../markdown";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { EngineLabel } from "./engine-label";
import { Button } from "../ui/button";
import { BookOpen } from "lucide-react";

export const ResourceTypeCard = ({
  resource,
  handleResourceSelect,
  handleDocsOpen,
}: {
  resource: ResourceType;
  handleResourceSelect: (resource: ResourceType) => void;
  handleDocsOpen: (docs: string | undefined) => void;
}) => {
  const Icon = resource.iconComponent;
  const iconColor = getResourceIconColors({ color: resource?.color });

  return (
    <Card className="w-[300px] flex flex-col rounded-md hover:bg-accent shadow-sm cursor-pointer" onClick={() => handleResourceSelect(resource)}>
      <CardHeader className="">
        <div className="space-y-3">
          <CardTitle>
            <div className="flex items-center gap-x-2">
              <Icon className={`${iconColor} h-6 w-6`} />
              {resource.kind}
              <span className="text-muted-foreground text-xs font-normal mt-1">
                {resource.version}
              </span>
            </div>
          </CardTitle>
          <MarkdownWrapper
              content={resource.description ?? ""}
              componentsOverrides={{
                p: ({ ...props }) => <p className="text-muted-foreground text-sm" {...props} />,
              }}
            />
        </div>

      </CardHeader>
      <CardFooter className="mt-auto flex justify-between">
        <div className="flex space-x-4 text-sm text-muted-foreground">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <EngineLabel engine={resource.engine} />
              </TooltipTrigger>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
};

