import { ApiObject, StatusReason } from "@kblocks/api";
import { Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

export const StatusBadge = ({
  obj,
  showMessage,
}: {
  obj?: ApiObject;
  showMessage?: boolean;
}) => {
  const readyCondition = obj?.status?.conditions?.find(
    (c) => c.type === "Ready",
  );
  const reason = readyCondition?.reason as StatusReason;

  const getStatusContent = (reason: StatusReason) => {
    switch (reason) {
      case StatusReason.Completed:
        return <div className="h-3 w-3 rounded-full bg-green-500" />;
      case StatusReason.ResolvingReferences:
      case StatusReason.InProgress:
        return <Loader2 className="h-3 w-3 animate-spin text-yellow-500" />;
      case StatusReason.Error:
        return <div className="h-3 w-3 rounded-full bg-red-500" />;
      default:
        console.log("unknown reason", readyCondition);
        return <div className="h-3 w-3 rounded-full bg-gray-500" />;
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
          <p>{readyCondition?.message ?? "In Progress"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    wrapper
  );
};
