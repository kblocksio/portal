import { useFetch } from "~/hooks/use-fetch";
import { ApiGroup } from "@repo/shared";
import { Card } from "~/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { useEffect, useMemo } from "react";

export interface ProjectGroupProps {
  apiGroup: ApiGroup;
  searchQuery?: string;
}
export const ProjectGroup = ({ apiGroup, searchQuery }: ProjectGroupProps) => {
  const { data, loading } = useFetch<{ items: any }>(`/api/resources`, {
    params: {
      group: apiGroup.group,
      version: apiGroup.version,
      plural: apiGroup.plural,
    },
  });
  const filteredData = useMemo(() => {
    if (!data) return null;
    if (!searchQuery) return data.items;
    return data.items.filter((item: any) =>
      item.metadata.name.includes(searchQuery),
    );
  }, [data, searchQuery]);

  return !loading && (!filteredData || filteredData?.length === 0) ? null : (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4">{apiGroup.plural}</h2>
      <div className="space-y-4">
        {loading && !filteredData && (
          <Card className="flex justify-between items-center p-4">
            <Skeleton className="h-6 w-32" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-8 w-20 rounded-md" />{" "}
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </Card>
        )}
        {!loading &&
          filteredData &&
          filteredData.length > 0 &&
          filteredData.map((item: any, index: number) => (
            <Card key={index} className="flex justify-between items-center p-4">
              <div>
                <h3 className="font-bold">{item.metadata.name}</h3>
                <p className="text-muted-foreground">
                  some description here...
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-muted-foreground text-sm">
                  <p>Last deployed by @ainvoner 2h ago</p>
                  <p className="flex items-center">
                    <CalendarIcon className="mr-1 h-4 w-4" /> Joined December
                    2021
                  </p>
                </div>
                <Button variant="outline">Action button</Button>
                <Badge variant="default" className="bg-green-500 text-white">
                  OK
                </Badge>
              </div>
            </Card>
          ))}
      </div>
    </section>
  );
};
