import { NextRequest, NextResponse } from "next/server";
import { getState } from "@/lib/serverStore";
import { computeSpan } from "@/lib/computeSpan";
import { ComputeSpanRequest, ComputeSpanResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { doc_id, selected_text } = (await req.json()) as ComputeSpanRequest;
    const { kbDocs } = getState();

    const content = kbDocs.get(doc_id);
    if (!content) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const result = computeSpan(content, selected_text);
    if (!result) {
      return NextResponse.json(
        { error: "Could not find selected text in document" },
        { status: 400 }
      );
    }

    const response: ComputeSpanResponse = result;
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to compute span";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
