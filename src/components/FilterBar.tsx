"use client";

import { useReviewStore } from "@/stores/reviewStore";
import { Button } from "@/components/ui/button";

const STATUS_OPTIONS = [
  { value: "all" as const, label: "All" },
  { value: "pending" as const, label: "Pending" },
  { value: "accepted" as const, label: "Accepted" },
  { value: "rejected" as const, label: "Rejected" },
];

export function FilterBar() {
  const { filters, setStatusFilter } = useReviewStore();

  return (
    <div className="border-b border-[#2a2a2a] p-3">
      <div className="flex gap-1">
        {STATUS_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={filters.status === opt.value ? "default" : "ghost"}
            size="sm"
            className={`h-6 flex-1 text-[10px] ${
              filters.status === opt.value
                ? "bg-[#1a3328] text-[#e0e0e0]"
                : "text-[#5a5a5a] hover:text-[#8a8a8a]"
            }`}
            onClick={() => setStatusFilter(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
