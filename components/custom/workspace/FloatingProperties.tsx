"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpToLine,
  Circle,
  Copy,
  Diamond,
  Droplet,
  GripVertical,
  Lock,
  Minus,
  MoreHorizontal,
  Palette,
  Pencil,
  Square,
  Trash2,
  Type,
  Unlock,
  X,
} from "lucide-react";

type Props = {
  selectedElement: any;
  /** Text bound inside the selected shape (a note's text), if any. */
  boundText?: any;
  onTextPropertyChange?: (property: string, value: any) => void;
  position: {
    left: number;
    top: number;
  };

  onDelete?: () => void;
  onDuplicate?: () => void;
  onLock?: () => void;

  onBringToFront?: () => void;
  onSendToBack?: () => void;

  onPropertyChange?: (property: string, value: any) => void;
};

const COLORS = [
  "#1e1e1e",
  "#e03131",
  "#f08c00",
  "#2f9e44",
  "#1971c2",
  "#6741d9",
];

const STROKE_STYLES = [
  { value: "solid", label: "——————" },
  { value: "dashed", label: "- - - - -" },
  { value: "dotted", label: "· · · · · ·" },
];

const STROKE_WIDTHS = [
  { value: 1, label: "1 px — Thin" },
  { value: 2, label: "2 px — Medium" },
  { value: 4, label: "4 px — Bold" },
];

const FONT_FAMILIES = [
  { value: 1, label: "Hand" },
  { value: 2, label: "Normal" },
  { value: 3, label: "Mono" },
];

const FONT_SIZES = [
  { value: 16, label: "16 px" },
  { value: 20, label: "20 px" },
  { value: 28, label: "28 px" },
  { value: 36, label: "36 px" },
];

const TEXT_ALIGNS = [
  { value: "left", icon: AlignLeft },
  { value: "center", icon: AlignCenter },
  { value: "right", icon: AlignRight },
];

