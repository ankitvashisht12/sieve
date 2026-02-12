"use client";

import { ReviewItem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { useReviewStore } from "@/stores/reviewStore";

interface ItemRowProps {
  item: ReviewItem;
  isSelected: boolean;
  style?: React.CSSProperties;
}

export function ItemRow({ item, isSelected, style }: ItemRowProps) {
  const select = useReviewStore((s) => s.select);

  const statusColor =
    item.status === "accepted"
      ? "bg-[#4ade80]"
      : item.status === "rejected"
        ? "bg-[#f87171]"
        : "bg-[#5a5a5a]";

  return (
    <div
      style={style}
      className={`flex cursor-pointer items-start gap-2 border-l-2 px-3 py-2 transition-colors ${
        isSelected
          ? "border-l-[#22d3ee] bg-[#13271e]"
          : "border-l-transparent hover:bg-[#0f1f18]"
      }`}
      onClick={() => select(item.index)}
    >
      {/* Status dot */}
      <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${statusColor}`} />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-xs leading-relaxed text-[#e0e0e0]">
          {item.query}
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          {item.classification.category && (
            <Badge
              variant="secondary"
              className="h-4 bg-[#1a3328] px-1 text-[9px] text-[#8a8a8a]"
            >
              {item.classification.category}
            </Badge>
          )}
          {item.citations.length > 0 && (
            <span className="text-[9px] text-[#5a5a5a]">
              {item.citations.length} cite{item.citations.length !== 1 ? "s" : ""}
            </span>
          )}
          {item.classification.language &&
            item.classification.language !== "en" && (
              <span className="text-[9px] text-[#5a5a5a]">
                {item.classification.language}
              </span>
            )}
          {(item.citations_modified || item.query_modified) && (
            <span className="text-[9px] text-[#f59e0b]" title="Edited">
              &#9998;
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
