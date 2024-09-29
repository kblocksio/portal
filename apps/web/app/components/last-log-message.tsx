import { LogMessage } from "@repo/shared";
import { ChevronRightIcon } from "lucide-react";
import { useResources } from "~/hooks/use-resources";

export const LastLogMessage = ({ objType, objUri }: { objType: string; objUri: string }) => {
  const { resourcesLogs } = useResources();

  const log: LogMessage | undefined = resourcesLogs.get(objType)?.get(objUri)?.at(-1);
  return (
    log ?
      < div className="flex items-center justify-center space-x-1 overflow-hidden min-w-0" >
        <span className="text-muted-foreground">
          <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
        </span>
        <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
          {log?.timestamp}
        </span>
        <span className="text-sm truncate text-muted-foreground" title={log?.message}>
          {log?.message}
        </span>
      </div >
      : null
  );
};
