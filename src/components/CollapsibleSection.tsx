"use client";

import { useState } from "react";

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-1.5 py-1 text-xs font-medium text-[#8a8a8a] transition-colors hover:text-[#e0e0e0]"
      >
        <span
          className={`text-[10px] transition-transform ${isOpen ? "rotate-90" : ""}`}
        >
          &#9654;
        </span>
        {title}
      </button>
      {isOpen && <div className="pl-4 pt-1">{children}</div>}
    </div>
  );
}
