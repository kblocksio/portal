import { format } from "date-fns/format";
import { ChevronRightIcon } from "lucide-react";
import { useContext } from "react";
import { ResourceContext } from "~/ResourceContext";
import { motion, AnimatePresence } from "framer-motion";

export const LastLogMessage = ({ objUri }: { objUri: string }) => {
  const { eventsPerObject } = useContext(ResourceContext);
  const events = Object.values(eventsPerObject[objUri] ?? {});
  const last = events.pop();

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

  return (
    <div className="relative h-6 min-w-0 flex-grow overflow-hidden">
      <AnimatePresence>
        {last && (
          <motion.div
            key={last.timestamp.toString()}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center space-x-1 min-w-0 gap-2"
          >
            <span className="text-muted-foreground">
              <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
              {format(new Date(last.timestamp), "yyyy-MM-dd HH:mm:ss")}
            </span>
            <span
              className="text-sm truncate text-muted-foreground font-mono flex-grow min-w-0"
              title={message}
            >
              {message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
