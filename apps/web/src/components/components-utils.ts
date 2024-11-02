import { ApiObject, Condition, StatusReason } from "@kblocks/api";

export const chooseColor = (key: string, palette: string[]): string => {
  const index =
    key.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    palette.length;
  return palette[index];
};

export const getResourceReadyCondition = (obj: ApiObject, type: string | undefined): Condition | undefined => {
  const conditions = obj.status?.conditions ?? [];

  // if no type is provided, merge all statuses - the logic is simple - if all statuses are True, the resource is ready
  if (!type) {
    // if we have only one condition, just return it, right?
    if (conditions.length === 1) {
      return conditions[0];
    }

    const notReady = conditions.filter(s => s.status !== "True");
    if (notReady.length > 0) {
      return {
        lastProbeTime: notReady[0].lastProbeTime,
        lastTransitionTime: notReady[0].lastTransitionTime,
        status: "False",
        reason: notReady[0].reason,
        type: notReady.map(x => x.type).join(", "),
        message: notReady.map(x => x.message).join(", "),
      };
    } else {
      return {
        status: "True",
        reason: StatusReason.Completed,
        message: "All conditions are met",
      };
    }
  }

  return conditions.find((c) => c.type === type);
};

export const getResourceStatusReason = (obj: ApiObject, type: string | undefined) => {
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
      const reason = getResourceStatusReason(resource, undefined);
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
