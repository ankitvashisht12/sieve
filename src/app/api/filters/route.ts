import { NextResponse } from "next/server";
import { getState } from "@/lib/serverStore";
import { FilterOptions } from "@/lib/types";

export async function GET() {
  const { items, kbDocs } = getState();

  const categories = new Set<string>();
  const languages = new Set<string>();

  for (const item of items) {
    if (item.classification.category) categories.add(item.classification.category);
    if (item.classification.language) languages.add(item.classification.language);
  }

  const response: FilterOptions = {
    categories: Array.from(categories).sort(),
    languages: Array.from(languages).sort(),
    doc_ids: Array.from(kbDocs.keys()).sort(),
  };

  return NextResponse.json(response);
}
