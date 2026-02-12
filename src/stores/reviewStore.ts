"use client";

import { create } from "zustand";
import { ReviewItem, Citation, LoadOutputResponse } from "@/lib/types";
import * as api from "@/lib/api";

interface ReviewFilters {
  status: "all" | "pending" | "accepted" | "rejected";
  categories: string[];
  languages: string[];
  docIds: string[];
  hasTypos: boolean | null;
  modifiedOnly: boolean;
  searchQuery: string;
}

interface ReviewStats {
  total: number;
  accepted: number;
  rejected: number;
  pending: number;
}

interface ReviewStore {
  // Data
  items: ReviewItem[];
  kbDocIds: string[];
  isSetupComplete: boolean;
  isLoading: boolean;

  // Selection
  selectedIndex: number | null;
  activeDocId: string | null;
  activeCitationIndex: number | null;
  isSelectionMode: boolean;

  // Filters
  filters: ReviewFilters;

  // Derived
  filteredIndices: number[];
  stats: ReviewStats;

  // Setup actions
  loadKB: (path: string) => Promise<{ count: number; doc_ids: string[] }>;
  loadOutput: (path: string, force?: boolean) => Promise<LoadOutputResponse>;
  startReview: () => Promise<void>;
  restoreSession: () => Promise<boolean>;

  // Selection actions
  select: (index: number) => void;
  selectNext: () => void;
  selectPrev: () => void;
  selectNextPending: () => void;
  setActiveDocId: (docId: string | null) => void;
  setActiveCitationIndex: (index: number | null) => void;
  setSelectionMode: (mode: boolean) => void;

  // Filter actions
  setStatusFilter: (status: ReviewFilters["status"]) => void;
  setCategoryFilter: (categories: string[]) => void;
  setLanguageFilter: (languages: string[]) => void;
  setDocIdFilter: (docIds: string[]) => void;
  setHasTyposFilter: (hasTypos: boolean | null) => void;
  setModifiedOnlyFilter: (modifiedOnly: boolean) => void;
  setSearchQuery: (query: string) => void;

  // Review actions
  acceptItem: (index: number) => Promise<void>;
  rejectItem: (index: number) => Promise<void>;
  resetItem: (index: number) => Promise<void>;
  updateNotes: (index: number, notes: string) => Promise<void>;
  addCitation: (index: number, citation: Citation) => Promise<void>;
  removeCitation: (index: number, citationIdx: number) => Promise<void>;
  rewriteQuery: (index: number, newQuery: string) => Promise<void>;
}

