import { ChevronRightIcon } from "lucide-react";
import { useContext, useEffect, useMemo } from "react";
import { ResourceContext } from "@/resource-context";
import { motion, AnimatePresence } from "framer-motion";

export const LastLogMessage = ({ objUri }: { objUri: string }) => {
  const { eventsPerObject } = useContext(ResourceContext);

  const events = useMemo(
    () => Object.values(eventsPerObject[objUri] ?? {}),
    [eventsPerObject, objUri],
  );

  const last = useMemo(() => events.pop(), [events]);

  let message;
  switch (last?.type) {
    case "LOG":
      message = last.message;
      break;
    case "LIFECYCLE":
      message = `${last.event.action} ${last.event.message}`;
      break;
    case "ERROR":
      message = last.message;
      break;
    default:
      message = "Unknown event type";
      break;
  }

  if (!last) {
    return null;
  }

  return (
    <div className="relative h-6 min-w-0 flex-grow overflow-hidden rounded bg-gray-100">
      <AnimatePresence>
        <motion.div
          key={last.timestamp?.toString()}
          initial={{ y: "100%", opacity: 0 }}
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
            title={message}
          >
            {message}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
