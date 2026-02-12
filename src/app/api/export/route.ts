import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { getState } from "@/lib/serverStore";

export async function GET() {
  try {
    const { reviewPath } = getState();

    if (!reviewPath) {
      return NextResponse.json({ error: "No review file loaded" }, { status: 400 });
    }

    const content = await readFile(reviewPath, "utf-8");

    return new NextResponse(content, {
      headers: {
        "Content-Type": "application/jsonl",
        "Content-Disposition": 'attachment; filename="review.jsonl"',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to export";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
