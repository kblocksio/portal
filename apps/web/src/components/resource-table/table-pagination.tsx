import { memo } from "react";
import { Button } from "../ui/button";

export const TablePagination = memo(function TablePagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange?: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <Button
        variant="outline"
        onClick={() => {
          if (page > 1) {
            onPageChange?.(page - 1);
          }
        }}
        disabled={page === 1}
      >
        Previous
      </Button>
      <span className="text-muted-foreground text-sm">
        Page {page} of {pageCount}
      </span>
      <Button
        variant="outline"
        onClick={() => {
          if (page < pageCount) {
            onPageChange?.(page + 1);
          }
        }}
        disabled={page === pageCount}
      >
        Next
      </Button>
    </div>
  );
});
