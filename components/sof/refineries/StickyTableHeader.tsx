"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface RefineriesColumn {
  key: string;
  label: string;
  width: number;
  num?: boolean;
  sortable?: boolean;
  /** Marks the column that's pinned to the left in the body (Token). */
  stickyLeft?: boolean;
}

interface Props {
  columns: RefineriesColumn[];
  sort: string;
  onSort: (key: string) => void;
  /** Ref to the .sof-table-scroll div — we mirror its scrollLeft
   *  onto the header's inner transform so columns stay aligned. */
  bodyRef: RefObject<HTMLDivElement | null>;
}

/**
 * Page-level sticky header for the refineries table. Sits as a
 * SIBLING of the scroll wrapper (not inside it), so `position:
 * sticky; top: 0` pins to the viewport — matching the search/filter
 * bar.
 *
 * The Token column header is rendered outside the transform region
 * (just like the body's Token column is sticky-left). The remaining
 * columns live inside a clipped region whose inner div transforms
 * left in sync with the body's scrollLeft.
 */
export function StickyTableHeader({ columns, sort, onSort, bodyRef }: Props) {
  const innerRef = useRef<HTMLDivElement>(null);

  const { stickyCol, scrollCols } = useMemo(() => {
    return {
      stickyCol: columns.find((c) => c.stickyLeft) ?? null,
      scrollCols: columns.filter((c) => !c.stickyLeft),
    };
  }, [columns]);

  useEffect(() => {
    const body = bodyRef.current;
    const inner = innerRef.current;
    if (!body || !inner) return;
    inner.style.transform = `translateX(${-body.scrollLeft}px)`;
    function onScroll() {
      if (!inner || !body) return;
      inner.style.transform = `translateX(${-body.scrollLeft}px)`;
    }
    body.addEventListener("scroll", onScroll, { passive: true });
    return () => body.removeEventListener("scroll", onScroll);
  }, [bodyRef]);

  return (
    <div className="sof-sticky-thead">
      {stickyCol && (
        <Cell
          column={stickyCol}
          sort={sort}
          onSort={onSort}
        />
      )}
      <div className="sof-sticky-thead-clip">
        <div ref={innerRef} className="sof-sticky-thead-inner">
          {scrollCols.map((c) => (
            <Cell key={c.key} column={c} sort={sort} onSort={onSort} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Cell({
  column: c,
  sort,
  onSort,
}: {
  column: RefineriesColumn;
  sort: string;
  onSort: (key: string) => void;
}) {
  const handleSort = c.sortable ? () => onSort(c.key) : undefined;
  return (
    <div
      className={cn(
        "sof-sticky-thead-cell",
        c.num && "num",
        c.sortable && "sortable",
        c.stickyLeft && "sof-col-token",
      )}
      style={{ width: c.width, minWidth: c.width }}
      onClick={handleSort}
      role={c.sortable ? "button" : undefined}
      tabIndex={c.sortable ? 0 : undefined}
      onKeyDown={
        c.sortable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSort(c.key);
              }
            }
          : undefined
      }
    >
      {c.label}
      {c.sortable && sort === c.key && (
        <ArrowDown
          size={11}
          strokeWidth={2.4}
          className="arr"
          style={{ marginLeft: 6, verticalAlign: "middle" }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
