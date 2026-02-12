"use client";

import { useState } from "react";
import { useReviewStore } from "@/stores/reviewStore";
import { ReviewItem } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import * as api from "@/lib/api";

interface QueryRewriteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ReviewItem;
}

export function QueryRewriteDialog({
  open,
  onOpenChange,
  item,
}: QueryRewriteDialogProps) {
  const { rewriteQuery } = useReviewStore();
  const [instruction, setInstruction] = useState("");
  const [rewritten, setRewritten] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!instruction) return;
    setLoading(true);
    setError(null);
    try {
      const result = await api.rewriteQuery(
        item.query,
        instruction,
        item.citations
      );
      setRewritten(result.rewritten_query);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rewrite failed");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (rewritten) {
      await rewriteQuery(item.index, rewritten);
      onOpenChange(false);
      setInstruction("");
      setRewritten(null);
    }
  };

  const handleDiscard = () => {
    onOpenChange(false);
    setInstruction("");
    setRewritten(null);
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#2a2a2a] bg-[#0d1a14] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sm text-[#e0e0e0]">
            AI Query Rewrite
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Current query */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#5a5a5a]">
              Current Query
            </label>
            <p className="mt-1 rounded bg-[#0f1f18] p-2 text-xs text-[#8a8a8a]">
              {item.query}
            </p>
          </div>

          {/* Instruction */}
          <div>
            <label className="text-[10px] uppercase tracking-wider text-[#5a5a5a]">
              Instruction
            </label>
            <Textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g., make it more vague, add a typo, rephrase as a statement..."
              className="mt-1 min-h-[60px] resize-none border-[#2a2a2a] bg-[#0f1f18] text-xs text-[#e0e0e0] placeholder:text-[#5a5a5a]"
            />
          </div>

          {/* Generate button */}
          <Button
            onClick={handleGenerate}
            disabled={!instruction || loading}
            variant="secondary"
            className="w-full"
          >
            {loading ? "Generating..." : rewritten ? "Regenerate" : "Generate"}
          </Button>

          {error && <p className="text-xs text-[#f87171]">{error}</p>}

          {/* Rewritten result */}
          {rewritten && (
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#5a5a5a]">
                Rewritten Query
              </label>
              <div className="mt-1 rounded border border-[#8b5cf6]/30 bg-[#8b5cf6]/5 p-2">
                <p className="text-xs text-[#e0e0e0]">{rewritten}</p>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  onClick={handleApply}
                  className="flex-1 bg-[#4ade80] text-[#080f0b] hover:bg-[#22c55e]"
                >
                  Apply
                </Button>
                <Button
                  onClick={handleDiscard}
                  variant="ghost"
                  className="flex-1 text-[#5a5a5a] hover:text-[#8a8a8a]"
                >
                  Discard
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
