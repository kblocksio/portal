import { ChevronRightIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  useObjectEvents,
  type WorkerEventTimestampString,
} from "@/resource-context";
import { motion, AnimatePresence } from "framer-motion";

const useLatestEvent = (objUri: string) => {
  const [latestEvent, setLatestEvent] = useState<WorkerEventTimestampString>();
  useObjectEvents(
    objUri,
    useCallback((events) => {
      setLatestEvent(events[events.length - 1]);
    }, []),
  );
  return latestEvent;
};

const formatEventMessage = (event: WorkerEventTimestampString) => {
  switch (event.type) {
    case "LOG":
      return event.message;
    case "LIFECYCLE":
      return `${event.event.action} ${event.event.message}`;
    case "ERROR":
      return event.message;
    default:
      return "Unknown event type";
  }
};

export const LastLogMessage = ({ objUri }: { objUri: string }) => {
  const latestEvent = useLatestEvent(objUri);

  const [skip, setSkip] = useState(true);
  useEffect(() => {
    if (latestEvent) {
      setSkip(false);
    }
  }, [latestEvent]);

  return (
    <div className="relative h-6 min-w-0 flex-grow overflow-hidden rounded bg-gray-100">
      <AnimatePresence>
        {latestEvent && (
          <motion.div
            key={latestEvent.timestamp.toString()}
            initial={skip ? { opacity: 0 } : { y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex min-w-0 items-center gap-0.5 px-1"
          >
            <span className="text-muted-foreground">
              <ChevronRightIcon className="text-muted-foreground h-3 w-3" />
            </span>
            <span
              className="text-muted-foreground min-w-0 flex-grow truncate font-mono text-xs"
              title={formatEventMessage(latestEvent)}
            >
              {formatEventMessage(latestEvent)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
