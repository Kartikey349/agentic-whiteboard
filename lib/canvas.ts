import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

/**
 * Helpers for dropping new content onto the Excalidraw canvas.
 *
 * Everything lands in the middle of whatever the user is currently looking at,
 * so inserted items never appear off-screen.
 */

export type Point = { x: number; y: number };

export const getViewportCenter = (
  api: ExcalidrawImperativeAPI | null
): Point => {
  if (!api) return { x: 0, y: 0 };

  const appState: any = api.getAppState();
  const zoom = appState.zoom?.value ?? 1;

  return {
    x: -appState.scrollX + appState.width / (2 * zoom),
    y: -appState.scrollY + appState.height / (2 * zoom),
  };
};

/**
 * Top-left corner for something of this size, centred in the viewport but
 * nudged diagonally until it isn't sitting on top of an existing element.
 * Without this, everything inserted from the dock piles up in one spot.
 */
export const findFreeSpot = (
  api: ExcalidrawImperativeAPI | null,
  width: number,
  height: number
): Point => {
  const center = getViewportCenter(api);

  let x = center.x - width / 2;
  let y = center.y - height / 2;

  if (!api) return { x, y };

  const existing = api
    .getSceneElements()
    .filter((element: any) => !element.isDeleted && !element.containerId);

  const STEP = 32;
  const MAX_TRIES = 40;

  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    const overlaps = existing.some(
      (element: any) =>
        x < element.x + element.width &&
        x + width > element.x &&
        y < element.y + element.height &&
        y + height > element.y
    );

    if (!overlaps) break;

    x += STEP;
    y += STEP;
  }

  return { x, y };
};

/** Whether every one of these elements sits inside the visible canvas area. */
const isFullyVisible = (
  api: ExcalidrawImperativeAPI,
  elements: readonly any[]
) => {
  const appState: any = api.getAppState();
  const zoom = appState.zoom?.value ?? 1;

  const left = -appState.scrollX;
  const top = -appState.scrollY;
  const right = left + appState.width / zoom;
  const bottom = top + appState.height / zoom;

  return elements.every(
    (element) =>
      element.x >= left &&
      element.y >= top &&
      element.x + element.width <= right &&
      element.y + element.height <= bottom
  );
};

/**
 * Converts element skeletons into real elements, appends them to the scene and
 * selects them so the floating properties toolbar picks them up right away.
 */
export const addToScene = async (
  api: ExcalidrawImperativeAPI | null,
  skeletons: any[]
) => {
  if (!api || skeletons.length === 0) return [];

  const { convertToExcalidrawElements } = await import("@excalidraw/excalidraw");

  const created = convertToExcalidrawElements(skeletons);

  // Bound text lives inside its container, so selecting it would be a no-op.
  const selectable = created.filter((element: any) => !element.containerId);

  api.updateScene({
    elements: [...api.getSceneElements(), ...created],
    appState: {
      selectedElementIds: Object.fromEntries(
        selectable.map((element: any) => [element.id, true])
      ),
    },
  });

  // A busy canvas can push the free spot past the edge of the viewport, so
  // bring it into view rather than dropping something the user can't see.
  if (selectable.length > 0 && !isFullyVisible(api, selectable)) {
    api.scrollToContent(selectable, { fitToContent: false, animate: true });
  }

  return created;
};

/**
 * Restyles the text bound inside a container (a note).
 *
 * Patching the text element directly would leave its width/height at the old
 * font's measurements, so anything larger gets clipped by the container.
 * Rebuilding the pair through `convertToExcalidrawElements` reuses Excalidraw's
 * own text layout, which measures and re-wraps the text for the new font.
 */
