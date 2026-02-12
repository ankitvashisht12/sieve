export interface Citation {
  doc_id: string;
  span_start: number;
  span_end: number;
  citation_text: string;
  chunks?: string[];
}

export interface ReviewItem {
  index: number;
  query: string;
  citations: Citation[];
  classification: {
    category?: string;
    language?: string;
    tone?: string;
    style?: string;
    has_typos?: boolean;
    [key: string]: unknown;
  };
  status: "pending" | "accepted" | "rejected";
  reviewer_notes: string;
  citations_modified: boolean;
  query_modified?: boolean;
  original_query?: string;
}

export interface KBDocument {
  doc_id: string;
  content: string;
}

export interface QueryMetadata {
  category?: string;
  language?: string;
  tone?: string;
  style?: string;
  has_typos?: boolean;
}

export interface LoadKBRequest {
  path: string;
}

export interface LoadKBResponse {
  count: number;
  doc_ids: string[];
}

export interface LoadOutputRequest {
  path: string;
}

export interface LoadOutputResponse {
  count: number;
}

export interface ComputeSpanRequest {
  doc_id: string;
  selected_text: string;
}

export interface ComputeSpanResponse {
  span_start: number;
  span_end: number;
  citation_text: string;
}

export interface UploadRequest {
  dataset_name: string;
  description?: string;
}

export interface UploadResponse {
  url: string;
  count: number;
}

export interface FilterOptions {
  categories: string[];
  languages: string[];
  doc_ids: string[];
}

export interface RewriteRequest {
  query: string;
  instruction: string;
  citations: Citation[];
}

export interface RewriteResponse {
  rewritten_query: string;
}