function FloatingProperties({
  selectedElement,
  boundText,
  onTextPropertyChange,
  position,

  onDelete,
  onDuplicate,
  onLock,

  onBringToFront,
  onSendToBack,

  onPropertyChange,
}: Props) {
  const [dragOffset, setDragOffset] = useState({
    x: 0,
    y: 0,
  });

  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const dragRef = useRef<{ startX: number; startY: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Reset panel + drag when selection changes
  useEffect(() => {
    setOpenPanel(null);
    setDragOffset({ x: 0, y: 0 });
  }, [selectedElement?.id]);

  // Close popovers on outside click
  useEffect(() => {
    if (!openPanel) return;

    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpenPanel(null);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [openPanel]);

  // Panel dragging
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      setDragOffset({
        x: e.clientX - dragRef.current.startX,
        y: e.clientY - dragRef.current.startY,
      });
    };

    const onUp = () => {
      dragRef.current = null;
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, []);

  if (!selectedElement) return null;

  const type = selectedElement.type;

  const isText = type === "text";
  const isShape = ["rectangle", "ellipse", "diamond"].includes(type);
  const isLine = type === "line";
  const isArrow = type === "arrow";
  const isFreeDraw = type === "freedraw";
  const hasFill = isShape;
  const hasStroke = isShape || isLine || isArrow || isFreeDraw;

  // Either a plain text element, or the text bound inside a note. Both get the
  // same font / size / alignment / colour controls.
  const textElement = isText ? selectedElement : boundText;
  const hasText = !!textElement;

  const setTextProperty = (property: string, value: any) =>
    isText
      ? onPropertyChange?.(property, value)
      : onTextPropertyChange?.(property, value);

  const togglePanel = (name: string) => {
    setOpenPanel((current) => (current === name ? null : name));
  };

  const TypeIcon = isText
    ? Type
    : type === "rectangle"
      ? Square
      : type === "ellipse"
        ? Circle
        : type === "diamond"
          ? Diamond
          : isArrow
            ? ArrowRight
            : isLine
              ? Minus
              : Pencil;

  return (
    <div
      ref={rootRef}
      className="absolute z-100 -translate-x-1/2"
      style={{
        left: position.left + dragOffset.x,
        top: position.top + dragOffset.y,
      }}
    >
      {/* ---------------- TOOLBAR ---------------- */}
      <div className="flex items-center gap-0.5 rounded-2xl border border-gray-200 bg-white px-1.5 py-1.5 shadow-lg">
        <span
          className="flex h-9 w-6 cursor-grab items-center justify-center text-gray-300 active:cursor-grabbing"
          onMouseDown={(e) => {
            dragRef.current = {
              startX: e.clientX - dragOffset.x,
              startY: e.clientY - dragOffset.y,
            };
          }}
        >
          <GripVertical size={16} />
        </span>

        <IconButton active title={type}>
          <TypeIcon size={17} />
        </IconButton>

        <IconButton
          title="Color"
          active={openPanel === "color"}
          onClick={() => togglePanel("color")}
        >
          <Palette size={17} />
          <span
            className="absolute bottom-1 h-0.75 w-4 rounded-full"
            style={{ background: selectedElement.strokeColor }}
          />
        </IconButton>

        {hasFill && (
          <IconButton
            title="Fill"
            active={openPanel === "fill"}
            onClick={() => togglePanel("fill")}
          >
            <Droplet size={17} />
          </IconButton>
        )}

        {hasText && (
          <IconButton
            title="Alignment"
            active={openPanel === "align"}
            onClick={() => togglePanel("align")}
          >
            <AlignLeft size={17} />
          </IconButton>
        )}

        {(isLine || isArrow || isFreeDraw) && (
          <IconButton
            title="Width"
            active={openPanel === "width"}
            onClick={() => togglePanel("width")}
          >
            <Minus size={17} />
          </IconButton>
        )}

        <Divider />

        <IconButton title="Duplicate" onClick={() => onDuplicate?.()}>
          <Copy size={17} />
        </IconButton>

        <IconButton title="Lock" onClick={() => onLock?.()}>
          {selectedElement.locked ? <Unlock size={17} /> : <Lock size={17} />}
        </IconButton>

        <IconButton title="Delete" danger onClick={() => onDelete?.()}>
          <Trash2 size={17} />
        </IconButton>

        <Divider />

        <IconButton
          title="More options"
          active={openPanel === "more"}
          onClick={() => togglePanel("more")}
        >
          <MoreHorizontal size={17} />
        </IconButton>
      </div>

      {/* ---------------- QUICK POPOVERS ---------------- */}
      {openPanel === "color" && (
        <Popover>
          <SectionLabel>{isText ? "Text color" : "Stroke color"}</SectionLabel>
          <Swatches
            colors={COLORS}
            selected={selectedElement.strokeColor}
            onPick={(color) => onPropertyChange?.("strokeColor", color)}
          />

          {/* A note has its own text inside it, coloured separately. */}
          {hasText && !isText && (
            <div className="mt-3">
              <SectionLabel>Text color</SectionLabel>
              <Swatches
                colors={COLORS}
                selected={textElement.strokeColor}
                onPick={(color) => setTextProperty("strokeColor", color)}
              />
            </div>
          )}
        </Popover>
      )}

      {openPanel === "fill" && (
        <Popover>
          <SectionLabel>Fill</SectionLabel>
          <Swatches
            colors={COLORS}
            selected={selectedElement.backgroundColor}
            onPick={(color) => onPropertyChange?.("backgroundColor", color)}
            onClear={() => onPropertyChange?.("backgroundColor", "transparent")}
          />
        </Popover>
      )}

      {openPanel === "align" && hasText && (
        <Popover>
          <SectionLabel>Alignment</SectionLabel>
          <div className="flex gap-2">
            {TEXT_ALIGNS.map(({ value, icon: Icon }) => (
              <OptionButton
                key={value}
                active={textElement.textAlign === value}
                onClick={() => setTextProperty("textAlign", value)}
              >
                <Icon size={16} />
              </OptionButton>
            ))}
          </div>

          <div className="mt-3">
            <SectionLabel>Size</SectionLabel>
            <Select
              value={textElement.fontSize ?? 20}
              options={FONT_SIZES}
              onChange={(v) => setTextProperty("fontSize", Number(v))}
            />
          </div>
        </Popover>
      )}

      {openPanel === "width" && (
        <Popover>
          <SectionLabel>Stroke width</SectionLabel>
          <Select
            value={selectedElement.strokeWidth ?? 2}
            options={STROKE_WIDTHS}
            onChange={(v) => onPropertyChange?.("strokeWidth", Number(v))}
          />
        </Popover>
      )}

      {/* ---------------- FULL OPTIONS PANEL ---------------- */}
      {openPanel === "more" && (
        <Popover width={310}>
          <div className="flex items-center justify-between px-1 pb-3">
            <h3 className="text-sm font-semibold text-gray-800">
              {isText
                ? "Text options"
                : isShape
                  ? "Shape options"
                  : isArrow
                    ? "Arrow options"
                    : isLine
                      ? "Line options"
                      : "Options"}
            </h3>
            <button
              className="rounded p-1 text-gray-400 hover:bg-gray-100"
              onClick={() => setOpenPanel(null)}
            >
              <X size={15} />
            </button>
          </div>

          <Section>
            <div className="flex gap-2">
              <OptionButton wide onClick={() => onBringToFront?.()}>
                <ArrowUpToLine size={15} />
                Bring front
              </OptionButton>
              <OptionButton wide onClick={() => onSendToBack?.()}>
                <ArrowDownToLine size={15} />
                Send back
              </OptionButton>
            </div>
          </Section>

          {hasText && (
            <>
              <Section>
                <SectionLabel>Font</SectionLabel>
                <div className="flex gap-2">
                  {FONT_FAMILIES.map((f) => (
                    <OptionButton
                      key={f.value}
                      wide
                      active={textElement.fontFamily === f.value}
                      onClick={() => setTextProperty("fontFamily", f.value)}
                    >
                      {f.label}
                    </OptionButton>
                  ))}
                </div>
              </Section>

              <Section>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <SectionLabel>Size</SectionLabel>
                    <Select
                      value={textElement.fontSize ?? 20}
                      options={FONT_SIZES}
                      onChange={(v) => setTextProperty("fontSize", Number(v))}
                    />
                  </div>

                  <div className="flex-1">
                    <SectionLabel>Alignment</SectionLabel>
                    <div className="flex gap-2">
                      {TEXT_ALIGNS.map(({ value, icon: Icon }) => (
                        <OptionButton
                          key={value}
                          active={textElement.textAlign === value}
                          onClick={() => setTextProperty("textAlign", value)}
                        >
                          <Icon size={15} />
                        </OptionButton>
                      ))}
                    </div>
                  </div>
                </div>
              </Section>

              <Section>
                <SectionLabel>Text color</SectionLabel>
                <Swatches
                  colors={COLORS}
                  selected={textElement.strokeColor}
                  onPick={(color) => setTextProperty("strokeColor", color)}
                />
              </Section>
            </>
          )}

          {hasStroke && !isText && (
            <Section>
              <div className="flex items-center justify-between">
                <SectionLabel>Stroke</SectionLabel>
                <span className="text-xs text-gray-400">Style &amp; width</span>
              </div>

              <div className="mb-3 flex gap-2">
                {STROKE_STYLES.map((s) => (
                  <OptionButton
                    key={s.value}
                    wide
                    active={selectedElement.strokeStyle === s.value}
                    onClick={() => onPropertyChange?.("strokeStyle", s.value)}
                  >
                    {s.label}
                  </OptionButton>
                ))}
              </div>

              <Select
                value={selectedElement.strokeWidth ?? 2}
                options={STROKE_WIDTHS}
                onChange={(v) => onPropertyChange?.("strokeWidth", Number(v))}
              />
            </Section>
          )}

          {hasFill && (
            <Section>
              <SectionLabel>Fill</SectionLabel>
              <Swatches
                colors={COLORS}
                selected={selectedElement.backgroundColor}
                onPick={(color) => onPropertyChange?.("backgroundColor", color)}
                onClear={() =>
                  onPropertyChange?.("backgroundColor", "transparent")
                }
              />
            </Section>
          )}

          {(isLine || isArrow || isFreeDraw) && (
            <Section>
              <SectionLabel>Color</SectionLabel>
              <Swatches
                colors={COLORS}
                selected={selectedElement.strokeColor}
                onPick={(color) => onPropertyChange?.("strokeColor", color)}
              />
            </Section>
          )}

          <Section last>
            <div className="flex items-center justify-between">
              <SectionLabel>Opacity</SectionLabel>
              <span className="text-xs text-gray-400">
                {selectedElement.opacity ?? 100}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={10}
              value={selectedElement.opacity ?? 100}
              onChange={(e) =>
                onPropertyChange?.("opacity", Number(e.target.value))
              }
              className="w-full accent-blue-600"
            />
          </Section>
        </Popover>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   Small presentational pieces
   ------------------------------------------------------------------ */

function IconButton({
  children,
  onClick,
  active,
  danger,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  danger?: boolean;
  title?: string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition
        ${danger ? "text-red-500 hover:bg-red-50" : "text-gray-700 hover:bg-gray-100"}
        ${active ? "bg-gray-100" : ""}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-6 w-px bg-gray-200" />;
}

function Popover({
  children,
  width = 280,
}: {
  children: React.ReactNode;
  width?: number;
}) {
  return (
    <div
      className="mt-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-xl"
      style={{ width }}
    >
      {children}
    </div>
  );
}

function Section({
  children,
  last,
}: {
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={last ? "px-1 py-3" : "border-b border-gray-100 px-1 py-3"}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-2 text-xs font-medium text-gray-600">{children}</p>;
}

function OptionButton({
  children,
  onClick,
  active,
  wide,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  wide?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-9 items-center justify-center gap-1.5 rounded-lg border text-xs transition
        ${wide ? "flex-1 px-2" : "w-9"}
        ${
          active
            ? "border-blue-200 bg-blue-50 text-blue-700"
            : "border-gray-200 text-gray-700 hover:bg-gray-50"
        }`}
    >
      {children}
    </button>
  );
}

function Select({
  value,
  options,
  onChange,
}: {
  value: any;
  options: { value: any; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none focus:border-blue-300"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Swatches({
  colors,
  selected,
  onPick,
  onClear,
}: {
  colors: string[];
  selected?: string;
  onPick: (color: string) => void;
  onClear?: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onPick(color)}
          style={{ background: color }}
          className={`h-8 w-8 rounded-lg border transition
            ${selected === color ? "ring-2 ring-blue-400 ring-offset-1" : "border-gray-200"}`}
        />
      ))}

      {onClear && (
        <button
          onClick={onClear}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export default FloatingProperties;