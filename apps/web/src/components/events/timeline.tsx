import {
  Activity,
  XCircle,
  CheckCircle,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Circle,
} from "lucide-react";
import {
  ErrorEvent,
  EventAction,
  EventReason,
  LifecycleEvent,
  LogEvent,
  LogLevel,
  WorkerEvent,
} from "@kblocks/api";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { MarkdownWrapper } from "../markdown";
import { Timestamp } from "../timestamp";
import { ScrollAreaResizeObserver } from "../scroll-area-resize-observer";

type GroupHeader = {
  timestamp: Date;
  reason: EventReason;
  action: string;
  message: string;
};

type EventGroup = {
  header: GroupHeader;
  events: WorkerEvent[];
  requestId: string;
};

export default function Timeline({
  events,
}: {
  events: WorkerEvent[];
  className?: string;
}) {
  const eventGroups = useMemo(() => groupEventsByRequestId(events), [events]);

  return (
    <ScrollAreaResizeObserver>
      <div className="relative w-full">
        <div className="absolute left-3 top-2 h-full w-px bg-gray-200"></div>

        <div className="flex flex-col gap-1">
          {eventGroups.map((eventGroup, index) => (
            <EventGroupItem
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
    </ScrollAreaResizeObserver>
  );
}

function EventGroupItem({
  eventGroup,
  isLast,
}: {
  eventGroup: EventGroup;
  isLast: boolean;
}) {
  const header = eventGroup.header;
  const ReasonIcon = getReasonIcon(header.reason);
  const reasonColor = getReasonColor(header.reason);
  const action = header.action;
  const [isOpen, setIsOpen] = useState(isLast);

  const isClickable = eventGroup.events.length > 0;
  const messageColor = getMessageColor(header);
  const message = formatMessage(header.message);

  return (
    <div className="relative sm:pl-6">
      <div className="absolute left-0 top-1.5">
        <div className="flex items-center justify-around pl-0.5 pt-1.5 sm:pt-0">
          <div className="flex items-center justify-center rounded-full border-gray-200 bg-white sm:size-5">
            <ReasonIcon className={reasonColor} />
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
        <div className="group-hover:bg-muted flex w-full items-center gap-x-3 rounded-md px-2 py-1">
          <div className="flex min-w-[90pt] items-center gap-1">
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
      {isOpen && eventGroup.events.length > 0 && (
        <Events events={eventGroup.events} />
      )}
    </div>
  );
}

const Events = ({ events }: { events: WorkerEvent[] }) => {
  const items: React.ReactNode[] = [];
  const logEvents: LogEvent[] = [];

  const renderLogSection = () => {
    return (
      <div className="mr-4 mt-2 space-y-1 overflow-x-auto rounded-sm bg-slate-800 p-4 font-mono shadow-md">
        {logEvents.map((event, index) => (
          <LogItem key={index} log={event} />
        ))}
      </div>
    );
  };

  events.forEach((event, index) => {
    if (
      event.type !== "LOG" &&
      event.type != "LIFECYCLE" &&
      logEvents.length > 0
    ) {
      items.push(renderLogSection());
      logEvents.length = 0;
    }

    switch (event.type) {
      case "LOG":
        logEvents.push(event);
        break;

      case "ERROR":
        items.push(<ErrorItem key={index} error={event} />);
        break;

      case "LIFECYCLE":
        logEvents.push(renderLogEvent(event));
        break;

      default:
        // ignore
        break;
    }
  });

  if (logEvents.length > 0) {
    items.push(renderLogSection());
    logEvents.length = 0;
  }

  return <div className="flex flex-col gap-2 pb-6">{items}</div>;
};

const ErrorItem = ({ error }: { error: ErrorEvent }) => {
  if (error.explanation) {
    const details = formatExplanation(error.explanation).join("\n\n");
    return (
      <div className="flex flex-col pt-4">
        <MarkdownWrapper content={details} />
        <div className="flex items-center gap-2 py-4">
          <Sparkles className="size-4 text-yellow-500" />
          <span className="text-xs italic text-gray-700">
            This content is AI-generated and may contain errors
          </span>
        </div>
      </div>
    );
  }

  return null; //<div>{error.message}</div>;
};

const LogItem = ({ log }: { log: LogEvent }) => {
  const LogLine = ({ line }: { line: string }) => {
    const timestamp = log.timestamp.toLocaleTimeString();

    const classes = [];

    const colors = {
      [LogLevel.DEBUG]: [`text-gray-200`, "text-gray-200"],
      [LogLevel.INFO]: [`text-gray-400`, "text-white"],
      [LogLevel.WARNING]: [`text-yellow-500`, "text-yellow-200"],
      [LogLevel.ERROR]: [`text-red-800`, "text-red-500"],
    };

    const index = !log.parentLogId ? 1 : 0;
    classes.push(colors[log.level][index]);

    return (
      <div className="text-xs">
        <div className="grid grid-cols-[8em_1fr]">
          <span className="text-gray-600">{timestamp}</span>
          <span className={cn("whitespace-pre pr-4", classes)}>
            <pre>{line}</pre>
          </span>
        </div>
      </div>
    );
  };

  const lines = log.message.trimEnd().split("\n");
  return lines.map((line, index) => <LogLine key={index} line={line} />);
};

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
      return Circle;
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

const renderHeader = (event: WorkerEvent): GroupHeader => {
  switch (event.type) {
    case "LIFECYCLE":
      return {
        timestamp: event.timestamp,
        reason: event.event.reason,
        action: event.event.action,
        message: event.event.message,
      };

    case "ERROR":
      return {
        timestamp: event.timestamp,
        reason: EventReason.Failed,
        action: event.body?.type ?? EventAction.Sync,
        message: event.body?.message ?? "",
      };

    case "LOG":
      return {
        timestamp: event.timestamp,
        reason: EventReason.Started,
        action: event.level.toString(),
        message: event.message,
      };

    default:
      return {
        timestamp: new Date(),
        reason: EventReason.Started,
        action: EventAction.Sync,
        message: "",
      };
  }
};

function groupEventsByRequestId(events: WorkerEvent[]) {
  const groups: EventGroup[] = [];

  let currentGroup: EventGroup = {
    requestId: "",
    header: {
      timestamp: new Date(),
      reason: EventReason.Started,
      action: EventAction.Sync,
      message: "",
    },
    events: [],
  };

  for (const event of events) {
    const currentRequestId = currentGroup.requestId;

    // new group
    if (event.requestId !== currentRequestId) {
      currentGroup = {
        requestId: event.requestId,
        header: renderHeader(event),
        events: [],
      };

      groups.push(currentGroup);
    }

    switch (event.type) {
      case "ERROR":
        currentGroup.header.reason = EventReason.Failed;
        currentGroup.header.message = event.message;
        break;

      case "LIFECYCLE":
        currentGroup.header.reason = event.event.reason;
        currentGroup.header.message = event.event.message;
        break;
    }

    currentGroup?.events.push(event);
  }

  return groups;
}

const renderLogEvent = (event: LifecycleEvent): LogEvent => {
  const level = renderLevel(event.event.reason);

  return {
    requestId: event.requestId,
    type: "LOG",
    level,
    message: event.event.message,
    objUri: event.objUri,
    objType: event.objType,
    timestamp: event.timestamp,
  };
};

const renderLevel = (reason: EventReason): LogLevel => {
  switch (reason) {
    case EventReason.Failed:
      return LogLevel.ERROR;
    default:
      return LogLevel.INFO;
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