export const updateBoundText = async (
  api: ExcalidrawImperativeAPI | null,
  container: any,
  text: any,
  changes: Record<string, any>
) => {
  if (!api || !container || !text) return;

  const { convertToExcalidrawElements } = await import("@excalidraw/excalidraw");

  const { boundElements, index, ...containerProps } = container;
  const merged = { ...text, ...changes };

  const [nextContainer, nextText] = convertToExcalidrawElements([
    {
      ...containerProps,
      label: {
        text: merged.text,
        fontSize: merged.fontSize,
        fontFamily: merged.fontFamily,
        strokeColor: merged.strokeColor,
        textAlign: merged.textAlign,
        verticalAlign: merged.verticalAlign,
      },
    },
  ] as any);

  // Swapped in place so the note keeps its position in the z-order.
  const elements = api.getSceneElements().map((element: any) => {
    if (element.id === container.id) return nextContainer;
    if (element.id === text.id) return nextText;
    return element;
  });

  api.updateScene({
    elements,
    appState: { selectedElementIds: { [nextContainer.id]: true } },
  });
};

/* ------------------------------------------------------------------ */
/* Emoji                                                               */
/* ------------------------------------------------------------------ */

export const insertEmoji = async (
  api: ExcalidrawImperativeAPI | null,
  emoji: string
) => {
  const size = 48;
  const spot = findFreeSpot(api, size, size);

  return addToScene(api, [
    {
      type: "text",
      text: emoji,
      x: spot.x,
      y: spot.y,
      fontSize: size,
      fontFamily: 2,
    },
  ]);
};

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */

const svgToDataURL = (svg: string) =>
  `data:image/svg+xml;base64,${btoa(
    // Keeps `btoa` safe if an icon ever contains a non-latin1 character.
    String.fromCharCode(...new TextEncoder().encode(svg))
  )}`;

/**
 * Takes the SVG node lucide already rendered in the picker, restyles a copy of
 * it, and drops it on the canvas as an image element.
 */
export const insertSvgIcon = async (
  api: ExcalidrawImperativeAPI | null,
  source: SVGSVGElement,
  color: string
) => {
  if (!api) return [];

  const svg = source.cloneNode(true) as SVGSVGElement;

  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("width", "96");
  svg.setAttribute("height", "96");
  svg.setAttribute("stroke", color);
  svg.removeAttribute("class");

  const dataURL = svgToDataURL(new XMLSerializer().serializeToString(svg));
  const fileId = crypto.randomUUID();
  const size = 96;
  const spot = findFreeSpot(api, size, size);

  api.addFiles([
    {
      id: fileId as any,
      dataURL: dataURL as any,
      mimeType: "image/svg+xml",
      created: Date.now(),
    },
  ]);

  return addToScene(api, [
    {
      type: "image",
      fileId,
      x: spot.x,
      y: spot.y,
      width: size,
      height: size,
    },
  ]);
};

/* ------------------------------------------------------------------ */
/* Notes                                                               */
/* ------------------------------------------------------------------ */

export type NoteStyleId = "sticky" | "glass" | "task";

type NoteStyle = {
  id: NoteStyleId;
  name: string;
  description: string;
  width: number;
  height: number;
  /** Colours, shared by the canvas element and the picker's preview swatch. */
  card: string;
  border: string;
  /** Colour the text you type into the note gets. */
  text: string;
  /** 1 = hand-drawn, 2 = normal, 3 = mono. */
  fontFamily: number;
  fontSize: number;
  /** 1 = sketchy edges, 0 = clean edges. */
  roughness: number;
};

/**
 * A note is deliberately ONE element, not a group: a single rectangle is
 * selectable in one click (so the properties toolbar picks it up) and opens its
 * text editor on one double-click. Grouping it with decorations would cost an
 * extra double-click just to get into the group before you could type.
 */
export const NOTE_STYLES: NoteStyle[] = [
  {
    id: "sticky",
    name: "Sticky Note",
    description: "Warm idea card",
    width: 260,
    height: 220,
    card: "#fef3c7",
    border: "#f59e0b",
    text: "#92400e",
    fontFamily: 1,
    fontSize: 20,
    roughness: 1,
  },
  {
    id: "glass",
    name: "Glass Note",
    description: "Polished meeting note",
    width: 280,
    height: 200,
    card: "#eff6ff",
    border: "#3b82f6",
    text: "#1e3a8a",
    fontFamily: 2,
    fontSize: 16,
    roughness: 0,
  },
  {
    id: "task",
    name: "Task Card",
    description: "Structured checklist tile",
    width: 280,
    height: 210,
    card: "#ecfdf5",
    border: "#10b981",
    text: "#065f46",
    fontFamily: 2,
    fontSize: 16,
    roughness: 0,
  },
];

