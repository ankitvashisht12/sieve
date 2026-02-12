"use client";

import { useState } from "react";
import { useReviewStore } from "@/stores/reviewStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import * as api from "@/lib/api";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadModal({ open, onOpenChange }: UploadModalProps) {
  const { stats } = useReviewStore();
  const [datasetName, setDatasetName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url: string; count: number } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!datasetName) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.uploadToLangSmith(datasetName, description);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#2a2a2a] bg-[#0d1a14] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm text-[#e0e0e0]">
            Upload to LangSmith
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <p className="text-xs text-[#8a8a8a]">
            {stats.accepted} accepted items will be uploaded.
          </p>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider text-[#5a5a5a]">
              Dataset Name
            </label>
            <Input
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              placeholder="my-review-dataset"
              className="border-[#2a2a2a] bg-[#0f1f18] text-xs text-[#e0e0e0] placeholder:text-[#5a5a5a]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider text-[#5a5a5a]">
              Description (optional)
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description of the dataset..."
              className="min-h-[60px] resize-none border-[#2a2a2a] bg-[#0f1f18] text-xs text-[#e0e0e0] placeholder:text-[#5a5a5a]"
            />
          </div>

          {error && <p className="text-xs text-[#f87171]">{error}</p>}

          {result && (
            <div className="rounded border border-[#4ade80]/30 bg-[#4ade80]/5 p-3">
              <p className="text-xs text-[#4ade80]">
                Uploaded {result.count} items successfully!
              </p>
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-[10px] text-[#22d3ee] underline"
              >
                {result.url}
              </a>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={!datasetName || loading || stats.accepted === 0}
            className="w-full bg-[#4ade80] text-[#080f0b] hover:bg-[#22c55e]"
          >
            {loading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
