import { NextRequest, NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import matter from "gray-matter";
import { setKBDocs, setKBPath } from "@/lib/serverStore";
import { LoadKBRequest, LoadKBResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { path } = (await req.json()) as LoadKBRequest;

    const files = await readdir(path);
    const mdFiles = files.filter((f) => f.endsWith(".md"));

    const docs = new Map<string, string>();

    for (const file of mdFiles) {
      const filePath = join(path, file);
      const raw = await readFile(filePath, "utf-8");
      const { content } = matter(raw);
      const docId = file.replace(/\.md$/, "");
      docs.set(docId, content);
    }

    setKBDocs(docs);
    setKBPath(path);

    const response: LoadKBResponse = {
      count: docs.size,
      doc_ids: Array.from(docs.keys()),
    };

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load KB";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
