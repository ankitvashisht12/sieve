import { NextRequest, NextResponse } from "next/server";
import { readFile, access, unlink } from "fs/promises";
import { join, dirname } from "path";
import { setItems, setOutputPath, setReviewPath, getState } from "@/lib/serverStore";
import { writeReviewJsonl } from "@/lib/persistence";
import { ReviewItem, LoadOutputRequest, LoadOutputResponse } from "@/lib/types";

function parseOutputToItems(content: string): ReviewItem[] {
  const lines = content.trim().split("\n").filter(Boolean);
  return lines.map((line, index) => {
    const raw = JSON.parse(line);
    return {
      index,
      query: raw.query || raw.question || "",
      citations: (raw.citations || []).map((c: Record<string, unknown>) => ({
        doc_id: ((c.doc_id as string) || "").replace(/\.md$/, ""),
        span_start: c.span_start ?? c.start_index ?? 0,
        span_end: c.span_end ?? c.end_index ?? 0,
        citation_text: c.citation_text || c.text || "",
        chunks: c.chunks || [],
      })),
      classification: {
        category: raw.category || raw.classification?.category || raw.query_metadata?.category,
        language: raw.language || raw.classification?.language || raw.query_metadata?.language,
        tone: raw.tone || raw.classification?.tone || raw.query_metadata?.tone,
        style: raw.style || raw.classification?.style || raw.query_metadata?.style,
        has_typos: raw.has_typos ?? raw.classification?.has_typos ?? raw.query_metadata?.has_typos ?? false,
        ...((raw.classification || raw.query_metadata || {}) as Record<string, unknown>),
      },
      status: "pending" as const,
      reviewer_notes: "",
      citations_modified: false,
    } satisfies ReviewItem;
  });
}

export async function POST(req: NextRequest) {
  try {
    const { path, force } = (await req.json()) as LoadOutputRequest;

    const reviewPath = join(dirname(path), "review.jsonl");
    setOutputPath(path);
    setReviewPath(reviewPath);

    // Check if review.jsonl exists
    let reviewExists = false;
    try {
      await access(reviewPath);
      reviewExists = true;
    } catch {
      // No review file
    }

    // Tri-state force logic:
    // force === undefined → detect mode: if review exists, prompt the user
    // force === false     → resume mode: load from review.jsonl
    // force === true      → reset mode: delete review.jsonl, parse from output.jsonl

    if (reviewExists && force === undefined) {
      // Detect mode: tell the client a review exists so it can prompt the user
      const reviewContent = await readFile(reviewPath, "utf-8");
      const lineCount = reviewContent.trim().split("\n").filter(Boolean).length;
      const response: LoadOutputResponse = {
        count: 0,
        hasExistingReview: true,
        reviewItemCount: lineCount,
      };
      return NextResponse.json(response);
    }

    if (reviewExists && force === true) {
      // Reset mode: delete old review, will re-parse from output below
      await unlink(reviewPath);
      reviewExists = false;
    }

    let items: ReviewItem[];

    if (reviewExists) {
      // Resume mode (force === false): load from existing review.jsonl
      const reviewContent = await readFile(reviewPath, "utf-8");
      items = reviewContent
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line) as ReviewItem);
    } else {
      // No review file: parse from output.jsonl and create review.jsonl
      const content = await readFile(path, "utf-8");
      items = parseOutputToItems(content);
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
