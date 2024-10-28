import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Activity,
  XCircle,
  CheckCircle,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import {
  EventAction,
  EventReason,
  LogEvent,
  LogLevel,
  WorkerEvent,
} from "@kblocks/api";
import { useState } from "react";
import { cn } from "~/lib/utils";
import { MarkdownWrapper } from "../markdown";

type GroupHeader = {
  timestamp: Date;
  reason: EventReason;
  action: EventAction;
  message: string;
  details?: string;
};

type EventGroup = {
  header: GroupHeader;
  logs: LogEvent[];
};

export default function Timeline({
  events,
  className,
}: {
  events: WorkerEvent[];
  className?: string;
}) {
  const eventGroups = groupEventsByLifecycle(events);

  return (
    <ScrollArea
      contentClassName={cn("h-full pb-30", className)}
      className="mt-0"
    >
      <div className="absolute left-3.5 h-full w-px bg-gray-200"></div>

      {eventGroups.map((eventGroup, index) => (
        <EventItem
          key={index}
          eventGroup={eventGroup}
          isLast={index === eventGroups.length - 1}
        />
      ))}

      <div
        ref={(el) =>
          el && el.scrollIntoView({ behavior: "smooth", block: "end" })
        }
      />
    </ScrollArea>
  );
}

function EventItem({
  eventGroup,
  isLast,
}: {
  eventGroup: EventGroup;
  isLast: boolean;
}) {
  const header = eventGroup.header;
  const timestamp = header.timestamp.toLocaleString();
  const ReasonIcon = getReasonIcon(header.reason);
  const reasonColor = getReasonColor(header.reason);
  const action = getActionLabel(header.action);
  const [isOpen, setIsOpen] = useState(isLast);

  const isClickable = eventGroup.logs.length > 0 || header.details;
  const messageColor = getMessageColor(header);
  const message = formatMessage(header.message);

  return (
    <div className="relative pl-10">
      <div className="absolute left-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-gray-200 bg-white">
        <ReasonIcon className={`h-5 w-5 ${reasonColor}`} />
      </div>
      <div
        className={cn("flex gap-2 rounded-md pb-4 pl-0 pr-2 pt-0")}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setIsOpen(!isOpen);
          }
        }}
        role="button"
        tabIndex={0}
      >
        <span className="text-gray-500">{timestamp}</span>
        <span className="text-gray-500">{action}</span>
        <span className={messageColor}>
          <pre className="font-sans">{message}</pre>
        </span>

        {isClickable && (
          <ChevronRight
            className={cn(
              "mt-1 h-4 w-4 transition-transform duration-300",
              isOpen ? "rotate-90" : "rotate-0",
            )}
          />
        )}
      </div>

      {isOpen && header.details && (
        <div>
          <MarkdownWrapper content={header.details}/>
        </div>
      )}

      {isOpen && eventGroup.logs.length > 0 && (
        <div className="mb-10 mr-10 mt-0 space-y-1 rounded-sm bg-slate-800 p-4 pb-4 font-mono text-xs shadow-md">
          {eventGroup.logs.map((log, index) => (
            <LogItem key={index} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}

function LogItem({ log }: { log: LogEvent }) {
  const timestamp = log.timestamp.toLocaleTimeString();
  const message = log.message;
  return (
    <div className="text-sm">
      <div className="grid grid-cols-[110px_1fr]">
        <span className="text-gray-500">{timestamp}</span>
        <span className="text-gray-200">
          <pre className="whitespace-pre-wrap">{message}</pre>
        </span>
      </div>
    </div>
  );
}

const getReasonIcon = (reason: EventReason) => {
  switch (reason) {
    case EventReason.Started:
      return Activity;
    case EventReason.Succeeded:
      return CheckCircle;
    case EventReason.Failed:
      return XCircle;
    case EventReason.Resolving:
      return RefreshCw;
    case EventReason.Resolved:
      return CheckCircle;
    default:
      return Activity;
  }
};

const getReasonColor = (reason: EventReason) => {
  switch (reason) {
    case EventReason.Started:
      return "text-blue-500";
    case EventReason.Succeeded:
      return "text-green-500";
    case EventReason.Failed:
      return "text-red-500";
    case EventReason.Resolving:
      return "text-yellow-500";
    case EventReason.Resolved:
      return "text-green-500";
    default:
      return "text-gray-500";
  }
};

function groupEventsByLifecycle(events: WorkerEvent[]) {
  const groups: EventGroup[] = [];

  let currentGroup: EventGroup | null = null;

  for (const event of events) {
    if (event.type === "LIFECYCLE") {
      currentGroup = {
        header: {
          timestamp: event.timestamp,
          reason: event.event.reason,
          action: event.event.action,
          message: event.event.message,
        },
        logs: [],
      };

      const messageLines = event.event.message.split("\n");
      if (messageLines.length > 1) {

        currentGroup.logs.push(...messageLines.map(line => renderLogEvent(event, line)));
      }

      groups.push(currentGroup);
    } else if (event.type === "LOG") {
      if (currentGroup) {
        currentGroup.logs.push(event);
      } else {
        // ignore
      }
    } else if (event.type === "ERROR" && event.explanation && currentGroup) {
      const details = formatExplanation(event.explanation);
      currentGroup.header.details = details.join("\n\n");
    }
  }

  return groups;
}

const renderLogEvent = (event: WorkerEvent, line: string): LogEvent => {
  return {
    type: "LOG",
    level: LogLevel.ERROR,
    message: line,
    objUri: event.objUri,
    objType: event.objType,
    timestamp: event.timestamp,
  };
};


const getActionLabel = (action: EventAction) => {
  switch (action) {
    case EventAction.Create:
      return "Create";
    case EventAction.Delete:
      return "Delete";
    case EventAction.Update:
      return "Update";
    case EventAction.Sync:
      return "Sync";
    default:
      return "";
  }
};

const getMessageColor = (header: GroupHeader) => {
  if (header.reason === EventReason.Failed) {
    return "text-red-700";
  }
  return "text-gray-800";
};

const formatMessage = (message: string) => {
  const first = message.split("\n")[0];
  return first.replace("Error: Error: ", "Error: ");
};

function formatExplanation(explanation: any): string[] {
  if ("blocks" in explanation) {
    const lines = [];
    for (const block of explanation.blocks) {
      if ("text" in block) {
        lines.push(block.text.text);
      }
      // lines.push(JSON.stringify(block));
    }

    return lines;
  }

  return [JSON.stringify(explanation)];
}

