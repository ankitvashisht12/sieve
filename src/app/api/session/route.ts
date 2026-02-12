import { NextResponse } from "next/server";
import { getState } from "@/lib/serverStore";

export async function GET() {
  const state = getState();
  const hasItems = state.items.length > 0;
  const hasKB = state.kbDocs.size > 0;

  if (hasItems && hasKB) {
    return NextResponse.json({
      active: true,
      itemCount: state.items.length,
      docIds: Array.from(state.kbDocs.keys()),
    });
  }

  return NextResponse.json({ active: false });
}
