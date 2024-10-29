import { getIconComponent, getResourceIconColors } from "~/lib/hero-icon";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { ResourceType } from "~/resource-context";
import { Category } from "@repo/shared";
import { useMemo } from "react";
import { MarkdownWrapper } from "./markdown";
import { Button } from "./ui/button";

export interface ResourceTypesCatalogProps {
  categories: Record<string, Category>;
  filtereResources: ResourceType[];
  handleResourceSelect: (resource: any) => void;
  isLoading: boolean;
}
export const ResourceTypesCatalog = ({
  filtereResources,
  handleResourceSelect,
  isLoading,
  categories,
}: ResourceTypesCatalogProps) => {
  const typesForCategories = useMemo(() => {
    return Object.keys(categories).map((category) => ({
      category,
      resources: filtereResources.filter((resource) =>
        resource.categories?.includes(category),
      ),
    }));
  }, [filtereResources, categories]);

  return isLoading ? (
    Array.from({ length: 3 }).map((_, index) => (
      <ResourceCardSkeleton key={index} />
    ))
  ) : (
    <div className="flex flex-col gap-10">
      {typesForCategories.map(
        ({ category, resources }) =>
          resources &&
          resources.length > 0 && (
            <ResourceTypeCategory
              key={category}
              category={categories[category]}
              resources={resources}
              handleResourceSelect={handleResourceSelect}
            />
          ),
      )}
    </div>
  );
};

const ResourceTypeCategory = ({
  category,
  resources,
  handleResourceSelect,
}: {
  category: Category;
  resources: ResourceType[];
  handleResourceSelect: (resource: ResourceType) => void;
}) => {
  const Icon = getIconComponent({ icon: category.icon ?? "CircleDotIcon" });
  const iconColor = getResourceIconColors({ color: category?.color });

  return (
    <div className="border-input flex flex-col border-b p-4 pb-12">
      <div className="flex flex-col gap-y-4">
        <div className="flex w-full items-center gap-x-2 self-center">
          <Icon className={`${iconColor} h-8 w-8`} />
          <h3 className="text-xl font-semibold">{category.title}</h3>
        </div>
        <p className="text-muted-foreground text-sm">
          <MarkdownWrapper
            content={category.description}
            componentsOverrides={{
              p: ({ ...props }) => <p className="mb-4" {...props} />,
            }}
          />
        </p>
      </div>
      <div className="flex flex-col gap-y-4">
        {resources.map((resource) => (
          <ResourceTypeCard
            key={`${resource.kind}-${resource.group}-${resource.version}`}
            resource={resource}
            handleResourceSelect={handleResourceSelect}
          />
        ))}
      </div>
    </div>
  );
};

const ResourceTypeCard = ({
  resource,
  handleResourceSelect,
}: {
  resource: ResourceType;
  handleResourceSelect: (resource: ResourceType) => void;
}) => {
  const Icon = resource.iconComponent;
  const iconColor = getResourceIconColors({ color: resource?.color });
  return (
    <Card
      key={`${resource.kind}-${resource.group}-${resource.version}`}
      className="hover:bg-accent flex w-full cursor-pointer justify-between rounded-sm border-none p-0 shadow-none"
      // onClick={() => handleResourceSelect(resource)}
      tabIndex={0}
      // onKeyDown={(e) => {
      //   if (e.key === " ") {
      //     e.preventDefault();
      //     e.stopPropagation();
      //     handleResourceSelect(resource);
      //   }
      // }}
    >
      <CardContent className="flex w-full items-center justify-between gap-x-4 p-2">
        <div className="flex items-center gap-x-4">
          <Icon className={`${iconColor} h-6 w-6`} />
          <CardTitle>{resource.kind}</CardTitle>
          <CardDescription className="line-clamp-2 overflow-hidden text-ellipsis">
            {resource.description}
          </CardDescription>
        </div>
        <div className="flex gap-x-2">
          <Button
            className="text-sky-500 hover:text-sky-600 hover:underline"
            variant="ghost"
          >
            Docs
          </Button>
          <Button
            variant="outline"
            onClick={() => handleResourceSelect(resource)}
          >
            New
          </Button>
        </div>
      </CardContent>
    </Card>
  );
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
