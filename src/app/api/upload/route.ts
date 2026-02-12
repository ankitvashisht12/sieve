import { NextRequest, NextResponse } from "next/server";
import { Client } from "langsmith";
import { getState } from "@/lib/serverStore";
import { UploadRequest, UploadResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { dataset_name, description } = (await req.json()) as UploadRequest;
    const { items } = getState();

    const accepted = items.filter((item) => item.status === "accepted");
    if (accepted.length === 0) {
      return NextResponse.json({ error: "No accepted items to upload" }, { status: 400 });
    }

    const client = new Client();

    const dataset = await client.createDataset(dataset_name, {
      description: description || `SIEVE review — ${accepted.length} items`,
    });

    const inputs = accepted.map((item) => ({
      query: item.query,
    }));

    const outputs = accepted.map((item) => ({
      citations: item.citations,
      classification: item.classification,
    }));

    await client.createExamples({
      inputs,
      outputs,
      datasetId: dataset.id,
    });

    const response: UploadResponse = {
      url: `https://smith.langchain.com/datasets/${dataset.id}`,
      count: accepted.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
