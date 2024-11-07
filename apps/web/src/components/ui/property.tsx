import { splitAndCapitalizeCamelCase } from "@/lib/utils";
import { PropsWithChildren } from "react";

export const PropertyKey = ({ children }: PropsWithChildren) => (
  <div className="text-muted-foreground flex items-center whitespace-nowrap text-sm">
    {renderKey(String(children))}
  </div>
);

export const PropertyValue = ({ children }: PropsWithChildren) => {
  const isLink = typeof children === "string" && /<a\s/i.test(children);

  return (
    <div className="flex items-center">
      {isLink && <span dangerouslySetInnerHTML={{ __html: children }} />}
      {!isLink && <span className="truncate">{children}</span>}
    </div>
  );
};

const renderKey = (key: string) => {
  return (
    <div className="flex items-center gap-2">
      {splitAndCapitalizeCamelCase(key)}
    </div>
  );
};
