import { getIconColors } from "@/lib/get-icon";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ResourceType } from "@/resource-context";
import { MarkdownWrapper } from "../markdown";
import { EngineLabel } from "./engine-label";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

export const ResourceTypeCard = ({
  resource,
  onResourceCreateClick,
  onCardClick,
}: {
  resource: ResourceType;
  onResourceCreateClick: (resource: ResourceType) => void;
  onCardClick?: (resource: ResourceType) => void;
}) => {
  const Icon = resource.iconComponent;
  const iconColor = getIconColors({ color: resource?.color });

  return (
    <Card
      tabIndex={onCardClick ? 0 : -1}
      className={cn(
        "flex flex-col rounded-md shadow-sm sm:w-[300px]",
        onCardClick && "hover:bg-muted cursor-pointer",
      )}
      onClick={(e) => {
        console.log("clicked on card");
        if (onCardClick) {
          console.log("calling click card function");
          e.preventDefault();
          e.stopPropagation();
          onCardClick(resource);
        }
      }}
    >
      <CardHeader className="">
        <div className="space-y-3">
          <CardTitle>
            <div className="flex items-center gap-x-2">
              <Icon className={`${iconColor} h-6 w-6`} />
              {resource.kind}
              <span className="text-muted-foreground mt-1 text-xs font-normal">
                {resource.version}
              </span>
            </div>
          </CardTitle>
          <MarkdownWrapper
            content={resource.description ?? ""}
            componentsOverrides={{
              p: ({ ...props }) => (
                <p className="text-muted-foreground text-sm" {...props} />
              ),
            }}
          />
        </div>
      </CardHeader>
      <CardFooter className="mt-auto flex justify-between">
        <div
          className="text-muted-foreground flex space-x-4 text-sm"
          tabIndex={-1}
        >
          <EngineLabel engine={resource.engine} />
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onResourceCreateClick(resource);
          }}
        >
          Create
        </Button>
      </CardFooter>
    </Card>
  );
};
