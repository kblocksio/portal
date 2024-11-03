import { PropsWithChildren } from "react";

export const PropertyKey = ({ children }: PropsWithChildren) => (
  <div className="text-muted-foreground flex items-center whitespace-nowrap text-sm font-medium">
    {children}
  </div>
);

export const PropertyValue = ({ children }: PropsWithChildren) => {
  const isLink = typeof children === "string" && /<a\s/i.test(children);

  return (
    <div className="truncate">
      {isLink && <span dangerouslySetInnerHTML={{ __html: children }} />}
      {!isLink && <span className="truncate">{children}</span>}
    </div>
  );
};
