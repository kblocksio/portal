import { ChevronRightIcon } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { ResourceContext } from "@/resource-context";
import { motion, AnimatePresence } from "framer-motion";
import { WorkerEvent } from "@kblocks/api";

export const LastLogMessage = ({ objUri }: { objUri: string }) => {
  const { eventsPerObject } = useContext(ResourceContext);
  const [prevLogMessage, setPrevLogMessage] = useState<
    WorkerEvent | undefined
  >();
  const [lastLogMessageToDisplay, setLastLogMessageToDisplay] = useState<
    WorkerEvent | undefined
  >();

  useEffect(() => {
    const events = Object.values(eventsPerObject[objUri] ?? {});
    const lastEvent = events.pop();
    if (lastEvent === lastLogMessageToDisplay) {
      return;
    }
    setPrevLogMessage(lastLogMessageToDisplay);
    setLastLogMessageToDisplay(lastEvent);
  }, [eventsPerObject, objUri, lastLogMessageToDisplay]);

  const getLogMessage = (lastEvent: WorkerEvent) => {
    switch (lastEvent.type) {
      case "LOG":
        return lastEvent.message;
      case "LIFECYCLE":
        return `${lastEvent.event.action} ${lastEvent.event.message}`;
      case "ERROR":
        return lastEvent.message;
      default:
        return "Unknown event type";
    }
  };

  return (
    <div className="relative h-6 min-w-0 flex-grow overflow-hidden rounded bg-gray-100">
      <AnimatePresence>
        {lastLogMessageToDisplay && (
          <motion.div
            key={lastLogMessageToDisplay.timestamp?.toString()}
            initial={prevLogMessage ? { y: "100%", opacity: 0 } : undefined}
            animate={prevLogMessage ? { y: "0%", opacity: 1 } : undefined}
            exit={prevLogMessage ? { y: "-100%", opacity: 0 } : undefined}
            transition={prevLogMessage ? { duration: 0.5 } : undefined}
            className="absolute inset-0 flex min-w-0 items-center gap-0.5 px-1"
          >
            <span className="text-muted-foreground">
              <ChevronRightIcon className="text-muted-foreground h-3 w-3" />
            </span>
            <span
              className="text-muted-foreground min-w-0 flex-grow truncate font-mono text-xs"
              title={getLogMessage(lastLogMessageToDisplay)}
            >
              {getLogMessage(lastLogMessageToDisplay)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
