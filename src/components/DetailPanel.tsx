"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReviewStore } from "@/stores/reviewStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { CitationCard } from "./CitationCard";
import { MetadataBadges } from "./MetadataBadges";
import { AddCitationButton } from "./AddCitationButton";
import { CollapsibleSection } from "./CollapsibleSection";
import { QueryRewriteDialog } from "./QueryRewriteDialog";

export function DetailPanel() {
  const {
    items,
    selectedIndex,
    acceptItem,
    rejectItem,
    resetItem,
    updateNotes,
  } = useReviewStore();

  const [notes, setNotes] = useState("");
  const [rewriteOpen, setRewriteOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const item = selectedIndex !== null ? items[selectedIndex] : null;

  useEffect(() => {
    if (item) {
      setNotes(item.reviewer_notes || "");
    }
  }, [item?.index]);

  const handleNotesChange = useCallback(
    (value: string) => {
      setNotes(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (selectedIndex !== null) {
        debounceRef.current = setTimeout(() => {
          updateNotes(selectedIndex, value);
        }, 500);
      }
    },
    [selectedIndex, updateNotes]
  );

  if (!item) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0d1a14] text-xs text-[#5a5a5a]">
        Select an item to review
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[#0d1a14]">
      <div className="flex-1 overflow-auto p-4">
        {/* Query */}
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-wider text-[#5a5a5a]">
              Query
            </span>
            <div className="flex items-center gap-1">
              {item.query_modified && (
                <span className="text-[9px] text-[#f59e0b]">modified</span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-[#5a5a5a] hover:text-[#8b5cf6]"
                onClick={() => setRewriteOpen(true)}
                title="AI Rewrite"
              >
                <span className="text-sm">&#10024;</span>
              </Button>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-[#e0e0e0]">{item.query}</p>
          {item.original_query && item.query_modified && (
            <p className="mt-1 text-[10px] text-[#5a5a5a]">
              Original: {item.original_query}
            </p>
          )}
        </div>

        <Separator className="my-3 bg-[#2a2a2a]" />

        {/* Citations */}
        <div className="mb-4">
          <span className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[#5a5a5a]">
            Citations ({item.citations.length})
          </span>
          <div className="space-y-2">
            {item.citations.map((citation, i) => (
              <CitationCard
                key={i}
                citation={citation}
                citationIndex={i}
                itemIndex={item.index}
              />
            ))}
            <AddCitationButton />
          </div>
        </div>

        <Separator className="my-3 bg-[#2a2a2a]" />

        {/* Classification */}
        <CollapsibleSection title="Classification" defaultOpen>
          <div className="space-y-2">
            <MetadataBadges classification={item.classification} />
            {item.classification.category && (
              <p className="text-[10px] text-[#5a5a5a]">
                Category: {item.classification.category}
              </p>
            )}
          </div>
        </CollapsibleSection>

        <Separator className="my-3 bg-[#2a2a2a]" />

        {/* Reviewer Notes */}
        <div>
          <span className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-[#5a5a5a]">
            Reviewer Notes
          </span>
          <Textarea
            id="sieve-notes"
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Add review notes..."
            className="min-h-[80px] resize-none border-[#2a2a2a] bg-[#0f1f18] text-xs text-[#e0e0e0] placeholder:text-[#5a5a5a]"
          />
        </div>
      </div>

      {/* Action buttons — sticky bottom */}
      <div className="flex gap-2 border-t border-[#2a2a2a] p-3">
        <Button
          onClick={() => acceptItem(item.index)}
          disabled={item.status === "accepted"}
          className="flex-1 bg-[#4ade80]/15 text-[#4ade80] hover:bg-[#4ade80]/25 disabled:opacity-30"
          size="sm"
        >
          Accept (a)
        </Button>
        <Button
          onClick={() => rejectItem(item.index)}
          disabled={item.status === "rejected"}
          className="flex-1 bg-[#f87171]/15 text-[#f87171] hover:bg-[#f87171]/25 disabled:opacity-30"
          size="sm"
        >
          Reject (r)
        </Button>
        {item.status !== "pending" && (
          <Button
            onClick={() => resetItem(item.index)}
            variant="ghost"
            size="sm"
            className="text-[#5a5a5a] hover:text-[#8a8a8a]"
          >
            Reset
          </Button>
        )}
      </div>

      <QueryRewriteDialog
        open={rewriteOpen}
        onOpenChange={setRewriteOpen}
        item={item}
      />
    </div>
  );
}
