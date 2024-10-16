import { getResourceIconColors } from "~/lib/hero-icon";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { ResourceType } from "~/ResourceContext";

export interface ResourceTypesCardsProps {
  filtereResources: ResourceType[];
  handleResourceSelect: (resource: any) => void;
  isLoading: boolean;
}
export const ResourceTypesCards = ({
  filtereResources,
  handleResourceSelect,
  isLoading,
}: ResourceTypesCardsProps) => {
  return isLoading
    ? Array.from({ length: 3 }).map((_, index) => (
        <ResourceCardSkeleton key={index} />
      ))
    : filtereResources.map((resource, index) => {
        const Icon = resource.iconComponent;
        const iconColor = getResourceIconColors({
          color: resource?.color,
        });
        return (
          <Card
            key={index}
            className="hover:bg-accent flex max-h-[240px] cursor-pointer flex-col justify-center"
            onClick={() => handleResourceSelect(resource)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                handleResourceSelect(resource);
              }
            }}
          >
            <CardHeader className="flex h-[75px] flex-row items-center border-b border-b-gray-200 text-center align-middle">
              <div className="flex w-full items-center self-center">
                <Icon className={`${iconColor} h-8 w-8`} />
              </div>
            </CardHeader>
            <CardContent className="flex-start flex min-h-[165px] flex-col p-4">
              <CardTitle className="mb-2">{resource.kind}</CardTitle>
              <CardDescription>{resource.description}</CardDescription>
            </CardContent>
          </Card>
        );
      });
};

const ResourceCardSkeleton = () => (
  <Card className="flex max-h-[160px] cursor-pointer flex-col justify-center">
    <CardHeader className="flex h-[50px] flex-row items-center border-b border-b-gray-200 text-center align-middle">
      <div className="flex w-full items-center justify-center self-center">
        <Skeleton className="h-7 w-7" />
      </div>
    </CardHeader>
    <CardContent className="flex h-[110px] flex-col p-2">
      <CardTitle className="mb-2">
        <Skeleton className="h-6 w-1/2" />
      </CardTitle>
      <CardDescription>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-3/4" />
      </CardDescription>
    </CardContent>
  </Card>
);
