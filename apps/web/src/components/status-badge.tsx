import { ApiObject, StatusReason } from "@kblocks/api";
import { Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "~/lib/utils";

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
  obj?: ApiObject;
  showMessage?: boolean;

  /**
   * @default "Ready"
   */
  type?: string;
}

export const StatusBadge = ({ obj, showMessage, size, type = "Ready" }: StatusBadgeProps) => {
  const readyCondition = obj?.status?.conditions?.find(
    (c) => c.type === type,
  );
  const reason = readyCondition?.reason as StatusReason;

  const getStatusContent = (reason: StatusReason) => {
    switch (reason) {
      case StatusReason.Completed:
        return (
          <div className={cn(variants({ size }), "rounded-full bg-green-500")}/>
        );
      case StatusReason.ResolvingReferences:
      case StatusReason.InProgress:
        return (
          <Loader2
            className={cn(variants({ size }), "animate-spin text-yellow-500")}
          />
        );
      case StatusReason.Error:
        return (
          <div className={cn(variants({ size }), "rounded-full bg-red-500")} />
        );
      default:

        if (readyCondition?.status === "True") {
          return <div className={cn(variants({ size }), "rounded-full bg-green-500")}/>
        } else {
          return <div className={cn(variants({ size }), "rounded-full bg-red-500")} />
        }

    }
  };

  const statusContent = getStatusContent(reason);

  const wrapper = (
    <div className="ml-1 inline-block transition-transform duration-200 hover:scale-125">
      {statusContent}
    </div>
  );

  return readyCondition?.message ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          {wrapper}
          {showMessage && (
            <span className="ml-2">{readyCondition?.message}</span>
          )}
        </TooltipTrigger>
        <TooltipContent>
          <p>{readyCondition?.reason ?? `${type}?`}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    wrapper
  );
};
