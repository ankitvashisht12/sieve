"use client";

import { useReviewStore } from "@/stores/reviewStore";
import { Button } from "@/components/ui/button";

export function AddCitationButton() {
  const { isSelectionMode, setSelectionMode } = useReviewStore();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setSelectionMode(!isSelectionMode)}
      className={`h-8 w-full border border-dashed text-xs ${
        isSelectionMode
          ? "border-[#22d3ee] text-[#22d3ee]"
          : "border-[#2a2a2a] text-[#5a5a5a] hover:border-[#3a3a3a] hover:text-[#8a8a8a]"
      }`}
    >
      {isSelectionMode ? "Cancel Selection" : "+ Add Citation"}
    </Button>
  );
}
