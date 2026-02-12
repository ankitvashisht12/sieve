"use client";

import { Badge } from "@/components/ui/badge";
import { ReviewItem } from "@/lib/types";

interface MetadataBadgesProps {
  classification: ReviewItem["classification"];
}

export function MetadataBadges({ classification }: MetadataBadgesProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {classification.language && (
        <Badge variant="secondary" className="bg-[#1a3328] text-[10px] text-[#8a8a8a]">
          {classification.language}
        </Badge>
      )}
      {classification.tone && (
        <Badge variant="secondary" className="bg-[#1a3328] text-[10px] text-[#8a8a8a]">
          {classification.tone}
        </Badge>
      )}
      {classification.style && (
        <Badge variant="secondary" className="bg-[#1a3328] text-[10px] text-[#8a8a8a]">
          {classification.style}
        </Badge>
      )}
      {classification.has_typos && (
        <Badge variant="secondary" className="bg-[#f59e0b]/10 text-[10px] text-[#f59e0b]">
          has_typos
        </Badge>
      )}
    </div>
  );
}
