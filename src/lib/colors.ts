export interface CitationColor {
  name: string;
  bg: string;
  border: string;
  text: string;
  hex: string;
}

export const CITATION_COLORS: CitationColor[] = [
  { name: "amber", bg: "bg-amber-500/15", border: "border-amber-500/50", text: "text-amber-400", hex: "#f59e0b" },
  { name: "cyan", bg: "bg-cyan-500/15", border: "border-cyan-500/50", text: "text-cyan-400", hex: "#06b6d4" },
  { name: "violet", bg: "bg-violet-500/15", border: "border-violet-500/50", text: "text-violet-400", hex: "#8b5cf6" },
  { name: "emerald", bg: "bg-emerald-500/15", border: "border-emerald-500/50", text: "text-emerald-400", hex: "#10b981" },
  { name: "rose", bg: "bg-rose-500/15", border: "border-rose-500/50", text: "text-rose-400", hex: "#f43f5e" },
  { name: "orange", bg: "bg-orange-500/15", border: "border-orange-500/50", text: "text-orange-400", hex: "#f97316" },
];

export function getCitationColor(index: number): CitationColor {
  return CITATION_COLORS[index % CITATION_COLORS.length];
}
