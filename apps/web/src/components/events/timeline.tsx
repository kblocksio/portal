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
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { MarkdownWrapper } from "../markdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

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
  const eventGroups = useMemo(() => groupEventsByLifecycle(events), [events]);

  return (
    <div className="relative w-full overflow-x-hidden">
      <div className="absolute left-3.5 h-full w-px bg-gray-200"></div>

      {eventGroups.map((eventGroup, index) => (
        <EventItem
          key={index}
          eventGroup={eventGroup}
          isLast={index === eventGroups.length - 1}
        />
      ))}

      {/* <div
        ref={(el) =>
          el && el.scrollIntoView({ behavior: "smooth", block: "end" })
        }
      /> */}
    </div>
  );
}

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const localLongDateTimeFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  fractionalSecondDigits: 3,
  hour12: true,
  timeZone: timezone,
});
const utcLongDateTimeFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  second: "2-digit",
  fractionalSecondDigits: 3,
  hour12: true,
  timeZone: "UTC",
});

export const TimestampDetails = (props: { timestamp: Date }) => {
  const localTime = useMemo(() => {
    return localLongDateTimeFormat.format(props.timestamp);
  }, [props.timestamp]);

  const utcTime = useMemo(() => {
    return utcLongDateTimeFormat.format(props.timestamp);
  }, [props.timestamp]);

  const timestamp = useMemo(() => {
    return props.timestamp.getTime();
  }, [props.timestamp]);

  return (
    <div className="grid grid-cols-[8em_1fr] gap-1 py-1 text-xs">
      <span className="text-muted-foreground">{timezone}</span>
      <span className="text-foreground">{localTime}</span>
      <span className="text-muted-foreground">UTC</span>
      <span className="text-foreground">{utcTime}</span>
      <span className="text-muted-foreground">Timestamp</span>
      <span className="text-foreground">{timestamp}</span>
    </div>
  );
};

const shortDateTimeFormat = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  fractionalSecondDigits: 2,
  hour12: false,
});

export const Timestamp = (props: { timestamp: Date }) => {
  const timestamp = useMemo(() => {
    return shortDateTimeFormat.format(props.timestamp);
  }, [props.timestamp]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <span className="text-foreground rounded-sm px-1 py-0.5 font-mono text-xs uppercase hover:bg-gray-100">
            {timestamp}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <TimestampDetails timestamp={props.timestamp} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

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
        <div className="flex flex-wrap items-center gap-3">
          <Timestamp timestamp={header.timestamp} />
          <span className="text-muted-foreground font-mono text-xs uppercase">
            {action}
          </span>
          <span className={messageColor}>
            <pre className="font-sans">{message}</pre>
          </span>
        </div>

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
          <MarkdownWrapper content={header.details} />
        </div>
      )}

      {isOpen && eventGroup.logs.length > 0 && (
        <div className="mb-10 space-y-1 overflow-x-auto rounded-sm bg-slate-800 p-4 font-mono shadow-md">
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
