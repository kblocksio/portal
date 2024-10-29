import { ApiObject, parseBlockUri, StatusReason } from "@kblocks/api";
import { ObjectMetadata } from "@repo/shared";

export const chooseColor = (key: string, palette: string[]): string => {
  const index =
    key.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    palette.length;
  return palette[index];
};

export const getResourceReadyCondition = (
  obj?: ApiObject,
  type: string = "Ready",
) => {
  return obj?.status?.conditions?.find((c) => c.type === type);
};

export const getResourceStatusReason = (
  obj?: ApiObject,
  type: string = "Ready",
) => {
  const readyCondition = getResourceReadyCondition(obj, type);
  return readyCondition?.reason as StatusReason;
};

export type ResourcesStatusCount = {
  failed: number;
  inProgress: number;
  completed: number;
};

export const getResourcesStatuses = (
  resources: ApiObject[],
): ResourcesStatusCount => {
  return resources.reduce(
    (acc, resource) => {
      const reason = getResourceStatusReason(resource);
      if (reason === StatusReason.Error) {
        acc.failed++;
      } else if (reason === StatusReason.InProgress) {
        acc.inProgress++;
      } else {
        acc.completed++;
      }
      return acc;
    },
    { failed: 0, inProgress: 0, completed: 0 },
  );
};

export const renderInitialMeta = (objUri?: string): Partial<ObjectMetadata> => {
  if (!objUri) {
    return {};
  }

  const uri = parseBlockUri(objUri);
  return {
    system: uri.system,
    namespace: uri.namespace,
    name: uri.name,
  };
};
