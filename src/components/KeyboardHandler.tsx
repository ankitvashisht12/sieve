"use client";

import { useEffect } from "react";
import { useReviewStore } from "@/stores/reviewStore";

export function KeyboardHandler() {
  const {
    selectedIndex,
    items,
    selectNext,
    selectPrev,
    selectNextPending,
    acceptItem,
    rejectItem,
    setActiveCitationIndex,
  } = useReviewStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (target.isContentEditable) return;

      switch (e.key) {
        case "j":
        case "ArrowDown":
          e.preventDefault();
          selectNext();
          break;
        case "k":
        case "ArrowUp":
          e.preventDefault();
          selectPrev();
          break;
        case "a":
          if (selectedIndex !== null) {
            e.preventDefault();
            acceptItem(selectedIndex);
          }
          break;
        case "r":
          if (selectedIndex !== null) {
            e.preventDefault();
            rejectItem(selectedIndex);
          }
          break;
        case "n":
          e.preventDefault();
          document.getElementById("sieve-notes")?.focus();
          break;
        case "/":
          e.preventDefault();
          document.getElementById("sieve-search")?.focus();
          break;
        case "Escape":
          e.preventDefault();
          (document.activeElement as HTMLElement)?.blur();
          break;
        default:
          // 1-9 jump to citation
          if (e.key >= "1" && e.key <= "9") {
            const idx = parseInt(e.key, 10) - 1;
            if (selectedIndex !== null) {
              const item = items[selectedIndex];
              if (idx < item.citations.length) {
                e.preventDefault();
                setActiveCitationIndex(idx);
              }
            }
          }
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    selectedIndex,
    items,
    selectNext,
    selectPrev,
    acceptItem,
    rejectItem,
    setActiveCitationIndex,
  ]);

  return null;
}
