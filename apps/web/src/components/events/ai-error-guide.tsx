import { Bot } from "lucide-react";
import { PropsWithChildren } from "react";

export function AiErrorGuide({ children }: PropsWithChildren) {
  return (
    <div className="flex w-full max-w-3xl items-start space-x-4">
      <div className="flex-shrink-0">
        <div className="rounded-full bg-sky-500 p-3">
          <Bot className="h-8 w-8 text-white" />
        </div>
      </div>
      <div className="relative flex-grow">
        <div className="rounded-lg bg-sky-100 p-6 shadow-lg">{children}</div>
        <div className="absolute -left-2 top-6 h-4 w-4 rotate-45 transform bg-sky-100"></div>
      </div>
    </div>
  );
}
