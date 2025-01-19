import { parseBlockUri } from "@kblocks/api";
import {
  FilterOptions,
  Resource,
  ResourceKnownFields,
  SortingOptions,
} from ".";

export const getFieldFromResource = (
  resource: Resource,
  field: ResourceKnownFields,
): string => {
  switch (field) {
    case "name":
      return resource.metadata?.name ?? "";
    case "kind":
      return resource.kind ?? "";
    case "namespace":
      return resource.metadata?.namespace ?? "";
    case "cluster":
      const { system } = parseBlockUri(resource.objUri);
      return system;
    default:
      throw new Error(`Unknown field: ${field}`);
  }
};

export const sortResources = (
  resources: Resource[],
  sorting: SortingOptions[],
): Resource[] => {
  return resources.sort((a, b) => {
    for (const sortOption of sorting) {
      try {
        const aField = getFieldFromResource(a, sortOption.id);
        const bField = getFieldFromResource(b, sortOption.id);
        const comparison = aField.localeCompare(bField);
        if (comparison !== 0) {
          return sortOption.desc ? -comparison : comparison;
        }
      } catch (e) {
        console.error(`Error sorting resources: ${e}`);
      }
    }
    return 0;
  });
};

export function filterResources(
  resources: Resource[],
  filters: FilterOptions,
): Resource[] {
  return resources.filter((resource) => {
    const { system } = parseBlockUri(resource.objUri);

    // Text search across multiple fields
    if (filters.text) {
      const searchText = filters.text.toLowerCase();
      const searchableText = [
        resource.metadata?.name,
        resource.kind,
        resource.metadata?.namespace,
        resource.type?.kind,
        resource.metadata?.annotations?.description,
        system,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(searchText)) {
        return false;
      }
    }

    // Kind filter
    if (filters.kind && resource.type?.kind !== filters.kind) {
      return false;
    }

    // Name filter
    if (
      filters.name &&
      !resource.metadata?.name
        ?.toLowerCase()
        .includes(filters.name.toLowerCase())
    ) {
      return false;
    }

    // Cluster filter
    if (filters.cluster) {
      if (system !== filters.cluster) {
        return false;
      }
    }

    // Namespace filter
    if (
      filters.namespace &&
      resource.metadata?.namespace !== filters.namespace
    ) {
      return false;
    }

    // Projects filter
    if (filters.projects?.length) {
      const resourceProjectNames = resource.projects.map(
        (p) => p.metadata?.name,
      );
      if (
        !filters.projects.some((projectName) =>
          resourceProjectNames.includes(projectName),
        )
      ) {
        return false;
      }
    }

    return true;
  });
}
