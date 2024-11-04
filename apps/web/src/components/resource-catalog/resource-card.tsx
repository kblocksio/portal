import { getIconColors } from "@/lib/get-icon";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ResourceType } from "@/resource-context";
import { MarkdownWrapper } from "../markdown";
import { EngineLabel } from "./engine-label";

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
  const iconColor = getIconColors({ color: resource?.color });

  return (
    <Card
      className="hover:bg-accent flex w-[300px] cursor-pointer flex-col rounded-md shadow-sm"
      onClick={() => handleResourceSelect(resource)}
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
        <div className="text-muted-foreground flex space-x-4 text-sm">
          <EngineLabel engine={resource.engine} />
        </div>
      </CardFooter>
    </Card>
  );
};
