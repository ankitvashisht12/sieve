import { NextRequest, NextResponse } from "next/server";
import { getState } from "@/lib/serverStore";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  const { docId } = await params;
  const { kbDocs } = getState();

  const content = kbDocs.get(docId);
  if (content === undefined) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json({ doc_id: docId, content });
}
