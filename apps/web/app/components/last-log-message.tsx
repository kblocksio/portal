import { format } from "date-fns";
import { ChevronRightIcon } from "lucide-react";
import { useContext } from "react";
import { ResourceContext } from "~/ResourceContext";

export const LastLogMessage = ({ objUri }: { objUri: string }) => {
  const { logs } = useContext(ResourceContext);

  const events = logs.get(objUri) ?? {};
  const last = Object.keys(events).pop();
  const log = last ? events[last] : undefined;
  return (
    log ?
      < div className="flex items-center justify-center space-x-1 overflow-hidden min-w-0" >
        <span className="text-muted-foreground">
          <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
        </span>
        <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
          {format(new Date(log?.timestamp), 'yyyy-MM-dd HH:mm:ss')}
        </span>
        <span className="text-sm truncate text-muted-foreground font-mono" title={log?.message}>
          {log?.message}
        </span>
      </div >
      : null
  );
};
