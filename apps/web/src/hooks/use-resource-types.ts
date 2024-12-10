import { getIconComponent } from "@/lib/get-icon";
import { trpc } from "@/trpc";
import type { ResourceType } from "@kblocks-portal/server";
import type { ComponentType } from "react";

export type ExtendedResourceType = Omit<ResourceType, "systems"> & {
  iconComponent: ComponentType;
  systems: Set<string>;
};

export const useResourceTypes = () => {
  return trpc.listTypes.useQuery(undefined, {
    initialData: {},
    select(data): Record<string, ExtendedResourceType> {
      return Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
          key,
          {
            ...value,
            systems: new Set(value.systems),
            iconComponent: getIconComponent({
              icon: value.icon,
            }),
          },
        ]),
      );
    },
  });
};
