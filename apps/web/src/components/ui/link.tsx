import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from "@tanstack/react-router";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { buttonVariants } from "./button";
import { memo } from "react";

export const linkVariants = cva("", {
  variants: {
    variant: {
      default: "text-primary underline-offset-4 hover:underline",
      ghost: buttonVariants({ variant: "ghost" }),
      ghostAlignLeft: `${buttonVariants({ variant: "ghost" })} pl-0`,
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface LinkProps
  extends RouterLinkProps,
    VariantProps<typeof linkVariants> {
  onMouseEnter?: (e: React.MouseEvent) => void;
}

const Link = memo(function Link({
  variant,
  onMouseEnter,
  ...props
}: LinkProps & { className?: string }) {
  return (
    <RouterLink
      className={cn(linkVariants({ variant }))}
      onMouseEnter={onMouseEnter}
      {...props}
    />
  );
});
Link.displayName = "Link";

export { Link };
