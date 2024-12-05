import {
  ArrowDownIcon,
  ArrowUpIcon,
  CaretSortIcon,
} from "@radix-ui/react-icons";
import { Column } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { memo, useMemo } from "react";
import { splitAndCapitalizeCamelCase } from "@/lib/utils";

export interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  capitalize?: boolean;
}

function DataTableColumnHeaderBase<TData, TValue>({
  column,
  title,
  className,
  capitalize = true,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const capitalizedTitle = useMemo(() => {
    return capitalize ? splitAndCapitalizeCamelCase(title) : title;
  }, [title, capitalize]);

  return (
    <div className={cn("flex items-center space-x-2 pl-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "data-[state=open]:bg-accent -ml-3 h-8",
              !column.getCanSort() && "pointer-events-none",
            )}
          >
            <span className="truncate">{capitalizedTitle}</span>
            {column.getCanSort() && (
              <span className="ml-1">
                {column.getIsSorted() === "desc" ? (
                  <ArrowDownIcon className="h-4 w-4" />
                ) : column.getIsSorted() === "asc" ? (
                  <ArrowUpIcon className="h-4 w-4" />
                ) : (
                  <CaretSortIcon className="h-4 w-4" />
                )}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        {column.getCanSort() && (
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <ArrowUpIcon className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
              Sort ascending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <ArrowDownIcon className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
              Sort descending
            </DropdownMenuItem>
            {/* <DropdownMenuSeparator /> */}
            {/* <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <EyeNoneIcon className="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
            Hide
          </DropdownMenuItem> */}
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  );
}

export const DataTableColumnHeader = memo(
  DataTableColumnHeaderBase,
) as typeof DataTableColumnHeaderBase;
