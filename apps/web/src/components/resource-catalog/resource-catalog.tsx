import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { ResourceType } from "@/resource-context";
import { Category } from "@repo/shared";
import { useMemo } from "react";
import { MarkdownWrapper } from "../markdown";
import { ResourceTypeCard } from "./resource-card";

export interface ResourceCatalogProps {
  categories: Record<string, Category>;
  filtereResources: ResourceType[];
  onResourceCreateClick: (resource: ResourceType) => void;
  isLoading?: boolean;
  onCardClick?: (resource: ResourceType) => void;
}
export const ResourceCatalog = ({
  filtereResources,
  onResourceCreateClick,
  categories,
  onCardClick,
  isLoading,
}: ResourceCatalogProps) => {
  const typesForCategories = useMemo(() => {
    return Object.keys(categories).map((category) => ({
      category,
      resources: filtereResources.filter((resource) =>
        resource.categories?.includes(category),
      ),
    }));
  }, [filtereResources, categories]);

  return isLoading ? (
    <div className="flex flex-wrap gap-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <ResourceCardSkeleton key={index} />
      ))}
    </div>
  ) : filtereResources.length === 0 ? (
    <div className="flex h-16 items-center justify-center">
      <p className="text-muted-foreground">
        No resource types found for your search
      </p>
    </div>
  ) : (
    <div className="flex flex-col gap-12">
      {typesForCategories.map(
        ({ category, resources }) =>
          resources &&
          resources.length > 0 && (
            <ResourceTypeCategory
              key={category}
              category={categories[category]}
              resources={resources}
              onResourceCreateClick={onResourceCreateClick}
              onCardClick={onCardClick}
            />
          ),
      )}
    </div>
  );
};

const ResourceTypeCategory = ({
  category,
  resources,
  onResourceCreateClick,
  onCardClick,
}: {
  category: Category;
  resources: ResourceType[];
  onResourceCreateClick: (resource: ResourceType) => void;
  onCardClick?: (resource: ResourceType) => void;
}) => {
  return (
    <div className="border-input flex flex-col">
      <div className="flex flex-col gap-y-2">
        <h2 className="text-lg font-semibold">{category.title}</h2>
        <div className="text-muted-foreground text-sm">
          <MarkdownWrapper
            content={category.description}
            componentsOverrides={{
              p: ({ ...props }) => <p className="mb-4" {...props} />,
            }}
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        {resources.map((resource) => (
          <ResourceTypeCard
            key={`${resource.kind}-${resource.group}-${resource.version}`}
            resource={resource}
            onResourceCreateClick={onResourceCreateClick}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </div>
  );
};

const ResourceCardSkeleton = () => (
  <Card className="flex w-[300px] flex-col rounded-md shadow-sm">
    <CardHeader className="flex flex-col gap-y-2">
      <div className="space-y-3">
        <CardTitle>
          <div className="flex items-center gap-x-2">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-1 h-3 w-12" />
          </div>
        </CardTitle>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </CardHeader>
    <CardFooter className="mt-auto flex justify-between">
      <div className="text-muted-foreground flex space-x-4 text-sm">
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-8 w-[70px]" />
    </CardFooter>
  </Card>
);
