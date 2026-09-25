"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { icons } from "lucide-react";
import { Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-84 items-center justify-center text-sm text-gray-400">
      Loading emoji...
    </div>
  ),
});

type Props = {
  onPickEmoji: (emoji: string) => void;
  onPickIcon: (svg: SVGSVGElement, color: string) => void;
};

/** Icons are tinted from a fixed palette so the grid stays readable. */
const ICON_COLORS = [
  "#e03131",
  "#f08c00",
  "#2f9e44",
  "#1971c2",
  "#6741d9",
  "#0891b2",
  "#db2777",
];

const colorForIcon = (name: string) => {
  let hash = 0;

  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }

  return ICON_COLORS[hash % ICON_COLORS.length];
};

/** "AlarmClockCheck" -> "Alarm Clock Check" */
const humanize = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1 $2");

const PAGE_SIZE = 60;

const ICON_NAMES = Object.keys(icons);

function IconLibrary({ onPickIcon }: Pick<Props, "onPickIcon">) {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase().replace(/\s+/g, "");

    if (!needle) return ICON_NAMES;

    return ICON_NAMES.filter((name) => name.toLowerCase().includes(needle));
  }, [query]);

  // A fresh search starts from the top of the list again.
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [query]);

  // Only ~60 icons are mounted at a time; scrolling to the bottom loads more.
  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        setVisible((current) => Math.min(current + PAGE_SIZE, matches.length));
      }
    });

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [matches.length]);

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    color: string
  ) => {
    const svg = event.currentTarget.querySelector("svg");

    if (svg) onPickIcon(svg as SVGSVGElement, color);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative px-3 pb-2">
        <Search
          size={15}
          className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search icons"
          aria-label="Search icons"
          className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-8 pr-3
                     text-sm outline-none transition placeholder:text-gray-400
                     focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        {matches.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-400">
            No icons match “{query.trim()}”.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-2">
              {matches.slice(0, visible).map((name) => {
                const Icon = (icons as any)[name];
                const color = colorForIcon(name);
                const label = humanize(name);

                return (
                  <button
                    key={name}
                    type="button"
                    title={label}
                    onClick={(event) => handleClick(event, color)}
                    className="flex flex-col items-center gap-1.5 rounded-xl border
                               border-transparent p-2 transition hover:border-gray-200
                               hover:bg-gray-50 focus-visible:outline-2
                               focus-visible:outline-offset-2 focus-visible:outline-violet-500"
                  >
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${color}14`, color }}
                    >
                      <Icon size={18} />
                    </span>
                    <span className="w-full truncate text-center text-[10px] text-gray-500">
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div ref={sentinelRef} className="h-6" />
          </>
        )}
      </div>
    </div>
  );
}

function EmojiIconPanel({ onPickEmoji, onPickIcon }: Props) {
  return (
    <div className="flex h-125 w-84 flex-col">
      <header className="shrink-0 px-5 pb-3 pt-4">
        <h2 className="text-base font-semibold text-gray-900">Emoji and icons</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Choose from the picker or scroll the icon library.
        </p>
      </header>

      <Tabs
        defaultValue="emoji"
        className="flex min-h-0 flex-1 flex-col gap-3"
      >
        <TabsList className="mx-3 shrink-0">
          <TabsTrigger value="emoji" className="flex-1">
            Emoji
          </TabsTrigger>
          <TabsTrigger value="icons" className="flex-1">
            Icons
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="emoji"
          className="min-h-0 flex-1 overflow-hidden px-3 pb-3"
        >
          <EmojiPicker
            width="100%"
            height={380}
            lazyLoadEmojis
            previewConfig={{ showPreview: false }}
            onEmojiClick={(data: any) => onPickEmoji(data.emoji)}
          />
        </TabsContent>

        <TabsContent value="icons" className="min-h-0 flex-1 pb-1">
          <IconLibrary onPickIcon={onPickIcon} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default EmojiIconPanel;