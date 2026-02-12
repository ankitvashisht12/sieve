"use client";

import { useReviewStore } from "@/stores/reviewStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DocumentSelector() {
  const { kbDocIds, activeDocId, setActiveDocId, items, selectedIndex } =
    useReviewStore();

  const currentItem = selectedIndex !== null ? items[selectedIndex] : null;
  const referencedDocIds = new Set(
    currentItem?.citations.map((c) => c.doc_id) || []
  );

  return (
    <Select value={activeDocId || ""} onValueChange={setActiveDocId}>
      <SelectTrigger className="h-7 w-48 border-[#2a2a2a] bg-[#0f1f18] text-xs text-[#e0e0e0]">
        <SelectValue placeholder="Select document" />
      </SelectTrigger>
      <SelectContent className="border-[#2a2a2a] bg-[#0d1a14]">
        {kbDocIds.map((docId) => (
          <SelectItem
            key={docId}
            value={docId}
            className={`text-xs ${
              referencedDocIds.has(docId)
                ? "text-[#4ade80]"
                : "text-[#8a8a8a]"
            }`}
          >
            {docId}
            {referencedDocIds.has(docId) && " *"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
