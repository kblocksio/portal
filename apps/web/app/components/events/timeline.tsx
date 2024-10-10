import { ScrollArea } from "~/components/ui/scroll-area"
import { Activity, XCircle, CheckCircle, RefreshCw } from 'lucide-react'
import { EventAction, EventReason, LifecycleEvent, LogEvent, WorkerEvent } from "@kblocks/api"
import { DoubleArrowRightIcon } from "@radix-ui/react-icons";

type EventGroup = {
  lifecycleEvent: LifecycleEvent;
  logs: LogEvent[];
}

export default function Timeline({ events }: { events: WorkerEvent[] }) {
  const eventGroups = groupEventsByLifecycle(events);

  return (
    <ScrollArea>
      <div className="space-y-8 relative">
        <div className="absolute left-4 top-[-40px] bottom-0 w-px bg-gray-200"></div>
        {eventGroups.map((eventGroup, index) => (
          <EventItem key={index} eventGroup={eventGroup} />
        ))}
      </div>
      <div ref={(el) => {
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      }}></div>
    </ScrollArea>
  )
}


function EventItem({ eventGroup }: { eventGroup: EventGroup }) {
  const event = eventGroup.lifecycleEvent;
  const timestamp = event.timestamp.toLocaleString();
  const ReasonIcon = getReasonIcon(event.event.reason);
  const reasonColor = getReasonColor(event.event.reason);
  const action = getActionLabel(event.event.action);

  return (
    <div className="relative pl-12">
      <div className="absolute left-0 top-1.5 w-9 h-9 rounded-full bg-white border-4 border-gray-200 flex items-center justify-center">
        <ReasonIcon className={`w-5 h-5 ${reasonColor}`} />
      </div>
      <div className="pt-3 mb-4 flex gap-2">
        <span>{timestamp}</span>
        <span className="font-bold">{ action }</span>
        <DoubleArrowRightIcon className="w-3 h-3 mt-2" />
        <span className="font-bold">  { event.event.message }</span>
      </div>
      {eventGroup.logs.length > 0 && (
        <div className="bg-black text-xs font-mono rounded-sm p-4 space-y-1 mr-10 shadow-md">
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
  const message = log.message.trimStart();
  return (
    <div className="text-sm">
      <div className="grid grid-cols-[100px_1fr]">
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
}

const getReasonColor = (reason: EventReason) => {
  switch (reason) {
    case EventReason.Started:
      return 'text-blue-500';
    case EventReason.Succeeded:
      return 'text-green-500';
    case EventReason.Failed:
      return 'text-red-500';
    case EventReason.Resolving:
      return 'text-yellow-500';
    case EventReason.Resolved:
      return 'text-green-500';
    default:
      return 'text-gray-500';
  }
}
  
function groupEventsByLifecycle(events: WorkerEvent[]) {
  const groups: EventGroup[] = [];

  let currentGroup: EventGroup | null = null;

  for (const event of events) {
    if (event.type === 'LIFECYCLE') {
      currentGroup = {
        lifecycleEvent: event,
        logs: [],
      };
      groups.push(currentGroup);
    } else if (event.type === 'LOG') {
      if (currentGroup) {
        currentGroup.logs.push(event);
      } else {
        console.error('No current group found for log event');
      }
    }
  }

  return groups;
}

const getActionLabel = (action: EventAction) => {
  switch (action) {
    case EventAction.Create:
      return 'Create';
    case EventAction.Delete:
      return 'Delete';
    case EventAction.Update:
      return 'Update';
    case EventAction.Sync:
      return 'Sync';
    default:
      return '';
  }
}
