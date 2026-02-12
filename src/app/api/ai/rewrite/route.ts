import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { RewriteRequest, RewriteResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not set in environment" },
        { status: 500 }
      );
    }

    const { query, instruction, citations } = (await req.json()) as RewriteRequest;

    const client = new Anthropic({ apiKey });

    const citationContext = citations
      .map((c, i) => `[Citation ${i + 1}] (${c.doc_id}): "${c.citation_text}"`)
      .join("\n");

    const message = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      system: `You are rewriting a synthetic Q&A query for evaluation purposes. The query is part of a RAG evaluation dataset. Your job is to rewrite it according to the user's instruction while keeping it grounded in the provided citations.

Here are the citations this query is based on:
${citationContext}

Return ONLY the rewritten query, nothing else. No quotes, no explanation.`,
      messages: [
        {
          role: "user",
          content: `Original query: "${query}"\n\nInstruction: ${instruction}`,
        },
      ],
    });

    const rewrittenQuery =
      message.content[0].type === "text" ? message.content[0].text.trim() : "";

    const response: RewriteResponse = { rewritten_query: rewrittenQuery };
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to rewrite query";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
