"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useReviewStore } from "@/stores/reviewStore";
import { getCitationColor } from "@/lib/colors";
import { Button } from "@/components/ui/button";
import { DocumentSelector } from "./DocumentSelector";
import { CitationOverride } from "./CitationOverride";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import * as api from "@/lib/api";

interface TextSegment {
  text: string;
  citationIndices: number[];
}

function buildSegments(
  content: string,
  citations: { span_start: number; span_end: number }[]
): TextSegment[] {
  if (citations.length === 0) {
    return [{ text: content, citationIndices: [] }];
  }

  // Build events: [position, type (0=start, 1=end), citationIndex]
  const events: [number, number, number][] = [];
  citations.forEach((c, i) => {
    if (c.span_start >= 0 && c.span_end <= content.length && c.span_start < c.span_end) {
      events.push([c.span_start, 0, i]);
      events.push([c.span_end, 1, i]);
    }
  });

  events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const segments: TextSegment[] = [];
  let pos = 0;
  const active = new Set<number>();

  for (const [eventPos, type, idx] of events) {
    if (eventPos > pos) {
      segments.push({
        text: content.slice(pos, eventPos),
        citationIndices: Array.from(active),
      });
    }
    if (type === 0) active.add(idx);
    else active.delete(idx);
    pos = eventPos;
  }

  if (pos < content.length) {
    segments.push({
      text: content.slice(pos),
      citationIndices: Array.from(active),
    });
  }

  return segments;
}

export function SourceViewer() {
  const {
    items,
    selectedIndex,
    activeDocId,
    activeCitationIndex,
    isSelectionMode,
  } = useReviewStore();

  const [docContent, setDocContent] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"raw" | "preview">("raw");
  const [loading, setLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const docCache = useRef<Map<string, string>>(new Map());
  const highlightRefs = useRef<Map<number, HTMLSpanElement>>(new Map());

  const item = selectedIndex !== null ? items[selectedIndex] : null;

  // Fetch document content
  useEffect(() => {
    if (!activeDocId) {
      setDocContent(null);
      return;
    }

    const cached = docCache.current.get(activeDocId);
    if (cached) {
      setDocContent(cached);
      return;
    }

    setLoading(true);
    api
      .fetchKBDoc(activeDocId)
      .then((doc) => {
        docCache.current.set(activeDocId, doc.content);
        setDocContent(doc.content);
      })
      .catch(() => setDocContent(null))
      .finally(() => setLoading(false));
  }, [activeDocId]);

  // Clear highlight refs when item changes so they get rebuilt
  useEffect(() => {
    highlightRefs.current.clear();
  }, [selectedIndex]);

  // Auto-scroll to active citation
  useEffect(() => {
    if (activeCitationIndex !== null && viewMode === "raw") {
      // Wait for DOM to update with new highlight spans
      requestAnimationFrame(() => {
        const el = highlightRefs.current.get(activeCitationIndex);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("citation-flash");
          setTimeout(() => el.classList.remove("citation-flash"), 1200);
        }
      });
    }
  }, [activeCitationIndex, viewMode, docContent, selectedIndex]);

  // Get citations for current doc
  const docCitations = useMemo(() => {
    if (!item || !activeDocId) return [];
    return item.citations
      .map((c, i) => ({ ...c, originalIndex: i }))
      .filter((c) => c.doc_id === activeDocId);
  }, [item, activeDocId]);

  const segments = useMemo(() => {
    if (!docContent) return [];
    return buildSegments(
      docContent,
      docCitations.map((c) => ({
        span_start: c.span_start,
        span_end: c.span_end,
      }))
    );
  }, [docContent, docCitations]);

  if (!activeDocId) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0d1a14] text-xs text-[#5a5a5a]">
        Select a document to view
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[#0d1a14]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a2a2a] px-3 py-2">
        <DocumentSelector />
        <div className="flex items-center gap-2">
          {activeCitationIndex !== null && docCitations.length > 0 && (
            <span className="text-[10px] text-[#5a5a5a]">
              Citation {activeCitationIndex + 1} of {item?.citations.length}
            </span>
          )}
          <div className="flex rounded border border-[#2a2a2a]">
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 rounded-none text-[10px] ${
                viewMode === "raw" ? "bg-[#1a3328] text-[#e0e0e0]" : "text-[#5a5a5a]"
              }`}
              onClick={() => setViewMode("raw")}
            >
              Raw
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-6 rounded-none text-[10px] ${
                viewMode === "preview" ? "bg-[#1a3328] text-[#e0e0e0]" : "text-[#5a5a5a]"
              }`}
              onClick={() => setViewMode("preview")}
            >
              Preview
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className={`flex-1 overflow-auto p-4 ${
          isSelectionMode ? "cursor-text selection:bg-[#22d3ee]/30" : ""
        }`}
      >
        {loading ? (
          <div className="flex h-32 items-center justify-center text-xs text-[#5a5a5a]">
            Loading document...
          </div>
        ) : !docContent ? (
          <div className="flex h-32 items-center justify-center text-xs text-[#5a5a5a]">
            Document not found
          </div>
        ) : viewMode === "preview" ? (
          <div className="prose prose-invert prose-sm max-w-none text-[#e0e0e0] prose-headings:text-[#e0e0e0] prose-a:text-[#22d3ee] prose-code:text-[#4ade80]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {docContent}
            </ReactMarkdown>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap text-xs leading-relaxed text-[#e0e0e0]">
            {segments.map((segment, i) => {
              if (segment.citationIndices.length === 0) {
                return <span key={i}>{segment.text}</span>;
              }

              // Use first citation's color for multi-overlap
              const primaryIdx = segment.citationIndices[0];
              const docCitation = docCitations[primaryIdx];
              const color = docCitation
                ? getCitationColor(docCitation.originalIndex)
                : getCitationColor(0);

              const isActive = segment.citationIndices.some(
                (ci) => docCitations[ci]?.originalIndex === activeCitationIndex
              );

              return (
                <span
                  key={i}
                  ref={(el) => {
                    if (el && docCitation) {
                      highlightRefs.current.set(docCitation.originalIndex, el);
                    }
                  }}
                  className={`rounded-sm px-0.5 ${isActive ? "ring-1 ring-white/30" : ""}`}
                  style={{
                    backgroundColor: color.hex + "25",
                    borderBottom: `2px solid ${color.hex}60`,
                  }}
                >
                  {segment.text}
                </span>
              );
            })}
          </pre>
        )}
      </div>

      {/* Selection mode overlay */}
      {isSelectionMode && (
        <div className="border-t border-[#22d3ee]/30 bg-[#22d3ee]/5 px-3 py-1.5 text-center text-[10px] text-[#22d3ee]">
          Select text to add as citation
        </div>
      )}

      <CitationOverride />
    </div>
  );
}
