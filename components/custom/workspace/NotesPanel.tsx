"use client";

import React from "react";
import { NOTE_STYLES, NoteStyleId } from "@/lib/canvas";

type Props = {
  onPick: (styleId: NoteStyleId) => void;
};

/**
 * Blank note styles. Each swatch is a miniature of what lands on the canvas.
 */
function NotesPanel({ onPick }: Props) {
  return (
    <div className="w-78">
      <header className="px-5 pb-3 pt-4">
        <h2 className="text-base font-semibold text-gray-900">Add notes</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Pick a blank note style for the whiteboard.
        </p>
      </header>

      <div className="flex flex-col gap-2 px-3 pb-3">
        {NOTE_STYLES.map((style) => (
          <button
            key={style.id}
            type="button"
            onClick={() => onPick(style.id)}
            className="group flex items-center gap-3 rounded-xl border border-gray-200
                       bg-white p-2.5 text-left transition hover:border-gray-300
                       hover:bg-gray-50 focus-visible:outline-2
                       focus-visible:outline-offset-2 focus-visible:outline-violet-500"
          >
            {/* Miniature of the note */}
            <span
              aria-hidden
              className="flex h-14 w-16 shrink-0 items-center justify-center rounded-lg
                         border text-xs transition group-hover:scale-[1.03]"
              style={{
                backgroundColor: style.card,
                borderColor: style.border,
                color: style.text,
                fontFamily:
                  style.fontFamily === 1 ? "cursive" : "ui-sans-serif, sans-serif",
              }}
            >
              Aa
            </span>

            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-gray-900">
                {style.name}
              </span>
              <span className="block truncate text-xs text-gray-500">
                {style.description}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default NotesPanel;