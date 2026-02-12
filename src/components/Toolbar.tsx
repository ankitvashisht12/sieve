"use client";

import { useState } from "react";
import { useReviewStore } from "@/stores/reviewStore";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { UploadModal } from "./UploadModal";
import { LoadDataModal } from "./LoadDataModal";
import * as api from "@/lib/api";

export function Toolbar() {
  const { stats } = useReviewStore();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [loadDataOpen, setLoadDataOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const reviewed = stats.accepted + stats.rejected;
  const progressPct = stats.total > 0 ? (reviewed / stats.total) * 100 : 0;
  const acceptedPct = stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0;
  const rejectedPct = stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0;

  const handleExport = async () => {
    setExporting(true);
    try {
      await api.exportReview();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#2a2a2a] bg-[#0d1a14] px-4">
      {/* Title */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-bold tracking-wider text-[#4ade80]">SIEVE</h1>
        <span className="text-[10px] text-[#5a5a5a]">|</span>
        <span className="text-[10px] text-[#5a5a5a]">
          {reviewed}/{stats.total} reviewed
        </span>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#4ade80]">{stats.accepted} accepted</span>
          <span className="text-[10px] text-[#5a5a5a]">/</span>
          <span className="text-[10px] text-[#f87171]">{stats.rejected} rejected</span>
          <span className="text-[10px] text-[#5a5a5a]">/</span>
          <span className="text-[10px] text-[#8a8a8a]">{stats.pending} pending</span>
        </div>

        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-[#1a3328]">
          <div className="flex h-full">
            <div
              className="h-full bg-[#4ade80] transition-all"
              style={{ width: `${acceptedPct}%` }}
            />
            <div
              className="h-full bg-[#f87171] transition-all"
              style={{ width: `${rejectedPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-[#8a8a8a] hover:text-[#e0e0e0]"
              onClick={() => setLoadDataOpen(true)}
            >
              Load Data
            </Button>
          </TooltipTrigger>
          <TooltipContent className="border-[#2a2a2a] bg-[#13271e] text-[10px] text-[#e0e0e0]">
            Load different KB or output file
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-[#8a8a8a] hover:text-[#e0e0e0]"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? "Exporting..." : "Export"}
            </Button>
          </TooltipTrigger>
          <TooltipContent className="border-[#2a2a2a] bg-[#13271e] text-[10px] text-[#e0e0e0]">
            Download review.jsonl
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-[#8a8a8a] hover:text-[#e0e0e0]"
              onClick={() => setUploadOpen(true)}
            >
              Upload
            </Button>
          </TooltipTrigger>
          <TooltipContent className="border-[#2a2a2a] bg-[#13271e] text-[10px] text-[#e0e0e0]">
            Upload to LangSmith
          </TooltipContent>
        </Tooltip>
      </div>

      <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} />
      <LoadDataModal open={loadDataOpen} onOpenChange={setLoadDataOpen} />
    </div>
  );
}
