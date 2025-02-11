import {
  XCircle,
  CheckCircle,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Circle,
  Loader2,
} from "lucide-react";
import {
  ErrorEvent,
  EventAction,
  EventReason,
  LifecycleEvent,
  LogEvent,
  LogLevel,
} from "@kblocks/api";
import { useState, useMemo, useEffect, useCallback, Fragment } from "react";
import { cn } from "@/lib/utils";
import { MarkdownWrapper } from "../markdown";
import { Timestamp } from "../timestamp";
import { Button } from "../ui/button";
import { AiErrorGuide } from "./ai-error-guide";
import type { WorkerEventTimestampString } from "@/resource-context";

type GroupHeader = {
  timestamp: Date;
  reason: EventReason;
  action: string;
  message: string;
};

type EventGroup = {
  header: GroupHeader;
  events: WorkerEventTimestampString[];
  requestId: string;
};

const EVENT_GROUPS_SIZE = 10;

const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  month: "long",
  day: "numeric",
  year: "numeric",
});

function formatDate(date: Date) {
  const today = new Date();
  const formattedDate = dateTimeFormat.format(date);
  const isToday = today.toDateString() === date.toDateString();
  return isToday ? `Today - ${formattedDate}` : `${formattedDate}`;
}

const TimeGroupHeader = (props: { timestamp: Date }) => {
  const text = useMemo(() => formatDate(props.timestamp), [props.timestamp]);
  return <p className="text-muted-foreground text-xs uppercase">{text}</p>;
};

export default function Timeline({
  events,
}: {
  events: WorkerEventTimestampString[];
  className?: string;
}) {
  // const [eventGroupIndex, setEventGroupIndex] = useState<number>();
  // const eventGroups = useMemo(() => groupEventsByRequestId(events), [events]);
  // useEffect(() => {
  //   if (eventGroupIndex === undefined && eventGroups.length > 0) {
  //     setEventGroupIndex(Math.max(0, eventGroups.length - EVENT_GROUPS_SIZE));
  //   }
  // }, [eventGroupIndex, eventGroups]);

  // const canLoadPreviousLogs = useMemo(
  //   () => eventGroupIndex !== undefined && eventGroupIndex > 0,
  //   [eventGroupIndex],
  // );

  // const loadPreviousLogs = useCallback(() => {
  //   setEventGroupIndex((eventGroupIndex) => {
  //     if (eventGroupIndex === undefined) {
  //       return undefined;
  //     }

  //     return Math.max(0, eventGroupIndex - EVENT_GROUPS_SIZE);
  //   });
  // }, []);

  // const reversedEventGroups = useMemo(
  //   () => eventGroups.slice(eventGroupIndex).reverse(),
  //   [eventGroups, eventGroupIndex],
  // );

  return (
    <pre className="text-xs">
      {events.map((event) => (
        <LOG_ITEM key={event.cursor} event={event} />
      ))}
    </pre>
  );

  // return (
  //   reversedEventGroups.length > 0 && (
  //     <div className="flex flex-col gap-1">
  //       {reversedEventGroups.map((eventGroup, index) => (
  //         <Fragment key={index}>
  //           {(index === 0 ||
  //             eventGroup.header.timestamp.getDay() !==
  //               reversedEventGroups[index - 1].header.timestamp.getDay()) && (
  //             <div className={cn(index !== 0 && "pt-6")}>
  //               <TimeGroupHeader
  //                 key={eventGroup.header.timestamp.getDate()}
  //                 timestamp={eventGroup.header.timestamp}
  //               />
  //             </div>
  //           )}
  //           <EventGroupItem
  //             key={index}
  //             eventGroup={eventGroup}
  //             defaultOpen={index === 0}
  //           />
  //         </Fragment>
  //       ))}

  //       {canLoadPreviousLogs && (
  //         <div className="py-4">
  //           <Button onClick={loadPreviousLogs} variant="outline" size="sm">
  //             Load older entries
  //           </Button>
  //         </div>
  //       )}
  //       {!canLoadPreviousLogs && (
  //         <div className="text-muted-foreground py-4 text-sm">
  //           There are no older entries to display.
  //         </div>
  //       )}
  //     </div>
  //   )
  // );
}

function LOG_ITEM(props: { event: WorkerEventTimestampString }) {
  return <span>{JSON.stringify(props.event, undefined, 2)}</span>;
}

function EventGroupItem({
  eventGroup,
  defaultOpen,
}: {
  eventGroup: EventGroup;
  defaultOpen: boolean;
}) {
  const header = eventGroup.header;
  const reasonIcon = getReasonIcon(header.reason);

  const action = header.action;
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const isClickable = eventGroup.events.length > 0;
  const messageColor = getMessageColor(header);
  const message = formatMessage(header.message);

  const showRawEvents =
    new URLSearchParams(window.location.search).get("raw") === "1";

  return (
    <div className="flex flex-col">
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
          <div className="flex items-center gap-1">
            <ChevronRight
              className={cn(
                "h-4 w-4 transition-transform duration-300",
                isOpen ? "rotate-90" : "rotate-0",
                isClickable ? "visible" : "invisible",
              )}
            />

            {reasonIcon}

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
              <pre className="truncate font-sans" title={message}>
                {message}
              </pre>
            </span>
          </div>
        </div>
      </div>
      {isOpen && eventGroup.events.length > 0 && (
        <>
          {showRawEvents && <RawEvents events={eventGroup.events} />}
          <Events events={eventGroup.events} />
        </>
      )}
    </div>
  );
}

