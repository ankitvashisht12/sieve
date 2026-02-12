"use client";

import { useState } from "react";
import { Toolbar } from "./Toolbar";
import { Sidebar } from "./Sidebar";
import { DetailPanel } from "./DetailPanel";
import { SourceViewer } from "./SourceViewer";
import { KeyboardHandler } from "./KeyboardHandler";

export function ReviewScreen() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen flex-col bg-[#080f0b]">
      <Toolbar />
      <div className="flex min-h-0 flex-1">
        {/* Sidebar */}
        <div
          className="relative flex-shrink-0 transition-[width] duration-200"
          style={{ width: sidebarOpen ? "16.5vw" : 0 }}
        >
          <div className="h-full overflow-hidden" style={{ width: "16.5vw" }}>
            <Sidebar />
          </div>
        </div>

        {/* Toggle button */}
        <div className="relative flex-shrink-0 w-[2px] bg-[#2a2a2a]">
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="absolute top-1/2 -translate-y-1/2 -left-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[#2a2a2a] bg-[#0d1a14] text-[#8a8a8a] hover:text-[#4ade80] hover:border-[#4ade80] transition-colors"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? "\u2039" : "\u203A"}
          </button>
        </div>

        {/* Detail + Source split evenly */}
        <div className="flex min-w-0 flex-1">
          <div className="flex-1 min-w-0 overflow-hidden border-r border-[#2a2a2a]">
            <DetailPanel />
          </div>
          <div className="flex-1 min-w-0 overflow-hidden">
            <SourceViewer />
          </div>
        </div>
      </div>
      <KeyboardHandler />
    </div>
  );
}
