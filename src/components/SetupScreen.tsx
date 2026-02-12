"use client";

import { useState } from "react";
import { useReviewStore } from "@/stores/reviewStore";
import { openFolderDialog, openFileDialog } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export function SetupScreen() {
  const { loadKB, loadOutput, startReview, kbDocIds } = useReviewStore();

  const [kbPath, setKbPath] = useState("/Users/ankitvashisht/Personal/rag-evaluation-framework/notebooks/kb_data");
  const [outputPath, setOutputPath] = useState("/Users/ankitvashisht/Personal/rag-evaluation-framework/notebooks/output/synthetic_rejected.jsonl");
  const [kbCount, setKbCount] = useState<number | null>(null);
  const [outputCount, setOutputCount] = useState<number | null>(null);
  const [kbLoading, setKbLoading] = useState(false);
  const [outputLoading, setOutputLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [reviewPrompt, setReviewPrompt] = useState<{ path: string; count: number } | null>(null);

  const handleLoadKB = async (path?: string) => {
    const p = path ?? kbPath;
    if (!p) return;
    setError(null);
    setKbLoading(true);
    try {
      const result = await loadKB(p);
      setKbCount(result.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load KB");
    } finally {
      setKbLoading(false);
    }
  };

  const handleLoadOutput = async (path?: string, force?: boolean) => {
    const p = path ?? outputPath;
    if (!p) return;
    setError(null);
    setOutputLoading(true);
    try {
      const result = await loadOutput(p, force);
      if (result.hasExistingReview) {
        setReviewPrompt({ path: p, count: result.reviewItemCount ?? 0 });
        setOutputLoading(false);
        return;
      }
      setOutputCount(result.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load output");
    } finally {
      setOutputLoading(false);
    }
  };

  const handleResumeReview = async () => {
    if (!reviewPrompt) return;
    setReviewPrompt(null);
    await handleLoadOutput(reviewPrompt.path, false);
  };

  const handleStartFresh = async () => {
    if (!reviewPrompt) return;
    setReviewPrompt(null);
    await handleLoadOutput(reviewPrompt.path, true);
  };

  const handleBrowseKB = async () => {
    const path = await openFolderDialog();
    if (path) {
      setKbPath(path);
      handleLoadKB(path);
    }
  };

  const handleBrowseOutput = async () => {
    const path = await openFileDialog();
    if (path) {
      setOutputPath(path);
      handleLoadOutput(path);
    }
  };

  const handleStartReview = async () => {
    setStarting(true);
    try {
      await startReview();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start review");
      setStarting(false);
    }
  };

  const canStart = kbCount !== null && kbCount > 0 && outputCount !== null && outputCount > 0;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080f0b]">
      <div className="w-full max-w-lg rounded-lg border border-[#2a2a2a] bg-[#0d1a14] p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-wider text-[#4ade80] drop-shadow-[0_0_20px_rgba(74,222,128,0.15)]">
            SIEVE
          </h1>
          <p className="mt-2 text-sm text-[#5a5a5a]">
            Synthetic Inspection, Editing & Validation Engine
          </p>
        </div>

        <div className="space-y-6">
          {/* KB Folder */}
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-[#8a8a8a]">
              Knowledge Base Folder
            </label>
            <div className="flex gap-2">
              <Input
                value={kbPath}
                onChange={(e) => setKbPath(e.target.value)}
                placeholder="/path/to/kb/folder"
                className="border-[#2a2a2a] bg-[#0f1f18] text-[#e0e0e0] placeholder:text-[#5a5a5a]"
                onKeyDown={(e) => e.key === "Enter" && handleLoadKB()}
              />
              <Button
                onClick={handleBrowseKB}
                variant="outline"
                className="shrink-0 border-[#2a2a2a] text-[#8a8a8a] hover:text-[#e0e0e0]"
              >
                Browse
              </Button>
              <Button
                onClick={() => handleLoadKB()}
                disabled={!kbPath || kbLoading}
                variant="secondary"
                className="shrink-0"
              >
                {kbLoading ? "Loading..." : "Load"}
              </Button>
            </div>
            {kbCount !== null && (
              <Badge variant="secondary" className="bg-[#1a3328] text-[#4ade80]">
                {kbCount} documents loaded
              </Badge>
            )}
          </div>

          {/* Output File */}
          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-[#8a8a8a]">
              Output File (JSONL)
            </label>
            <div className="flex gap-2">
              <Input
                value={outputPath}
                onChange={(e) => setOutputPath(e.target.value)}
                placeholder="/path/to/output.jsonl"
                className="border-[#2a2a2a] bg-[#0f1f18] text-[#e0e0e0] placeholder:text-[#5a5a5a]"
                onKeyDown={(e) => e.key === "Enter" && handleLoadOutput()}
              />
              <Button
                onClick={handleBrowseOutput}
                variant="outline"
                className="shrink-0 border-[#2a2a2a] text-[#8a8a8a] hover:text-[#e0e0e0]"
              >
                Browse
              </Button>
              <Button
                onClick={() => handleLoadOutput()}
                disabled={!outputPath || outputLoading}
                variant="secondary"
                className="shrink-0"
              >
                {outputLoading ? "Loading..." : "Load"}
              </Button>
            </div>
            {outputCount !== null && (
              <Badge variant="secondary" className="bg-[#1a3328] text-[#4ade80]">
                {outputCount} items loaded
              </Badge>
            )}
          </div>

          {error && (
            <p className="text-sm text-[#f87171]">{error}</p>
          )}

          <Button
            onClick={handleStartReview}
            disabled={!canStart || starting}
            className="w-full bg-[#4ade80] text-[#080f0b] hover:bg-[#22c55e]"
          >
            {starting ? "Starting..." : "Start Review"}
          </Button>
        </div>
      </div>

      <AlertDialog open={reviewPrompt !== null} onOpenChange={(open) => { if (!open) setReviewPrompt(null); }}>
        <AlertDialogContent className="border-[#2a2a2a] bg-[#0d1a14]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#4ade80]">Previous Review Found</AlertDialogTitle>
            <AlertDialogDescription className="text-[#8a8a8a]">
              A review.jsonl from a previous session exists for this file ({reviewPrompt?.count} items).
              Would you like to resume where you left off or start fresh from the output file?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleStartFresh}
              className="border-[#2a2a2a] text-[#8a8a8a] hover:text-[#e0e0e0]"
            >
              Start Fresh
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResumeReview}
              className="bg-[#4ade80] text-[#080f0b] hover:bg-[#22c55e]"
            >
              Resume
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
