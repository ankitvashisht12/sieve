import { ReviewItem } from "./types";

interface ServerState {
  items: ReviewItem[];
  kbDocs: Map<string, string>;
  kbPath: string | null;
  outputPath: string | null;
  reviewPath: string | null;
}

const state: ServerState = {
  items: [],
  kbDocs: new Map(),
  kbPath: null,
  outputPath: null,
  reviewPath: null,
};

export function getState(): ServerState {
  return state;
}

export function setItems(items: ReviewItem[]) {
  state.items = items;
}

export function setItem(index: number, item: ReviewItem) {
  state.items[index] = item;
}

export function setKBDocs(docs: Map<string, string>) {
  state.kbDocs = docs;
}

export function setKBPath(path: string) {
  state.kbPath = path;
}

export function setOutputPath(path: string) {
  state.outputPath = path;
}

export function setReviewPath(path: string) {
  state.reviewPath = path;
}