/**
 * Text typed into a note is a brand new element, so it picks up Excalidraw's
 * "current item" defaults rather than anything we set on the note. We point
 * those defaults at the note's own styling for the length of the edit, then put
 * the user's own defaults back so the next shape they draw is unaffected.
 */
let defaultsToRestore: Record<string, any> | null = null;

const useNoteTextDefaults = (
  api: ExcalidrawImperativeAPI,
  style: NoteStyle
) => {
  const appState: any = api.getAppState();

  // Only the first note in a run captures the baseline; a second note opened
  // while the first is still being edited must not capture the first's colours.
  if (!defaultsToRestore) {
    defaultsToRestore = {
      currentItemStrokeColor: appState.currentItemStrokeColor,
      currentItemFontFamily: appState.currentItemFontFamily,
      currentItemFontSize: appState.currentItemFontSize,
      currentItemTextAlign: appState.currentItemTextAlign,
    };
  }

  api.updateScene({
    appState: {
      currentItemStrokeColor: style.text,
      currentItemFontFamily: style.fontFamily,
      currentItemFontSize: style.fontSize,
      currentItemTextAlign: "center",
    },
  } as any);
};

/**
 * Puts the user's own drawing defaults back once the note's text editor has
 * closed. Driven from onChange rather than a timer, so it keys off Excalidraw's
 * own "nothing is being edited" state instead of guessing.
 */
export const restoreNoteTextDefaults = (
  api: ExcalidrawImperativeAPI | null,
  appState: any
) => {
  if (!api || !defaultsToRestore || appState?.editingTextElement) return;

  const previous = defaultsToRestore;
  defaultsToRestore = null;

  api.updateScene({ appState: previous } as any);
};

/**
 * Opens the note's text editor straight away by replaying a double-click at its
 * centre, so you can type immediately instead of hunting for the right gesture.
 * Best-effort: if the canvas isn't where we expect it, the note is still
 * selected and a double-click does the same thing by hand.
 */
const startTextEditing = (
  api: ExcalidrawImperativeAPI | null,
  element: any
) => {
  if (!api || !element) return;

  const canvas = document.querySelector<HTMLCanvasElement>(
    ".excalidraw canvas.interactive"
  );

  if (!canvas) return;

  const bounds = canvas.getBoundingClientRect();
  const appState: any = api.getAppState();
  const zoom = appState.zoom?.value ?? 1;

  const clientX =
    bounds.left + (element.x + element.width / 2 + appState.scrollX) * zoom;
  const clientY =
    bounds.top + (element.y + element.height / 2 + appState.scrollY) * zoom;

  // Only the double click. Synthesising pointerdown/up here would make
  // Excalidraw call setPointerCapture with a pointer id that never existed,
  // which throws.
  canvas.dispatchEvent(
    new MouseEvent("dblclick", {
      bubbles: true,
      cancelable: true,
      detail: 2,
      clientX,
      clientY,
      view: window,
    })
  );
};

export const insertNote = async (
  api: ExcalidrawImperativeAPI | null,
  styleId: NoteStyleId
) => {
  const style = NOTE_STYLES.find((item) => item.id === styleId);

  if (!api || !style) return [];

  const spot = findFreeSpot(api, style.width, style.height);

  // Applied before the insert so it has committed by the time the text editor
  // opens below; the note's own styling is what the typed text picks up.
  useNoteTextDefaults(api, style);

  const created = await addToScene(api, [
    {
      type: "rectangle",
      x: spot.x,
      y: spot.y,
      width: style.width,
      height: style.height,
      backgroundColor: style.card,
      strokeColor: style.border,
      fillStyle: "solid",
      strokeWidth: 1,
      roughness: style.roughness,
      roundness: { type: 3 },
      customData: { note: style.id },
    },
  ]);

  // No placeholder text to delete first: the note opens empty with its own
  // text styling active, so the first thing typed is the note's content.
  startTextEditing(
    api,
    created.find((element: any) => element.type === "rectangle")
  );

  return created;
};