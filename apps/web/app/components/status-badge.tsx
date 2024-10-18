import { Resource } from "~/ResourceContext";
import { cn, getReadyCondition } from "~/lib/utils.js";

export function StatusBadge({
  obj,
  className,
}: {
  obj: Resource;
  className?: string;
}) {
  const readyCondition = getReadyCondition(obj);
  const color = readyCondition
    ? readyCondition.status === "True"
      ? "green"
      : readyCondition.message === "In Progress"
        ? "yellow"
        : "red"
    : "yellow";

  return (
    <div
      className={cn(
        "ml-1.5",
        "inline-block rounded-full",
        "h-3 w-3",
        `bg-${color}-500`,
        className,
        "transition-transform duration-200 hover:scale-125",
      )}
    />
  );
}
