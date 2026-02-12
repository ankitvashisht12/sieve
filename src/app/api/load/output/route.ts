import { NextRequest, NextResponse } from "next/server";
import { readFile, access } from "fs/promises";
import { join, dirname } from "path";
import { setItems, setOutputPath, setReviewPath, getState } from "@/lib/serverStore";
import { writeReviewJsonl } from "@/lib/persistence";
import { ReviewItem, LoadOutputRequest, LoadOutputResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { path } = (await req.json()) as LoadOutputRequest;

    const reviewPath = join(dirname(path), "review.jsonl");
    setOutputPath(path);
    setReviewPath(reviewPath);

    // Check if review.jsonl already exists (resume previous session)
    let items: ReviewItem[];
    try {
      await access(reviewPath);
      const reviewContent = await readFile(reviewPath, "utf-8");
      items = reviewContent
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line) as ReviewItem);
    } catch {
      // No review file yet, parse from output.jsonl
      const content = await readFile(path, "utf-8");
      const lines = content.trim().split("\n").filter(Boolean);

      items = lines.map((line, index) => {
        const raw = JSON.parse(line);
        return {
          index,
          query: raw.query || raw.question || "",
          citations: (raw.citations || []).map((c: Record<string, unknown>) => ({
            doc_id: c.doc_id || "",
            span_start: c.span_start || 0,
            span_end: c.span_end || 0,
            citation_text: c.citation_text || "",
            chunks: c.chunks || [],
          })),
          classification: {
            category: raw.category || raw.classification?.category,
            language: raw.language || raw.classification?.language,
            tone: raw.tone || raw.classification?.tone,
            style: raw.style || raw.classification?.style,
            has_typos: raw.has_typos ?? raw.classification?.has_typos ?? false,
            ...((raw.classification || {}) as Record<string, unknown>),
          },
          status: "pending" as const,
          reviewer_notes: "",
          citations_modified: false,
        } satisfies ReviewItem;
      });

      // Write initial review.jsonl
      await writeReviewJsonl(reviewPath, items);
    }

    setItems(items);

    const response: LoadOutputResponse = {
      count: items.length,
    };

    // Verify state was set
    const state = getState();
    if (state.items.length === 0) {
      return NextResponse.json({ error: "Failed to store items" }, { status: 500 });
    }

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load output";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
