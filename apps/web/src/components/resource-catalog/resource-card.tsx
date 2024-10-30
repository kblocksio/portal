import { getResourceIconColors } from "@/lib/hero-icon";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ResourceType } from "@/resource-context";
import {
  CircleIcon,
  StarIcon,
} from "@radix-ui/react-icons"
import { MarkdownWrapper } from "../markdown";
import { Tooltip, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

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
    <Card className="w-[300px] flex flex-col rounded-md hover:bg-accent shadow-sm cursor-pointer">
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
      <CardFooter className="mt-auto">
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

  // return (
  //   <Card
  //     key={`${resource.kind}-${resource.group}-${resource.version}`}
  //     className="hover:bg-accent flex cursor-pointer justify-between shadow-sm p-2 w-[400px] overflow-hidden"
  //     tabIndex={0}
  //   >
  //     <CardContent className="flex items-center justify-between gap-x-4 p-2">
  //       <div className="flex items-center gap-x-4">
  //         <Icon className={`${iconColor} h-6 w-6`} />
  //         <CardTitle>{resource.kind}</CardTitle>
  //         <CardDescription className="line-clamp-1 overflow-hidden text-ellipsis">
  //           {resource.description}
  //         </CardDescription>
  //       </div>
  //       <div className="flex gap-x-2">
  //         <Button
  //           className="text-sky-500 hover:text-sky-600 hover:underline"
  //           variant="ghost"
  //           onClick={() => handleDocsOpen(resource.readme)}
  //         >
  //           Docs
  //         </Button>
  //         <Button
  //           variant="outline"
  //           onClick={() => handleResourceSelect(resource)}
  //         >
  //           New
  //         </Button>
  //       </div>
  //     </CardContent>
  //   </Card>
};


export const EngineLabel = ({ engine }: { engine: string }) => {
  return (
    <div className="flex items-center">
      <CircleIcon className="mr-1 h-3 w-3 fill-sky-400 text-sky-400" />
      {engine}
    </div>
  );
}