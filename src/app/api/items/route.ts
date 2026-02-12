import { NextResponse } from "next/server";
import { getState } from "@/lib/serverStore";

export async function GET() {
  const { items } = getState();
  return NextResponse.json(items);
}
