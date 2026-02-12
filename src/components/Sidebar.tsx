"use client";

import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useReviewStore } from "@/stores/reviewStore";
import { FilterBar } from "./FilterBar";
import { ItemRow } from "./ItemRow";

export function Sidebar() {
  const { items, filteredIndices, selectedIndex, stats } = useReviewStore();
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: filteredIndices.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 10,
  });

  return (
    <div className="flex h-full flex-col border-r border-[#2a2a2a] bg-[#0d1a14]">
      <FilterBar />

      {/* Virtualized list */}
      <div ref={parentRef} className="flex-1 overflow-auto">
        {filteredIndices.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-xs text-[#5a5a5a]">
            No items match filters
          </div>
        ) : (
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const itemIndex = filteredIndices[virtualItem.index];
              const item = items[itemIndex];
              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <ItemRow
                    item={item}
                    isSelected={selectedIndex === itemIndex}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-[#2a2a2a] px-3 py-2 text-[10px] text-[#5a5a5a]">
        {filteredIndices.length} of {stats.total} items
      </div>
    </div>
  );
}
