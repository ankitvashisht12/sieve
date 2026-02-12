"use client";

import { useEffect, useState, useCallback } from "react";
import { useReviewStore } from "@/stores/reviewStore";
import { Button } from "@/components/ui/button";
import * as api from "@/lib/api";

export function CitationOverride() {
  const { isSelectionMode, selectedIndex, activeDocId, addCitation } =
    useReviewStore();
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null
  );
  const [selectedText, setSelectedText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMouseUp = useCallback(() => {
    if (!isSelectionMode) return;

    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text && text.length > 0) {
      const range = selection!.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
      setSelectedText(text);
    } else {
      setPosition(null);
      setSelectedText("");
    }
  }, [isSelectionMode]);

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseUp]);

  useEffect(() => {
    if (!isSelectionMode) {
      setPosition(null);
      setSelectedText("");
    }
  }, [isSelectionMode]);

  const handleAddCitation = async () => {
    if (!activeDocId || selectedIndex === null || !selectedText) return;
    setLoading(true);
    try {
      const result = await api.computeCitationSpan(activeDocId, selectedText);
      await addCitation(selectedIndex, {
        doc_id: activeDocId,
        span_start: result.span_start,
        span_end: result.span_end,
        citation_text: result.citation_text,
      });
      setPosition(null);
      setSelectedText("");
    } catch (err) {
      console.error("Failed to compute span:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!position || !isSelectionMode) return null;

  return (
    <div
      className="fixed z-50"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -100%)",
      }}
    >
      <Button
        size="sm"
        className="bg-[#22d3ee] text-[#080f0b] shadow-lg hover:bg-[#06b6d4]"
        onClick={handleAddCitation}
        disabled={loading}
      >
        {loading ? "Computing..." : "Add as Citation"}
      </Button>
    </div>
  );
}
