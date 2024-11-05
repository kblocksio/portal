import {
  Activity,
  XCircle,
  CheckCircle,
  RefreshCw,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  EventAction,
  EventReason,
  LogEvent,
  LogLevel,
  WorkerEvent,
} from "@kblocks/api";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { MarkdownWrapper } from "../markdown";
import { Timestamp } from "../timestamp";

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
}: {
  events: WorkerEvent[];
  className?: string;
}) {
  const eventGroups = useMemo(() => groupEventsByLifecycle(events), [events]);

  return (
    <div className="relative w-full overflow-x-hidden">
      <div className="absolute left-3.5 h-full w-px bg-gray-200"></div>

      <div className="flex flex-col gap-2">
        {eventGroups.map((eventGroup, index) => (
          <EventItem
            key={index}
            eventGroup={eventGroup}
            isLast={index === eventGroups.length - 1}
          />
        ))}
      </div>

      {/* <div
        ref={(el) =>
          el && el.scrollIntoView({ behavior: "smooth", block: "end" })
        }
      /> */}
    </div>
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
  const ReasonIcon = getReasonIcon(header.reason);
  const reasonColor = getReasonColor(header.reason);
  const action = getActionLabel(header.action);
  const [isOpen, setIsOpen] = useState(isLast);

  const isClickable = eventGroup.logs.length > 0 || header.details;
  const messageColor = getMessageColor(header);
  const message = formatMessage(header.message);

  return (
    <div className="relative pl-8 sm:pl-10">
      <div className="absolute left-0 top-0">
        <div className="flex items-center justify-around pl-0.5 pt-1.5 sm:pt-0">
          <div className="flex size-6 items-center justify-center rounded-full border-2 border-gray-200 bg-white sm:size-7">
            <ReasonIcon className={`size-4 sm:size-5 ${reasonColor}`} />
          </div>
        </div>
      </div>

      <div
        className={cn("group flex gap-2")}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setIsOpen(!isOpen);
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className="group-hover:bg-muted flex w-full flex-wrap items-center gap-x-3 rounded-md px-2 py-1">
          <div className="flex items-center gap-1">
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                isOpen ? "rotate-90" : "rotate-0",
                isClickable ? "visible" : "invisible",
              )}
            />

            <div className="-mx-1.5 sm:mx-0">
              <Timestamp timestamp={header.timestamp} />
            </div>
          </div>

          <span className="text-muted-foreground min-w-12 font-mono text-xs uppercase">
            {action}
          </span>

          <div className="flex items-center gap-1 truncate">
            <div className="size-4 sm:hidden"></div>
            <span className={cn(messageColor, "grow truncate sm:grow-0")}>
              <pre className="truncate font-sans">{message}</pre>
            </span>
          </div>
        </div>
      </div>
      {isOpen && eventGroup.logs.length > 0 && (
        <div className="mt-2 space-y-1 overflow-x-auto rounded-sm bg-slate-800 p-4 font-mono shadow-md">
          {eventGroup.logs.map((log, index) => (
            <LogItem key={index} log={log} />
          ))}
        </div>
      )}

      {isOpen && header.details && (
        <div className="flex flex-col pt-6">
          <MarkdownWrapper content={header.details} />
          <div className="flex items-center gap-2 py-4">
            <Sparkles className="size-4 text-yellow-500" />
            <span className="text-xs italic text-gray-700">
              This content is AI-generated and may contain errors
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function LogItem({ log }: { log: LogEvent }) {
  const timestamp = log.timestamp.toLocaleTimeString();
  const message = log.message;

  const classes = [];

  switch (log.level) {
    case LogLevel.DEBUG:
      classes.push("text-gray-500");
      break;
    case LogLevel.INFO:
      classes.push("text-gray-400");
      break;
    case LogLevel.WARNING:
      classes.push("text-yellow-500");
      break;
    case LogLevel.ERROR:
      classes.push("text-red-500");
      break;
  }

  if (!log.parentLogId) {
    classes.push("text-white");
  }

  return (
    <div className="text-xs">
      <div className="grid grid-cols-[8em_1fr]">
        <span className="text-gray-600">{timestamp}</span>
        <span className={cn("whitespace-pre pr-4", classes)}>
          <pre>{message}</pre>
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
        currentGroup.logs.push(
          ...messageLines.map((line) => renderLogEvent(event, line)),
        );
      }

      groups.push(currentGroup);
    } else if (event.type === "LOG") {
      if (currentGroup) {
        const messageLines = event.message.trimEnd().split("\n");

        // if (!event.parentLogId) {
        //   messageLines.unshift("");
        // }

        currentGroup.logs.push(
          ...messageLines.map((line) => ({
            ...event,
            message: line,
          })),
        );
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
