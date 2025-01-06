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
    <div className="min-w-0 flex-1">
      {isLink && <span dangerouslySetInnerHTML={{ __html: children }} />}
      {!isLink && <div className="w-full">{children}</div>}
    </div>
  );
};

const renderKey = (key: string) => {
  return <div className="truncate">{splitAndCapitalizeCamelCase(key)}</div>;
};
