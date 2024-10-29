import { ApiObject, StatusReason } from "@kblocks/api";

export const chooseColor = (key: string, palette: string[]): string => {
  const index =
    key.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    palette.length;
  return palette[index];
};

export const getResourceReadyCondition = (obj?: ApiObject) => {
  return obj?.status?.conditions?.find((c) => c.type === "Ready");
};

export const getResourceStatusReason = (obj?: ApiObject) => {
  const readyCondition = getResourceReadyCondition(obj);
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