function computeFilteredIndices(
  items: ReviewItem[],
  filters: ReviewFilters
): number[] {
  return items
    .map((item, idx) => ({ item, idx }))
    .filter(({ item }) => {
      if (filters.status !== "all" && item.status !== filters.status) return false;
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(item.classification.category || "")
      )
        return false;
      if (
        filters.languages.length > 0 &&
        !filters.languages.includes(item.classification.language || "")
      )
        return false;
      if (filters.docIds.length > 0) {
        const itemDocIds = item.citations.map((c) => c.doc_id);
        if (!filters.docIds.some((d) => itemDocIds.includes(d))) return false;
      }
      if (filters.hasTypos === true && !item.classification.has_typos) return false;
      if (filters.hasTypos === false && item.classification.has_typos) return false;
      if (filters.modifiedOnly && !item.citations_modified && !item.query_modified) return false;
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        if (!item.query.toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .map(({ idx }) => idx);
}

function computeStats(items: ReviewItem[]): ReviewStats {
  return {
    total: items.length,
    accepted: items.filter((i) => i.status === "accepted").length,
    rejected: items.filter((i) => i.status === "rejected").length,
    pending: items.filter((i) => i.status === "pending").length,
  };
}

const defaultFilters: ReviewFilters = {
  status: "all",
  categories: [],
  languages: [],
  docIds: [],
  hasTypos: null,
  modifiedOnly: false,
  searchQuery: "",
};

export const useReviewStore = create<ReviewStore>((set, get) => ({
  items: [],
  kbDocIds: [],
  isSetupComplete: false,
  isLoading: false,
  selectedIndex: null,
  activeDocId: null,
  activeCitationIndex: null,
  isSelectionMode: false,
  filters: defaultFilters,
  filteredIndices: [],
  stats: { total: 0, accepted: 0, rejected: 0, pending: 0 },

  loadKB: async (path) => {
    const result = await api.loadKB(path);
    set({ kbDocIds: result.doc_ids });
    return result;
  },

  loadOutput: async (path, force?) => {
    const result = await api.loadOutput(path, force);
    return result;
  },

  startReview: async () => {
    set({ isLoading: true });
    const items = await api.fetchItems();
    const filteredIndices = computeFilteredIndices(items, defaultFilters);
    set({
      items,
      isSetupComplete: true,
      isLoading: false,
      filteredIndices,
      stats: computeStats(items),
      selectedIndex: filteredIndices.length > 0 ? filteredIndices[0] : null,
    });
  },

  restoreSession: async () => {
    const session = await api.checkSession();
    if (!session.active) return false;
    const items = await api.fetchItems();
    const filteredIndices = computeFilteredIndices(items, defaultFilters);
    set({
      items,
      kbDocIds: session.docIds ?? [],
      isSetupComplete: true,
      isLoading: false,
      filteredIndices,
      stats: computeStats(items),
      selectedIndex: filteredIndices.length > 0 ? filteredIndices[0] : null,
    });
    return true;
  },

  select: (index) => {
    const { items } = get();
    if (index >= 0 && index < items.length) {
      const item = items[index];
      const firstDocId = item.citations.length > 0 ? item.citations[0].doc_id : null;
      set({
        selectedIndex: index,
        activeDocId: firstDocId,
        activeCitationIndex: item.citations.length > 0 ? 0 : null,
        isSelectionMode: false,
      });
    }
  },

  selectNext: () => {
    const { filteredIndices, selectedIndex } = get();
    if (filteredIndices.length === 0) return;
    if (selectedIndex === null) {
      get().select(filteredIndices[0]);
      return;
    }
    const currentPos = filteredIndices.indexOf(selectedIndex);
    if (currentPos < filteredIndices.length - 1) {
      get().select(filteredIndices[currentPos + 1]);
    }
  },

  selectPrev: () => {
    const { filteredIndices, selectedIndex } = get();
    if (filteredIndices.length === 0) return;
    if (selectedIndex === null) {
      get().select(filteredIndices[0]);
      return;
    }
    const currentPos = filteredIndices.indexOf(selectedIndex);
    if (currentPos > 0) {
      get().select(filteredIndices[currentPos - 1]);
    }
  },

  selectNextPending: () => {
    const { items, filteredIndices, selectedIndex } = get();
    if (filteredIndices.length === 0) return;
    const startPos =
      selectedIndex !== null
        ? filteredIndices.indexOf(selectedIndex) + 1
        : 0;

    for (let i = startPos; i < filteredIndices.length; i++) {
      if (items[filteredIndices[i]].status === "pending") {
        get().select(filteredIndices[i]);
        return;
      }
    }
    // Wrap around
    for (let i = 0; i < startPos; i++) {
      if (items[filteredIndices[i]].status === "pending") {
        get().select(filteredIndices[i]);
        return;
      }
    }
  },

  setActiveDocId: (docId) => set({ activeDocId: docId }),
  setActiveCitationIndex: (index) => set({ activeCitationIndex: index }),
  setSelectionMode: (mode) => set({ isSelectionMode: mode }),

  setStatusFilter: (status) => {
    const filters = { ...get().filters, status };
    const filteredIndices = computeFilteredIndices(get().items, filters);
    set({ filters, filteredIndices });
  },
  setCategoryFilter: (categories) => {
    const filters = { ...get().filters, categories };
    const filteredIndices = computeFilteredIndices(get().items, filters);
    set({ filters, filteredIndices });
  },
  setLanguageFilter: (languages) => {
    const filters = { ...get().filters, languages };
    const filteredIndices = computeFilteredIndices(get().items, filters);
    set({ filters, filteredIndices });
  },
  setDocIdFilter: (docIds) => {
    const filters = { ...get().filters, docIds };
    const filteredIndices = computeFilteredIndices(get().items, filters);
    set({ filters, filteredIndices });
  },
  setHasTyposFilter: (hasTypos) => {
    const filters = { ...get().filters, hasTypos };
    const filteredIndices = computeFilteredIndices(get().items, filters);
    set({ filters, filteredIndices });
  },
  setModifiedOnlyFilter: (modifiedOnly) => {
    const filters = { ...get().filters, modifiedOnly };
    const filteredIndices = computeFilteredIndices(get().items, filters);
    set({ filters, filteredIndices });
  },
  setSearchQuery: (searchQuery) => {
    const filters = { ...get().filters, searchQuery };
    const filteredIndices = computeFilteredIndices(get().items, filters);
    set({ filters, filteredIndices });
  },

  acceptItem: async (index) => {
    const updated = await api.updateItem(index, { status: "accepted" });
    const items = [...get().items];
    items[index] = updated;
    const filteredIndices = computeFilteredIndices(items, get().filters);
    set({ items, filteredIndices, stats: computeStats(items) });
    get().selectNextPending();
  },

  rejectItem: async (index) => {
    const updated = await api.updateItem(index, { status: "rejected" });
    const items = [...get().items];
    items[index] = updated;
    const filteredIndices = computeFilteredIndices(items, get().filters);
    set({ items, filteredIndices, stats: computeStats(items) });
    get().selectNextPending();
  },

  resetItem: async (index) => {
    const updated = await api.updateItem(index, { status: "pending" });
    const items = [...get().items];
    items[index] = updated;
    const filteredIndices = computeFilteredIndices(items, get().filters);
    set({ items, filteredIndices, stats: computeStats(items) });
  },

  updateNotes: async (index, notes) => {
    const updated = await api.updateItem(index, { reviewer_notes: notes });
    const items = [...get().items];
    items[index] = updated;
    set({ items });
  },

  addCitation: async (index, citation) => {
    const item = get().items[index];
    const newCitations = [...item.citations, citation];
    const updated = await api.updateItem(index, {
      citations: newCitations,
      citations_modified: true,
    });
    const items = [...get().items];
    items[index] = updated;
    set({ items, isSelectionMode: false });
  },

  removeCitation: async (index, citationIdx) => {
    const item = get().items[index];
    const newCitations = item.citations.filter((_, i) => i !== citationIdx);
    const updated = await api.updateItem(index, {
      citations: newCitations,
      citations_modified: true,
    });
    const items = [...get().items];
    items[index] = updated;
    const { activeCitationIndex } = get();
    let newActiveCitation = activeCitationIndex;
    if (activeCitationIndex !== null) {
      if (activeCitationIndex === citationIdx) newActiveCitation = null;
      else if (activeCitationIndex > citationIdx)
        newActiveCitation = activeCitationIndex - 1;
    }
    set({ items, activeCitationIndex: newActiveCitation });
  },

  rewriteQuery: async (index, newQuery) => {
    const item = get().items[index];
    const updated = await api.updateItem(index, {
      query: newQuery,
      query_modified: true,
      original_query: item.query_modified ? item.original_query : item.query,
    });
    const items = [...get().items];
    items[index] = updated;
    set({ items });
  },
}));
