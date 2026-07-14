import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

export function Pagination({
  total,
  limit,
  offset,
  onOffsetChange,
}: {
  total: number;
  limit: number;
  offset: number;
  onOffsetChange: (offset: number) => void;
}) {
  if (total <= limit) return null;

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const rangeStart = total === 0 ? 0 : offset + 1;
  const rangeEnd = Math.min(offset + limit, total);

  return (
    <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-3">
      <p className="text-xs text-neutral-500">
        Showing <span className="font-medium text-neutral-700">{rangeStart}–{rangeEnd}</span> of{" "}
        <span className="font-medium text-neutral-700">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOffsetChange(Math.max(0, offset - limit))}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </Button>
        <span className="text-xs text-neutral-500">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onOffsetChange(offset + limit)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
