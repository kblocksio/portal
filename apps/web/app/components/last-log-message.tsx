import { ChevronRightIcon } from "lucide-react";
import { useContext } from "react";
import { ResourceContext } from "~/ResourceContext";
import { motion, AnimatePresence } from "framer-motion";

export const LastLogMessage = ({ objUri }: { objUri: string }) => {
  const { logs } = useContext(ResourceContext);

  const events = logs.get(objUri) ?? {};
  const last = Object.keys(events).pop();
  const log = last ? events[last] : {
    message: "No logs",
    timestamp: new Date().toISOString(),
  };

  return (
    <div className="relative h-6 min-w-0 flex-grow overflow-hidden">
      <AnimatePresence>
        {log && (
          <motion.div
            key={log.timestamp}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center space-x-1 min-w-0"
          >
            <span className="text-muted-foreground">
              <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
            </span>
            {/* <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
              {format(new Date(log?.timestamp), "yyyy-MM-dd HH:mm:ss")}
            </span> */}
            <span
              className="text-xs truncate text-muted-foreground font-mono flex-grow min-w-0"
              title={log?.message}
            >
              {log?.message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
