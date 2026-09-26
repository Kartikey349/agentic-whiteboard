"use client";

import React, { useEffect, useRef, useState } from "react";
import { Smile, Sparkles, StickyNote } from "lucide-react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import NotesPanel from "./NotesPanel";
import EmojiIconPanel from "./EmojiIconPanel";
import { insertEmoji, insertNote, insertSvgIcon, NoteStyleId } from "@/lib/canvas";

type Props = {
  excalidrawApi: ExcalidrawImperativeAPI | null;
  aiOpen: boolean;
  onToggleAi: () => void;
};

type PanelId = "notes" | "emoji" | null;

/**
 * Bottom-centre dock: notes, emoji/icons and the AI helper.
 * Notes and emoji open a popover above the dock; AI toggles the side panel.
 */
function CanvasDock({ excalidrawApi, aiOpen, onToggleAi }: Props) {
  const [panel, setPanel] = useState<PanelId>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const togglePanel = (id: Exclude<PanelId, null>) =>
    setPanel((current) => (current === id ? null : id));

  // Close on outside click / Escape, the way a popover is expected to behave.
  useEffect(() => {
    if (!panel) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setPanel(null);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanel(null);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [panel]);

  const handleNote = async (styleId: NoteStyleId) => {
    await insertNote(excalidrawApi, styleId);
    setPanel(null);
  };

  const handleEmoji = async (emoji: string) => {
    await insertEmoji(excalidrawApi, emoji);
    setPanel(null);
  };

  const handleIcon = async (svg: SVGSVGElement, color: string) => {
    await insertSvgIcon(excalidrawApi, svg, color);
    setPanel(null);
  };

  const disabled = !excalidrawApi;

  return (
    <div
      ref={containerRef}
      className="absolute bottom-6 left-1/2 z-50 -translate-x-1/2"
    >
      {/* Popover */}
      {panel && (
        <div
          role="dialog"
          aria-label={panel === "notes" ? "Add notes" : "Emoji and icons"}
          className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2
                     overflow-hidden rounded-2xl border border-gray-200 bg-white
                     dark:bg-gray-900
                     shadow-2xl shadow-gray-900/10"
        >
          {panel === "notes" ? (
            <NotesPanel onPick={handleNote} />
          ) : (
            <EmojiIconPanel onPickEmoji={handleEmoji} onPickIcon={handleIcon} />
          )}
        </div>
      )}

      {/* Dock */}
      <div
        className="flex items-center gap-1 rounded-full border border-gray-200
                   bg-white/90 p-1.5 shadow-xl shadow-gray-900/10 backdrop-blur
                   dark:bg-gray-900"
      >
        <DockButton
          icon={StickyNote}
          label="Notes"
          active={panel === "notes"}
          disabled={disabled}
          onClick={() => togglePanel("notes")}
        />

        <DockButton
          icon={Smile}
          label="Emoji"
          active={panel === "emoji"}
          disabled={disabled}
          onClick={() => togglePanel("emoji")}
        />

        <button
          type="button"
          aria-pressed={aiOpen}
          disabled={disabled}
          onClick={() => {
            setPanel(null);
            onToggleAi();
          }}
          className={`flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600
                      to-indigo-600 px-4 py-2 text-sm font-medium text-white transition
                      hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50
                      focus-visible:outline-2 
                      focus-visible:outline-offset-2
                      focus-visible:outline-violet-500
                      ${aiOpen ? "ring-2 ring-violet-300" : ""}`}
        >
          <Sparkles size={15} />
          AI Helper
        </button>
      </div>
    </div>
  );
}

function DockButton({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-expanded={active}
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium
                  text-gray-700 transition hover:bg-gray-100 disabled:opacity-50
                  focus-visible:outline-2focus-visible:outline-offset-2
                  focus-visible:outline-violet-500
                  ${active ? "bg-gray-100 text-gray-900" : ""}`}
    >
      <Icon size={15} className="text-gray-500" />
      {label}
    </button>
  );
}

export default CanvasDock;