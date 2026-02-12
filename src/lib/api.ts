import {
  ReviewItem,
  LoadKBResponse,
  LoadOutputResponse,
  ComputeSpanResponse,
  UploadResponse,
  FilterOptions,
  KBDocument,
  RewriteResponse,
} from "./types";

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || res.statusText);
  }
  return res.json();
}

export async function loadKB(path: string): Promise<LoadKBResponse> {
  return fetchJSON("/api/load/kb", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  });
}

export async function loadOutput(path: string): Promise<LoadOutputResponse> {
  return fetchJSON("/api/load/output", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  });
}

export async function fetchItems(): Promise<ReviewItem[]> {
  return fetchJSON("/api/items");
}

export async function updateItem(
  index: number,
  updates: Partial<ReviewItem>
): Promise<ReviewItem> {
  return fetchJSON(`/api/items/${index}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
}

export async function fetchKBDoc(docId: string): Promise<KBDocument> {
  return fetchJSON(`/api/kb/${encodeURIComponent(docId)}`);
}

export async function computeCitationSpan(
  docId: string,
  selectedText: string
): Promise<ComputeSpanResponse> {
  return fetchJSON("/api/citation/compute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ doc_id: docId, selected_text: selectedText }),
  });
}

export async function uploadToLangSmith(
  datasetName: string,
  description?: string
): Promise<UploadResponse> {
  return fetchJSON("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataset_name: datasetName, description }),
  });
}

export async function exportReview(): Promise<void> {
  const res = await fetch("/api/export");
  if (!res.ok) throw new Error("Failed to export");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "review.jsonl";
  a.click();
  URL.revokeObjectURL(url);
}

export async function fetchFilters(): Promise<FilterOptions> {
  return fetchJSON("/api/filters");
}

export async function rewriteQuery(
  query: string,
  instruction: string,
  citations: { doc_id: string; span_start: number; span_end: number; citation_text: string }[]
): Promise<RewriteResponse> {
  return fetchJSON("/api/ai/rewrite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, instruction, citations }),
  });
}

export async function checkSession(): Promise<{ active: boolean; itemCount?: number; docIds?: string[] }> {
  return fetchJSON("/api/session");
}

export async function openFolderDialog(): Promise<string | null> {
  const res = await fetchJSON<{ path?: string; cancelled?: boolean }>("/api/dialog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "folder" }),
  });
  return res.cancelled ? null : res.path ?? null;
}

export async function openFileDialog(): Promise<string | null> {
  const res = await fetchJSON<{ path?: string; cancelled?: boolean }>("/api/dialog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "file" }),
  });
  return res.cancelled ? null : res.path ?? null;
}
