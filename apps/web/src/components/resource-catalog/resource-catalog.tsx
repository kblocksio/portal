import { getIconComponent, getResourceIconColors } from "@/lib/hero-icon";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { ResourceType } from "@/resource-context";
import { Category } from "@repo/shared";
import { useMemo, useState } from "react";
import { MarkdownWrapper } from "../markdown";
import { Button } from "../ui/button";
import { ResourceTypeDocsDrawer } from "./resource-type-docs-drawer";
import { ResourceTypeCard } from "./resource-card";

export interface ResourceCatalogProps {
  categories: Record<string, Category>;
  filtereResources: ResourceType[];
  handleResourceSelect: (resource: any) => void;
  isLoading: boolean;
}
export const ResourceCatalog = ({
  filtereResources,
  handleResourceSelect,
  isLoading,
  categories,
}: ResourceCatalogProps) => {
  const [docs, setDocs] = useState<string | undefined>(undefined);
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
    <div className="flex flex-col gap-12">
      {typesForCategories.map(
        ({ category, resources }) =>
          resources &&
          resources.length > 0 && (
            <ResourceTypeCategory
              key={category}
              category={categories[category]}
              resources={resources}
              handleResourceSelect={handleResourceSelect}
              handleDocsOpen={setDocs}
            />
          ),
      )}
      <ResourceTypeDocsDrawer docs={docs} onClose={() => setDocs(undefined)} />
    </div>
  );
};

const ResourceTypeCategory = ({
  category,
  resources,
  handleResourceSelect,
  handleDocsOpen,
}: {
  category: Category;
  resources: ResourceType[];
  handleResourceSelect: (resource: ResourceType) => void;
  handleDocsOpen: (docs: string | undefined) => void;
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
      <div className="flex gap-4 flex-wrap">
        {resources.map((resource) => (
          <ResourceTypeCard
            key={`${resource.kind}-${resource.group}-${resource.version}`}
            resource={resource}
            handleResourceSelect={handleResourceSelect}
            handleDocsOpen={handleDocsOpen}
          />
        ))}
      </div>
    </div>
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
