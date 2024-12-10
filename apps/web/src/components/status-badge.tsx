import { StatusReason, type Condition } from "@kblocks/api";
import { Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { findCondition } from "./components-utils";
import { memo } from "react";

const variants = cva("", {
  variants: {
    size: {
      default: "h-3 w-3",
      sm: "h-2 w-2",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export interface StatusBadgeProps extends VariantProps<typeof variants> {
  conditions: Condition[];
  showMessage?: boolean;

  /**
   * @default false
   */
  merge?: boolean;

  /**
   * @default - merge all statuses
   */
  type?: string;
}

export const StatusBadge = memo(function StatusBadge({
  conditions,
  showMessage,
  size,
  type,
  merge,
}: StatusBadgeProps) {
  if (merge && type) {
    throw new Error("merge and type cannot be used together");
  }

  const condition = findCondition(conditions, type);
  const reason = condition?.reason;

  const getStatusContent = (reason: string) => {
    switch (reason) {
      case StatusReason.Completed:
        return (
          <div
            className={cn(variants({ size }), "rounded-full bg-green-500")}
          />
        );
      case StatusReason.ResolvingReferences:
      case StatusReason.InProgress:
        return (
          <Loader2
            className={cn(variants({ size }), "animate-spin text-yellow-500")}
          />
        );
      case "failure":
      case StatusReason.Error:
        return (
          <div className={cn(variants({ size }), "rounded-full bg-red-500")} />
        );

      case StatusReason.Pending:
        return (
          <Loader2
            className={cn(variants({ size }), "animate-spin text-yellow-600")}
          />
        );

      default:
        if (condition?.status === "True") {
          return (
            <div
              className={cn(variants({ size }), "rounded-full bg-green-500")}
            />
          );
        } else {
          return (
            <div
              className={cn(variants({ size }), "rounded-full bg-red-500")}
            />
          );
        }
    }
  };

  const statusContent = getStatusContent(reason ?? "unknown");

  const wrapper = (
    <div className="ml-1 inline-block transition-transform duration-200 hover:scale-125">
      {statusContent}
    </div>
  );

  const message = condition?.message ?? `${type}`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="cursor-default">
          {wrapper}
          {showMessage && <span className="ml-2 text-sm">{message}</span>}
        </TooltipTrigger>
        <TooltipContent>
          <p>{showMessage ? `${type}?` : (condition?.reason ?? `${type}?`)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
