import { getIconComponent, getResourceIconColors } from "~/lib/hero-icon";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { ResourceType } from "@repo/shared";

export interface ResourceTypesCardsProps {
  filtereResources: ResourceType[];
  handleResourceSelect: (resource: any) => void;
  isLoading: boolean;
}
export const ResourceTypesCards = ({ filtereResources, handleResourceSelect, isLoading }: ResourceTypesCardsProps) => {
  return isLoading ?
    Array.from({ length: 3 }).map((_, index) => (
      <ResourceCardSkeleton key={index} />
    )) : (
      filtereResources.map((resource, index) => {
        const Icon = getIconComponent({ icon: resource.icon });
        const iconColor = getResourceIconColors({
          color: resource?.color,
        });
        return (
          <Card
            key={index}
            className="hover:bg-accent cursor-pointer max-h-[240px] flex flex-col justify-center"
            onClick={() => handleResourceSelect(resource)}
          >
            <CardHeader className="flex flex-row h-[75px] text-center border-b border-b-gray-200 items-center align-middle">
              <div className="w-full flex self-center items-center">
                <Icon className={`${iconColor} h-8 w-8`} />
              </div>
            </CardHeader>
            <CardContent className="flex p-4 flex-start flex-col min-h-[165px]">
              <CardTitle className="mb-2">{resource.kind}</CardTitle>
              <CardDescription>
                {resource.description}
              </CardDescription>
            </CardContent>
          </Card>
        );
      })
    );
};

const ResourceCardSkeleton = () => (
  <Card className="max-h-[160px] flex flex-col justify-center cursor-pointer">
    <CardHeader className="flex flex-row h-[50px] text-center border-b border-b-gray-200 items-center align-middle">
      <div className="w-full flex self-center items-center justify-center">
        <Skeleton className="h-7 w-7" />
      </div>
    </CardHeader>
    <CardContent className="flex p-2 flex-col h-[110px]">
      <CardTitle className="mb-2">
        <Skeleton className="w-1/2 h-6" />
      </CardTitle>
      <CardDescription>
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-3/4 h-4 mt-2" />
      </CardDescription>
    </CardContent>
  </Card>
);
