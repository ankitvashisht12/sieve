import { NextRequest, NextResponse } from "next/server";
import { getState, setItem } from "@/lib/serverStore";
import { writeReviewJsonl } from "@/lib/persistence";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ index: string }> }
) {
  try {
    const { index: indexStr } = await params;
    const index = parseInt(indexStr, 10);
    const { items, reviewPath } = getState();

    if (index < 0 || index >= items.length) {
      return NextResponse.json({ error: "Index out of range" }, { status: 400 });
    }

    const updates = await req.json();
    const updated = { ...items[index], ...updates };
    setItem(index, updated);

    if (reviewPath) {
      await writeReviewJsonl(reviewPath, getState().items);
    }

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
