import { LogEvent, LogLevel } from "@kblocks/cli/types";
import { format } from "date-fns/format";
import { cn } from "~/lib/utils";

type LogMessageWithId = LogEvent & { id: string, parentId?: string, children?: LogMessageWithId[] };

const parseLogs = (logs: LogMessageWithId[]) => {

  // Create a map with log entries by id
  const logMap: Record<string, LogMessageWithId> = {};
  logs.forEach(log => {
    logMap[log.id] = { ...log, children: [] } as LogMessageWithId;
  });

  const hierarchicalLogs: LogMessageWithId[] = [];

  // Link children to their parent log entries
  logs.forEach(log => {
    if (log.parentId) {
      logMap[log.parentId]?.children?.push(logMap[log.id]);
    } else {
      hierarchicalLogs.push(logMap[log.id]);
    }
  });

  return hierarchicalLogs;
};

// Function to get styles based on log level
const getLogStyles = (logLevel: LogLevel) => {
  switch (logLevel) {
    case LogLevel.ERROR:
      return 'text-red-600 font-semibold'; // Red and bold for errors
    case LogLevel.INFO:
    default:
      return 'text-gray-800'; // Default gray for info
  }
};

// Recursive component to render hierarchical logs
const LogItem = ({ log }: { log: LogMessageWithId }) => {
  return (
    <div className="space-y-2">
      <div className={cn(getLogStyles(log.level), 'p-2 bg-gray-50 rounded-md shadow-sm')}>
        <span className="text-sm text-gray-500">[{format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}] </span>
        <span className="ml-2">{log.message}</span>
      </div>
      {log.children && log.children.length > 0 && (
        <div className="pl-4 border-l border-gray-200">
          {log.children.map((childLog) => (
            <LogItem key={childLog.id} log={childLog} />
          ))}
        </div>
      )}
    </div>
  );
};

export const LogsViewer = ({ messages }: { messages: LogMessage[] }) => {

  const hierarchicalLogs = parseLogs(messages.map((log: LogMessage, index) => ({ ...log, id: index.toString(), parentId: index === 4 ? '1' : undefined })));

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg space-y-4">
      {hierarchicalLogs.map(log => (
        <LogItem key={log.id} log={log} />
      ))}
    </div>
  );

}

