"use client";

import { Citation } from "@/lib/types";
import { getCitationColor } from "@/lib/colors";
import { Button } from "@/components/ui/button";
import { useReviewStore } from "@/stores/reviewStore";
import { CollapsibleSection } from "./CollapsibleSection";

interface CitationCardProps {
  citation: Citation;
  citationIndex: number;
  itemIndex: number;
}

export function CitationCard({
  citation,
  citationIndex,
  itemIndex,
}: CitationCardProps) {
  const { activeCitationIndex, setActiveCitationIndex, setActiveDocId, removeCitation } =
    useReviewStore();
  const color = getCitationColor(citationIndex);
  const isActive = activeCitationIndex === citationIndex;

  const handleClick = () => {
    setActiveCitationIndex(citationIndex);
    setActiveDocId(citation.doc_id);
  };

  return (
    <div
      className={`cursor-pointer rounded border-l-2 bg-[#0f1f18] p-3 transition-colors ${
        isActive ? `${color.border} bg-[#13271e]` : "border-[#2a2a2a]"
      }`}
      style={{ borderLeftColor: color.hex }}
      onClick={handleClick}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#8a8a8a]">{citation.doc_id}</span>
          <span className="text-[9px] text-[#5a5a5a]">
            [{citation.span_start}:{citation.span_end}]
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-[#5a5a5a] hover:text-[#f87171]"
          onClick={(e) => {
            e.stopPropagation();
            removeCitation(itemIndex, citationIndex);
          }}
        >
          <span className="text-xs">&times;</span>
        </Button>
      </div>
      <blockquote
        className="border-l border-[#2a2a2a] pl-2 text-[11px] leading-relaxed text-[#8a8a8a]"
        style={{ borderLeftColor: color.hex + "40" }}
      >
        {citation.citation_text.length > 200
          ? citation.citation_text.slice(0, 200) + "..."
          : citation.citation_text}
      </blockquote>
      {citation.chunks && citation.chunks.length > 0 && (
        <div className="mt-2">
          <CollapsibleSection title={`${citation.chunks.length} chunks`}>
            <div className="space-y-1">
              {citation.chunks.map((chunk, i) => (
                <p key={i} className="text-[10px] text-[#5a5a5a]">
                  {chunk.length > 100 ? chunk.slice(0, 100) + "..." : chunk}
                </p>
              ))}
            </div>
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
}
