/**
 * Port of Python compute_span(): finds the span of selected_text in doc_content.
 * First tries exact match, then whitespace-normalized match with index mapping.
 */
export function computeSpan(
  docContent: string,
  selectedText: string
): { span_start: number; span_end: number; citation_text: string } | null {
  // Try exact match first
  const exactIdx = docContent.indexOf(selectedText);
  if (exactIdx !== -1) {
    return {
      span_start: exactIdx,
      span_end: exactIdx + selectedText.length,
      citation_text: selectedText,
    };
  }

  // Whitespace-normalized match with index mapping
  const normSelected = normalizeWhitespace(selectedText);
  if (!normSelected) return null;

  // Build index mapping: normalized position → original position
  const { normalized: normDoc, indexMap } = normalizeWithMapping(docContent);

  const normIdx = normDoc.indexOf(normSelected);
  if (normIdx === -1) return null;

  const normEnd = normIdx + normSelected.length;

  // Map back to original positions
  const origStart = indexMap[normIdx];
  const origEnd = normEnd < indexMap.length ? indexMap[normEnd] : docContent.length;

  const citationText = docContent.slice(origStart, origEnd);

  return {
    span_start: origStart,
    span_end: origEnd,
    citation_text: citationText,
  };
}

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function normalizeWithMapping(text: string): {
  normalized: string;
  indexMap: number[];
} {
  const normalized: string[] = [];
  const indexMap: number[] = [];
  let inWhitespace = false;
  let leadingWhitespace = true;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (/\s/.test(ch)) {
      if (leadingWhitespace) continue;
      if (!inWhitespace) {
        normalized.push(" ");
        indexMap.push(i);
        inWhitespace = true;
      }
    } else {
      leadingWhitespace = false;
      normalized.push(ch);
      indexMap.push(i);
      inWhitespace = false;
    }
  }

  // Remove trailing space
  const result = normalized.join("");
  if (result.endsWith(" ")) {
    return {
      normalized: result.slice(0, -1),
      indexMap: indexMap.slice(0, -1),
    };
  }

  return { normalized: result, indexMap };
}
