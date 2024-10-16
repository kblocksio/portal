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
            className="absolute inset-0 flex min-w-0 items-center gap-2 space-x-1"
          >
            <span className="text-muted-foreground">
              <ChevronRightIcon className="text-muted-foreground h-4 w-4" />
            </span>
            <span className="text-muted-foreground flex-shrink-0 whitespace-nowrap text-xs">
              {format(new Date(last.timestamp), "yyyy-MM-dd HH:mm:ss")}
            </span>
            <span
              className="text-muted-foreground min-w-0 flex-grow truncate font-mono text-sm"
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