const RawEvents = ({ events }: { events: WorkerEventTimestampString[] }) => {
  return (
    <div className="mr-4 flex flex-col gap-1 overflow-x-auto rounded-sm bg-gray-100 p-2 font-mono text-xs shadow-md">
      {events.map((e, index) => (
        <pre key={index}>{JSON.stringify(sortedKeys(e))}</pre>
      ))}
    </div>
  );
};

function sortedKeys(obj: any) {
  return Object.keys(obj)
    .sort()
    .reduce((acc: any, key: string) => {
      acc[key] = obj[key];
      return acc;
    }, {});
}

const LogSection = ({ events }: { events: LogEvent[] }) => {
  return (
    <div className="mr-4 mt-2 space-y-1 overflow-x-auto rounded-sm bg-slate-800 p-4 font-mono shadow-md">
      {events.map((event, index) => (
        <LogItem key={event.logId ?? index} log={event} />
      ))}
    </div>
  );
};

const Events = ({ events }: { events: WorkerEventTimestampString[] }) => {
  const items: React.ReactNode[] = [];
  let logEvents: LogEvent[] = [];

  events.forEach((event) => {
    if (
      event.type !== "LOG" &&
      event.type != "LIFECYCLE" &&
      logEvents.length > 0
    ) {
      items.push(<LogSection key={items.length} events={logEvents} />);
      logEvents = [];
    }

    const timestamp = new Date(event.timestamp);

    switch (event.type) {
      case "LOG":
        logEvents.push({
          ...event,
          timestamp,
        });
        break;

      case "ERROR":
        items.push(
          <ErrorItem
            key={items.length}
            error={{
              ...event,
              timestamp,
            }}
          />,
        );
        break;

      case "LIFECYCLE":
        logEvents.push(
          renderLogEvent({
            ...event,
            timestamp,
          }),
        );
        break;

      default:
        // ignore
        break;
    }
  });

  if (logEvents.length > 0) {
    items.push(<LogSection key={items.length} events={logEvents} />);
    logEvents = [];
  }

  return <div className="flex flex-col gap-2 pb-6">{items}</div>;
};

const Explanation = ({ explanation }: { explanation: any }) => {
  const details = useMemo(
    () => formatExplanation(explanation).join("\n\n"),
    [explanation],
  );
  return (
    <div className="w-full p-8">
      <AiErrorGuide>
        <MarkdownWrapper content={details} />
        <div className="flex items-center gap-2 py-4">
          <Sparkles className="size-4 text-yellow-500" />
          <span className="text-muted-foreground text-xs italic">
            This content is AI-generated and may contain errors.
          </span>
        </div>
      </AiErrorGuide>
    </div>
  );
};

const ErrorItem = ({ error }: { error: ErrorEvent }) => {
  const logEvent: LogEvent = {
    requestId: error.requestId,
    type: "LOG",
    level: LogLevel.ERROR,
    message: error.message,
    timestamp: error.timestamp,
    objUri: error.objUri,
    objType: error.objType,
  };

  return (
    <div>
      <LogSection events={[logEvent]} />
      {error.explanation && <Explanation explanation={error.explanation} />}
    </div>
  );
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
  const reasonColor = getReasonColor(reason);

  switch (reason) {
    case EventReason.Started:
      return <Loader2 className={cn(reasonColor, "size-4 animate-spin")} />;
    case EventReason.Succeeded:
      return <CheckCircle className={cn(reasonColor, "size-4")} />;
    case EventReason.Failed:
      return <XCircle className={cn(reasonColor, "size-4")} />;
    case EventReason.Resolving:
      return <RefreshCw className={cn(reasonColor, "size-4")} />;
    case EventReason.Resolved:
      return <CheckCircle className={cn(reasonColor, "size-4")} />;
    default:
      return <Circle className={cn(reasonColor, "size-4")} />;
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

const renderHeader = (
  event: WorkerEventTimestampString,
): Partial<GroupHeader> => {
  switch (event.type) {
    case "LIFECYCLE":
      return {
        timestamp: new Date(event.timestamp),
        reason: event.event.reason,
        action: event.event.action,
        message: event.event.message,
      };

    case "ERROR":
      return {
        timestamp: new Date(event.timestamp),
        reason: EventReason.Failed,
        message: event.body?.message ?? "",
      };

    case "LOG":
      return {
        timestamp: new Date(event.timestamp),
        message: event.message,
      };

    default:
      return {};
  }
};

function groupEventsByRequestId(events: WorkerEventTimestampString[]) {
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
        header: {
          ...currentGroup.header,
          ...renderHeader(event),
        },
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
