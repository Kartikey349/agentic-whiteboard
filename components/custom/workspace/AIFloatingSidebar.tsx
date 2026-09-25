"use client"
import axios from "axios";
import {
  CornerDownLeft,
  Loader2,
  Monitor,
  Network,
  PencilRuler,
  Smartphone,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";

type Props = {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
  onClose?: () => void;
};

const AI_TOOLS = [
  {
    id: "diagram",
    name: "Diagram",
    desc: "Boxes and connections from a description",
    icon: PencilRuler,
    accent: "text-blue-600",
    tint: "bg-blue-50",
    selected: "border-blue-200 bg-blue-50/70",
    placeholder:
      "Eg. Client sends a request to the API, which reads from a cache before hitting the database",
    prompt:
      "Generate a clear labelled diagram. Use rectangles for entities and arrows for relationships. Keep labels short.",
  },
  {
    id: "flowchart",
    name: "Flowchart",
    desc: "Steps and decision points in order",
    icon: Workflow,
    accent: "text-violet-600",
    tint: "bg-violet-50",
    selected: "border-violet-200 bg-violet-50/70",
    placeholder:
      "Eg. Customer onboarding, branching on whether their email is already registered",
    prompt:
      "Generate a top-to-bottom flowchart. Use rectangles for steps, diamonds for decisions, and label every branch arrow with its condition.",
  },
  {
    id: "architecture",
    name: "Architecture",
    desc: "Services, storage, and how they connect",
    icon: Network,
    accent: "text-orange-600",
    tint: "bg-orange-50",
    selected: "border-orange-200 bg-orange-50/70",
    placeholder:
      "Eg. Next.js frontend, Postgres, a queue worker, and an S3 bucket for uploads",
    prompt:
      "Generate a system architecture diagram. Group related services, show data stores distinctly, and label the arrows with the protocol or data passed.",
  },
  {
    id: "web-mockup",
    name: "Web mockup",
    desc: "Page layout and wireframe blocks",
    icon: Monitor,
    accent: "text-cyan-600",
    tint: "bg-cyan-50",
    selected: "border-cyan-200 bg-cyan-50/70",
    placeholder:
      "Eg. Pricing page with three plan columns and a comparison table underneath",
    prompt:
      "Generate a desktop web wireframe. Use plain rectangles for layout blocks and short text labels. No decoration or colour beyond greys.",
  },
  {
    id: "mobile-mockup",
    name: "Mobile mockup",
    desc: "App screens and navigation",
    icon: Smartphone,
    accent: "text-pink-600",
    tint: "bg-pink-50",
    selected: "border-pink-200 bg-pink-50/70",
    placeholder:
      "Eg. Sign-up flow across three screens, ending on a home feed with a tab bar",
    prompt:
      "Generate mobile app wireframes as tall narrow phone frames placed side by side. Show navigation between screens with arrows.",
  },
];

const MAX_PROMPT = 400;
export const AIFloatingSidebar = ({excalidrawAPI, onClose} : Props) => {

    const [selectedTool, setSelectedTool] = useState("diagram")
    const [loading, setLoading] = useState(false)
    const [userInput, setUserInput] = useState("")

    const currentAiTool =
    AI_TOOLS.find((tool) => tool.id === selectedTool) ?? AI_TOOLS[0];
    const [error, setError] = useState<string | null>(null);
    const canGenerate = userInput.trim().length > 0 && !loading;


    const getEmptyCanvasPosition = () => {
        if(!excalidrawAPI){
            return {x: 100, y:100}
        }

        const elements = excalidrawAPI.getSceneElements()

        if(elements.length === 0){
            return {x: 100, y:100}
        }

        const maxRight = Math.max(...elements.map((element) => element.x + element.width))
        const minTop = Math.min(...elements.map((element) => element.y))

        return {
            x : maxRight + 150,
            y : minTop
        }
    }

    const addAiPlaceholder = () => {
        if (!excalidrawAPI) return null;

        const position = getEmptyCanvasPosition()

        const placeholderElement = convertToExcalidrawElements([{
            type: "rectangle",
            customData: { aiPlaceholder: true },
            x: position.x,
            y: position.y,
            width: 420,
            height: 250,
            backgroundColor: "#f5f3ff",
            strokeColor: "#8b5cf6",
            fillStyle: "solid",
            strokeWidth: 2,
            roughness: 0,
            roundness: {
            type: 3,
            },
        },
        {
            type: "text",
            customData: { aiPlaceholder: true },
            x: position.x + 28,
            y: position.y + 28,
            text: "✦ Generating with AI",
            fontSize: 22,
            strokeColor: "#6d28d9",
        },
        {
            type: "text",
            customData: { aiPlaceholder: true },
            x: position.x + 28,
            y: position.y + 65,
            text: "Preparing your diagram...",
            fontSize: 15,
            strokeColor: "#6b7280",
        },
        {
            type: "rectangle",
            customData: { aiPlaceholder: true },
            x: position.x + 28,
            y: position.y + 115,
            width: 250,
            height: 18,
            backgroundColor: "#ddd6fe",
            strokeColor: "#ddd6fe",
            fillStyle: "solid",
            roughness: 0,
            roundness: {
            type: 3,
            },
        },
        {
            type: "rectangle",
            customData: { aiPlaceholder: true },
            x: position.x + 28,
            y: position.y + 150,
            width: 330,
            height: 18,
            backgroundColor: "#ede9fe",
            strokeColor: "#ede9fe",
            fillStyle: "solid",
            roughness: 0,
            roundness: {
            type: 3,
            },
        },
        {
            type: "rectangle",
            customData: { aiPlaceholder: true },
            x: position.x + 28,
            y: position.y + 185,
            width: 190,
            height: 18,
            backgroundColor: "#ddd6fe",
            strokeColor: "#ddd6fe",
            fillStyle: "solid",
            roughness: 0,
            roundness: {
            type: 3,
            },
        }])

        const currentElement = excalidrawAPI.getSceneElements()

        excalidrawAPI.updateScene({
            elements: [
                ...currentElement,
                ...placeholderElement
            ]
        })
    }

    const getConnectionPoints = (
  fromNode: any,
  toNode: any,
  origin: {
    x: number;
    y: number;
  }
) => {
  const fromX =
    origin.x + Number(fromNode.x || 0);

  const fromY =
    origin.y + Number(fromNode.y || 0);

  const fromWidth =
    Number(fromNode.width || 200);

  const fromHeight =
    Number(fromNode.height || 80);

  const toX =
    origin.x + Number(toNode.x || 0);

  const toY =
    origin.y + Number(toNode.y || 0);

  const toWidth =
    Number(toNode.width || 200);

  const toHeight =
    Number(toNode.height || 80);

  const fromCenterX =
    fromX + fromWidth / 2;

  const fromCenterY =
    fromY + fromHeight / 2;

  const toCenterX =
    toX + toWidth / 2;

  const toCenterY =
    toY + toHeight / 2;

  const dx = toCenterX - fromCenterX;
  const dy = toCenterY - fromCenterY;

  // Horizontal connection
  if (Math.abs(dx) >= Math.abs(dy)) {
    if (dx >= 0) {
      return {
        startX: fromX + fromWidth,
        startY: fromCenterY,
        endX: toX,
        endY: toCenterY,
      };
    }

    return {
      startX: fromX,
      startY: fromCenterY,
      endX: toX + toWidth,
      endY: toCenterY,
    };
  }

  // Vertical connection
  if (dy >= 0) {
    return {
      startX: fromCenterX,
      startY: fromY + fromHeight,
      endX: toCenterX,
      endY: toY,
    };
  }

  return {
    startX: fromCenterX,
    startY: fromY,
    endX: toCenterX,
    endY: toY + toHeight,
  };
};
    
const renderWebMockup = (data: any) => {
  if (!excalidrawAPI) return;

  const components = Array.isArray(data?.components)
    ? data.components
    : [];

  if (components.length === 0) {
    throw new Error(
      "AI returned no web components"
    );
  }

  const position =
    getEmptyCanvasPosition();

  const skeletonElements: any[] = [];

  // =========================================
  // BROWSER
  // =========================================

  const browserWidth = 900;
  const browserHeight = 600;
  const browserHeader = 50;

  // Browser body
  skeletonElements.push({
    type: "rectangle",

    x: position.x,
    y: position.y,

    width: browserWidth,
    height: browserHeight,

    backgroundColor: "#ffffff",

    strokeColor: "#111827",

    fillStyle: "solid",

    strokeWidth: 2,

    roughness: 0,

    roundness: {
      type: 3,
    },
  });

  // =========================================
  // BROWSER HEADER
  // =========================================

  skeletonElements.push({
    type: "rectangle",

    x: position.x,
    y: position.y,

    width: browserWidth,
    height: browserHeader,

    backgroundColor: "#f3f4f6",

    strokeColor: "#d1d5db",

    fillStyle: "solid",

    strokeWidth: 1,

    roughness: 0,
  });

  // =========================================
  // BROWSER DOTS
  // =========================================

  const dotY =
    position.y + 20;

  [0, 1, 2].forEach(
    (index) => {
      skeletonElements.push({
        type: "ellipse",

        x:
          position.x +
          20 +
          index * 18,

        y: dotY,

        width: 10,

        height: 10,

        backgroundColor:
          "#d1d5db",

        strokeColor:
          "#9ca3af",

        fillStyle: "solid",

        strokeWidth: 1,

        roughness: 0,
      });
    }
  );

  // =========================================
  // ADDRESS BAR
  // =========================================

  skeletonElements.push({
    type: "rectangle",

    x: position.x + 90,

    y: position.y + 11,

    width: 700,

    height: 28,

    backgroundColor: "#ffffff",

    strokeColor: "#d1d5db",

    fillStyle: "solid",

    strokeWidth: 1,

    roughness: 0,

    roundness: {
      type: 3,
    },
  });

  skeletonElements.push({
    type: "text",

    x: position.x + 110,

    y: position.y + 17,

    text: "example.com",

    fontSize: 13,

    strokeColor: "#6b7280",

    roughness: 0,
  });

  // =========================================
  // CONTENT
  // =========================================

  const contentX =
    position.x + 100;

  const contentWidth =
    browserWidth - 200;

  let currentY =
    position.y + 90;

  // =========================================
  // COMPONENTS
  // =========================================

  for (const component of components) {
    const type = component?.type;

    // -----------------------------------------
    // HEADING
    // -----------------------------------------

    if (type === "heading") {
      skeletonElements.push({
        type: "text",

        x: contentX,

        y: currentY,

        text: String(
          component.text ??
            component.label ??
            "Heading"
        ),

        fontSize: 30,

        strokeColor: "#111827",

        roughness: 0,
      });

      currentY += 55;

      continue;
    }

    // -----------------------------------------
    // TEXT
    // -----------------------------------------

    if (type === "text") {
      skeletonElements.push({
        type: "text",

        x: contentX,

        y: currentY,

        text: String(
          component.text ??
            component.label ??
            ""
        ),

        fontSize: 16,

        strokeColor: "#4b5563",

        roughness: 0,
      });

      currentY += 40;

      continue;
    }

    // -----------------------------------------
    // INPUT
    // -----------------------------------------

    if (type === "input") {
      const label =
        component.label ??
        component.text ??
        "Input";

      const placeholder =
        component.placeholder ??
        "Enter value";

      // Label
      skeletonElements.push({
        type: "text",

        x: contentX,

        y: currentY,

        text: String(label),

        fontSize: 14,

        strokeColor: "#374151",

        roughness: 0,
      });

      currentY += 25;

      // Input box
      skeletonElements.push({
        type: "rectangle",

        x: contentX,

        y: currentY,

        width: contentWidth,

        height: 50,

        backgroundColor: "#ffffff",

        strokeColor: "#9ca3af",

        fillStyle: "solid",

        strokeWidth: 1,

        roughness: 0,

        roundness: {
          type: 3,
        },
      });

      // Placeholder
      skeletonElements.push({
        type: "text",

        x: contentX + 15,

        y: currentY + 16,

        text: String(placeholder),

        fontSize: 14,

        strokeColor: "#9ca3af",

        roughness: 0,
      });

      currentY += 75;

      continue;
    }

    // -----------------------------------------
    // BUTTON
    // -----------------------------------------

    if (type === "button") {
      const buttonWidth = 180;
      const buttonHeight = 48;

      skeletonElements.push({
        type: "rectangle",

        x: contentX,

        y: currentY,

        width: buttonWidth,

        height: buttonHeight,

        backgroundColor: "#2563eb",

        strokeColor: "#2563eb",

        fillStyle: "solid",

        strokeWidth: 1,

        roughness: 0,

        roundness: {
          type: 3,
        },
      });

      skeletonElements.push({
        type: "text",

        x: contentX + 50,

        y: currentY + 15,

        text: String(
          component.text ??
            component.label ??
            "Button"
        ),

        fontSize: 15,

        strokeColor: "#ffffff",

        roughness: 0,
      });

      currentY += 70;

      continue;
    }

    // -----------------------------------------
    // LINK
    // -----------------------------------------

    if (type === "link") {
      skeletonElements.push({
        type: "text",

        x: contentX,

        y: currentY,

        text: String(
          component.text ??
            component.label ??
            "Link"
        ),

        fontSize: 14,

        strokeColor: "#2563eb",

        roughness: 0,
      });

      currentY += 35;

      continue;
    }

    // -----------------------------------------
    // CARD
    // -----------------------------------------

    if (type === "card") {
      const cardHeight = 120;

      skeletonElements.push({
        type: "rectangle",

        x: contentX,

        y: currentY,

        width: contentWidth,

        height: cardHeight,

        backgroundColor: "#f9fafb",

        strokeColor: "#d1d5db",

        fillStyle: "solid",

        strokeWidth: 1,

        roughness: 0,

        roundness: {
          type: 3,
        },
      });

      skeletonElements.push({
        type: "text",

        x: contentX + 20,

        y: currentY + 20,

        text: String(
          component.text ??
            component.label ??
            "Card"
        ),

        fontSize: 18,

        strokeColor: "#111827",

        roughness: 0,
      });

      currentY += 145;

      continue;
    }

    // -----------------------------------------
    // IMAGE PLACEHOLDER
    // -----------------------------------------

    if (type === "image") {
      const imageHeight = 150;

      skeletonElements.push({
        type: "rectangle",

        x: contentX,

        y: currentY,

        width: contentWidth,

        height: imageHeight,

        backgroundColor: "#e5e7eb",

        strokeColor: "#9ca3af",

        fillStyle: "solid",

        strokeWidth: 1,

        roughness: 0,
      });

      skeletonElements.push({
        type: "text",

        x:
          contentX +
          contentWidth / 2 -
          25,

        y:
          currentY +
          imageHeight / 2,

        text: "IMAGE",

        fontSize: 16,

        strokeColor: "#6b7280",

        roughness: 0,
      });

      currentY += 175;

      continue;
    }
  }

  // =========================================
  // CONVERT
  // =========================================

  const convertedElements =
    convertToExcalidrawElements(
      skeletonElements
    );

  // =========================================
  // REMOVE PLACEHOLDER
  // =========================================

  const currentElements =
    excalidrawAPI.getSceneElements();

  const cleanElements =
    currentElements.filter(
      (element: any) =>
        !element.customData
          ?.aiPlaceholder
    );

  // =========================================
  // UPDATE SCENE
  // =========================================

  excalidrawAPI.updateScene({
    elements: [
      ...cleanElements,
      ...convertedElements,
    ],
  });

  // =========================================
  // SELECT
  // =========================================

  excalidrawAPI.updateScene({
    appState: {
      selectedElementIds:
        Object.fromEntries(
          convertedElements.map(
            (element: any) => [
              element.id,
              true,
            ]
          )
        ),
    },
  });
};

const renderMobileMockup = (data: any) => {
  if (!excalidrawAPI) return;

  const screens = Array.isArray(
    data?.screens
  )
    ? data.screens
    : [];

  if (screens.length === 0) {
    throw new Error(
      "AI returned no mobile screens"
    );
  }

  const position =
    getEmptyCanvasPosition();

  const skeletonElements: any[] = [];

  // =========================================
  // PHONE SIZE
  // =========================================

  const phoneWidth = 360;
  const phoneHeight = 700;

  const screenWidth = 330;
  const screenHeight = 620;

  // =========================================
  // SCREENS
  // =========================================

  screens.forEach(
    (
      screen: any,
      screenIndex: number
    ) => {
      const phoneX =
        position.x +
        screenIndex * 450;

      const phoneY =
        position.y;

      // =====================================
      // PHONE BODY
      // =====================================

      skeletonElements.push({
        type: "rectangle",

        x: phoneX,

        y: phoneY,

        width: phoneWidth,

        height: phoneHeight,

        backgroundColor: "#111827",

        strokeColor: "#111827",

        fillStyle: "solid",

        strokeWidth: 2,

        roughness: 0,

        roundness: {
          type: 3,
        },
      });

      // =====================================
      // SCREEN
      // =====================================

      const screenX =
        phoneX + 15;

      const screenY =
        phoneY + 40;

      skeletonElements.push({
        type: "rectangle",

        x: screenX,

        y: screenY,

        width: screenWidth,

        height: screenHeight,

        backgroundColor: "#ffffff",

        strokeColor: "#d1d5db",

        fillStyle: "solid",

        strokeWidth: 1,

        roughness: 0,

        roundness: {
          type: 3,
        },
      });

      // =====================================
      // SPEAKER
      // =====================================

      skeletonElements.push({
        type: "rectangle",

        x:
          phoneX +
          phoneWidth / 2 -
          35,

        y: phoneY + 15,

        width: 70,

        height: 8,

        backgroundColor: "#374151",

        strokeColor: "#374151",

        fillStyle: "solid",

        strokeWidth: 0,

        roughness: 0,

        roundness: {
          type: 3,
        },
      });

      // =====================================
      // SCREEN TITLE
      // =====================================

      skeletonElements.push({
        type: "text",

        x: screenX + 20,

        y: screenY + 20,

        text: String(
          screen.title ??
            `Screen ${
              screenIndex + 1
            }`
        ),

        fontSize: 22,

        strokeColor: "#111827",

        roughness: 0,
      });

      // =====================================
      // COMPONENT POSITION
      // =====================================

      let currentY =
        screenY + 70;

      const contentX =
        screenX + 20;

      const contentWidth =
        screenWidth - 40;

      const components =
        Array.isArray(
          screen.components
        )
          ? screen.components
          : [];

      // =====================================
      // COMPONENTS
      // =====================================

      for (const component of components) {
        const type =
          component?.type;

        // -------------------------------------
        // HEADING
        // -------------------------------------

        if (type === "heading") {
          skeletonElements.push({
            type: "text",

            x: contentX,

            y: currentY,

            text: String(
              component.text ??
                component.label ??
                "Heading"
            ),

            fontSize: 22,

            strokeColor: "#111827",

            roughness: 0,
          });

          currentY += 45;

          continue;
        }

        // -------------------------------------
        // TEXT
        // -------------------------------------

        if (type === "text") {
          skeletonElements.push({
            type: "text",

            x: contentX,

            y: currentY,

            text: String(
              component.text ??
                component.label ??
                ""
            ),

            fontSize: 14,

            strokeColor: "#4b5563",

            roughness: 0,
          });

          currentY += 35;

          continue;
        }

        // -------------------------------------
        // INPUT
        // -------------------------------------

        if (type === "input") {
          const label =
            component.label ??
            component.text ??
            "Input";

          const placeholder =
            component.placeholder ??
            "Enter value";

          // Label
          skeletonElements.push({
            type: "text",

            x: contentX,

            y: currentY,

            text: String(label),

            fontSize: 13,

            strokeColor: "#374151",

            roughness: 0,
          });

          currentY += 20;

          // Input box
          skeletonElements.push({
            type: "rectangle",

            x: contentX,

            y: currentY,

            width: contentWidth,

            height: 42,

            backgroundColor: "#ffffff",

            strokeColor: "#9ca3af",

            fillStyle: "solid",

            strokeWidth: 1,

            roughness: 0,

            roundness: {
              type: 3,
            },
          });

          // Placeholder
          skeletonElements.push({
            type: "text",

            x:
              contentX + 10,

            y:
              currentY + 13,

            text: String(
              placeholder
            ),

            fontSize: 12,

            strokeColor: "#9ca3af",

            roughness: 0,
          });

          currentY += 60;

          continue;
        }

        // -------------------------------------
        // BUTTON
        // -------------------------------------

        if (type === "button") {
          skeletonElements.push({
            type: "rectangle",

            x: contentX,

            y: currentY,

            width: contentWidth,

            height: 44,

            backgroundColor: "#2563eb",

            strokeColor: "#2563eb",

            fillStyle: "solid",

            strokeWidth: 1,

            roughness: 0,

            roundness: {
              type: 3,
            },
          });

          skeletonElements.push({
            type: "text",

            x:
              contentX +
              contentWidth / 2 -
              30,

            y:
              currentY + 13,

            text: String(
              component.text ??
                component.label ??
                "Button"
            ),

            fontSize: 14,

            strokeColor: "#ffffff",

            roughness: 0,
          });

          currentY += 60;

          continue;
        }

        // -------------------------------------
        // LINK
        // -------------------------------------

        if (type === "link") {
          skeletonElements.push({
            type: "text",

            x: contentX,

            y: currentY,

            text: String(
              component.text ??
                component.label ??
                "Link"
            ),

            fontSize: 13,

            strokeColor: "#2563eb",

            roughness: 0,
          });

          currentY += 30;

          continue;
        }

        // -------------------------------------
        // CARD
        // -------------------------------------

        if (type === "card") {
          const cardHeight = 100;

          skeletonElements.push({
            type: "rectangle",

            x: contentX,

            y: currentY,

            width: contentWidth,

            height: cardHeight,

            backgroundColor: "#f9fafb",

            strokeColor: "#d1d5db",

            fillStyle: "solid",

            strokeWidth: 1,

            roughness: 0,

            roundness: {
              type: 3,
            },
          });

          skeletonElements.push({
            type: "text",

            x:
              contentX + 15,

            y:
              currentY + 20,

            text: String(
              component.text ??
                component.label ??
                "Card"
            ),

            fontSize: 15,

            strokeColor: "#111827",

            roughness: 0,
          });

          currentY += 115;

          continue;
        }

        // -------------------------------------
        // IMAGE
        // -------------------------------------

        if (type === "image") {
          const imageHeight = 100;

          skeletonElements.push({
            type: "rectangle",

            x: contentX,

            y: currentY,

            width: contentWidth,

            height: imageHeight,

            backgroundColor: "#e5e7eb",

            strokeColor: "#9ca3af",

            fillStyle: "solid",

            strokeWidth: 1,

            roughness: 0,
          });

          skeletonElements.push({
            type: "text",

            x:
              contentX +
              contentWidth / 2 -
              25,

            y:
              currentY +
              imageHeight / 2,

            text: "IMAGE",

            fontSize: 13,

            strokeColor: "#6b7280",

            roughness: 0,
          });

          currentY += 115;

          continue;
        }
      }
    }
  );

  // =========================================
  // CONVERT
  // =========================================

  const convertedElements =
    convertToExcalidrawElements(
      skeletonElements
    );

  // =========================================
  // REMOVE PLACEHOLDER
  // =========================================

  const currentElements =
    excalidrawAPI.getSceneElements();

  const cleanElements =
    currentElements.filter(
      (element: any) =>
        !element.customData
          ?.aiPlaceholder
    );

  // =========================================
  // UPDATE SCENE
  // =========================================

  excalidrawAPI.updateScene({
    elements: [
      ...cleanElements,
      ...convertedElements,
    ],
  });

  // =========================================
  // SELECT GENERATED
  // =========================================

  excalidrawAPI.updateScene({
    appState: {
      selectedElementIds:
        Object.fromEntries(
          convertedElements.map(
            (element: any) => [
              element.id,
              true,
            ]
          )
        ),
    },
  });
};

const renderAiDiagram = (diagramResult: any) => {
  if (!excalidrawAPI) return;

  // =========================================
  // WEB MOCKUP
  // =========================================

  if (diagramResult?.type === "web") {
    renderWebMockup(diagramResult);
    return;
  }

  // =========================================
  // MOBILE MOCKUP
  // =========================================

  if (diagramResult?.type === "mobile") {
    renderMobileMockup(diagramResult);
    return;
  }

  // =========================================
  // NORMAL DIAGRAM
  // =========================================

  const nodes = Array.isArray(diagramResult?.nodes)
    ? diagramResult.nodes
    : [];

  const edges = Array.isArray(diagramResult?.edges)
    ? diagramResult.edges
    : [];

  if (nodes.length === 0) {
    throw new Error("AI returned no diagram nodes");
  }

  const position = getEmptyCanvasPosition();

  // =========================================
  // DEFAULT LAYOUT
  // =========================================

  const DEFAULT_WIDTH = 220;
  const DEFAULT_HEIGHT = 90;

  const COLUMN_GAP = 140;
  const ROW_GAP = 110;

  const COLUMNS = 3;

  // =========================================
  // NODE MAP
  // =========================================

  const nodeMap = new Map<string, any>();

  nodes.forEach((node: any, index: number) => {
    const width = Number(
      node.width ?? DEFAULT_WIDTH
    );

    const height = Number(
      node.height ?? DEFAULT_HEIGHT
    );

    let relativeX = Number(node.x);
    let relativeY = Number(node.y);

    // -----------------------------------------
    // Fallback X
    // -----------------------------------------

    if (!Number.isFinite(relativeX)) {
      const column = index % COLUMNS;

      relativeX =
        column *
        (DEFAULT_WIDTH + COLUMN_GAP);
    }

    // -----------------------------------------
    // Fallback Y
    // -----------------------------------------

    if (!Number.isFinite(relativeY)) {
      const row = Math.floor(
        index / COLUMNS
      );

      relativeY =
        row *
        (DEFAULT_HEIGHT + ROW_GAP);
    }

    const absoluteX =
      position.x + relativeX;

    const absoluteY =
      position.y + relativeY;

    nodeMap.set(node.id, {
      ...node,

      x: absoluteX,
      y: absoluteY,

      width,
      height,
    });
  });

  // =========================================
  // SKELETON ELEMENTS
  // =========================================

  const skeletonElements: any[] = [];

  // =========================================
  // RENDER NODES
  // =========================================

  for (const node of nodes) {
    const mappedNode =
      nodeMap.get(node.id);

    if (!mappedNode) continue;

    const {
      x,
      y,
      width,
      height,
    } = mappedNode;

    // =======================================
    // NODE SHAPE
    // =======================================

    let shape:
      | "rectangle"
      | "ellipse"
      | "diamond" =
      "rectangle";

    if (node.shape === "ellipse") {
      shape = "ellipse";
    }

    if (node.shape === "diamond") {
      shape = "diamond";
    }

    // =======================================
    // NODE
    // =======================================

    skeletonElements.push({
      type: shape,

      id: crypto.randomUUID(),

      x,
      y,

      width,
      height,

      backgroundColor:
        node.backgroundColor ??
        "#e7f5ff",

      strokeColor:
        node.strokeColor ??
        "#1971c2",

      fillStyle: "solid",

      strokeWidth: 2,

      roughness: 0,

      roundness: {
        type: 3,
      },
    });

    // =======================================
    // NODE LABEL
    // =======================================

    if (node.label) {
      const labelText =
        String(node.label);

      const centerX =
        x + width;

      const centerY =
        y + height / 2 + 10;

      skeletonElements.push({
        type: "text",

        // IMPORTANT:
        // Put text anchor exactly at
        // the center of the node.
        x: centerX,

        y: centerY,

        text: labelText,

        fontSize: 16,

        textAlign: "center",

        verticalAlign: "middle",

        strokeColor: "#111827",

        roughness: 0,

        customData: {
          aiNodeLabel: true,
        },
      });
    }
  }

  // =========================================
  // STANDALONE TEXT
  // =========================================

  for (const element of nodes) {
    // Nothing here.
    // Standalone text isn't part of the
    // current nodes + edges schema.
  }

  // =========================================
  // RENDER EDGES
  // =========================================

  for (const edge of edges) {
    const startNode =
      nodeMap.get(edge.from);

    const endNode =
      nodeMap.get(edge.to);

    if (!startNode || !endNode) {
      console.warn(
        "Could not find nodes for edge:",
        edge
      );

      continue;
    }

    // =======================================
    // CONNECTION POINTS
    // =======================================

    const points =
      getConnectionPoints(
        startNode,
        endNode,
        { x: 0, y: 0 }
      );

    const deltaX =
      points.endX -
      points.startX;

    const deltaY =
      points.endY -
      points.startY;

    // =======================================
    // ARROW
    // =======================================

    skeletonElements.push({
      type: "arrow",

      x: points.startX,

      y: points.startY,

      points: [
        [0, 0],
        [deltaX, deltaY],
      ],

      endArrowhead: "arrow",

      strokeColor:
        edge.strokeColor ??
        "#374151",

      strokeWidth: 2,

      roughness: 0,
    });

    // =======================================
    // EDGE LABEL
    // =======================================

    if (
      typeof edge.label === "string" &&
      edge.label.trim()
    ) {
      const middleX =
        (points.startX +
          points.endX) /
        2;

      const middleY =
        (points.startY +
          points.endY) /
        2;

      skeletonElements.push({
        type: "text",

        x: middleX + 40,

        y: middleY,

        text: edge.label,

        fontSize: 10,

        textAlign: "center",

        verticalAlign: "middle",

        strokeColor: "#374151",

        roughness: 0,

        customData: {
          aiEdgeLabel: true,
        },
      });
    }
  }

  // =========================================
  // CONVERT TO EXCALIDRAW
  // =========================================

  const convertedElements =
    convertToExcalidrawElements(
      skeletonElements
    );

  // =========================================
  // FIX TEXT POSITIONS
  // =========================================

  const correctedElements =
    convertedElements.map(
      (element: any) => {

        // =====================================
        // NODE LABEL
        // =====================================

        if (
          element.type === "text" &&
          element.customData
            ?.aiNodeLabel
        ) {
          // The skeleton x/y represents
          // the CENTER of the node.
          //
          // Excalidraw gives us the actual
          // rendered text dimensions here.
          //
          // Move text so its CENTER matches
          // the CENTER of the node.

          return {
            ...element,

            x:
              element.x -
              element.width / 2,

            y:
              element.y -
              element.height / 2,
          };
        }

        // =====================================
        // EDGE LABEL
        // =====================================

        if (
          element.type === "text" &&
          element.customData
            ?.aiEdgeLabel
        ) {
          return {
            ...element,

            x:
              element.x -
              element.width / 2,

            y:
              element.y -
              element.height / 2,
          };
        }

        return element;
      }
    );

  // =========================================
  // REMOVE AI PLACEHOLDER
  // =========================================

  const currentElements =
    excalidrawAPI.getSceneElements();

  const cleanElements =
    currentElements.filter(
      (element: any) =>
        !element.customData
          ?.aiPlaceholder
    );

  // =========================================
  // UPDATE SCENE
  // =========================================

  excalidrawAPI.updateScene({
    elements: [
      ...cleanElements,
      ...correctedElements,
    ],
  });

  // =========================================
  // SELECT GENERATED ELEMENTS
  // =========================================

  excalidrawAPI.updateScene({
    appState: {
      selectedElementIds:
        Object.fromEntries(
          correctedElements.map(
            (element: any) => [
              element.id,
              true,
            ]
          )
        ),
    },
  });

  // =========================================
  // DEBUG
  // =========================================

  console.log(
    "AI diagram rendered:",
    {
      type: diagramResult.type,
      nodes: nodes.length,
      edges: edges.length,
    }
  );
};

  const onClickGenerate = async () => {
  if (loading) return;
  if (!userInput.trim()) return;

  setLoading(true);
  addAiPlaceholder();

  try {
    const currentAiTool = AI_TOOLS.find(
      (tool) => tool.id === selectedTool
    );

    if (!currentAiTool) {
      throw new Error("AI tool not found");
    }

    const result = await axios.post("/api/ai", {
      userInput: userInput.trim(),
      type: currentAiTool.name,
      systemPrompt: currentAiTool.prompt,
    });

    // API already returns parsed diagramResult
    const diagramResult = result.data.diagramResult;

    if (!diagramResult) {
      throw new Error("AI returned an invalid diagram");
    }

    renderAiDiagram(diagramResult);

  } catch (err) {
    console.error("AI GENERATION ERROR:", err);

    if (axios.isAxiosError(err)) {
      setError(err?.response?.data?.error ?? "Generation failed. Try again.");
    }

    removeAiPlaceholder();

  } finally {
    setLoading(false);
  }
};

    const removeAiPlaceholder = () => {
        if (!excalidrawAPI) return;

        const updatedElements = excalidrawAPI
        .getSceneElements()
        .filter((element: any) => !element.customData?.aiPlaceholder);

        excalidrawAPI.updateScene({ elements: updatedElements });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        onClickGenerate();
        }
  };

    return (
    <div
      role="dialog"
      aria-label="AI helper"
      className="absolute bottom-24 right-6 z-50 flex max-h-155 w-95
                 flex-col overflow-hidden rounded-2xl border border-gray-200
                 bg-white shadow-2xl shadow-gray-900/10"
    >
      {/* Header */}
      <header className="flex shrink-0 items-start justify-between gap-3 px-5 pb-4 pt-5">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <Sparkles size={17} className="text-violet-600" />
            AI helper
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Describe it, and it lands on your canvas.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close AI helper"
          className="-mr-1 -mt-1 rounded-lg p-1.5 text-gray-400
                     transition hover:bg-gray-100 hover:text-gray-600
                     focus-visible:outline-2 focus-visible:outline-offset-2
                     focus-visible:outline-violet-500"
        >
          <X size={16} />
        </button>
      </header>

      {/* Tool selector */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-2">
        <div className="flex flex-col gap-1">
          {AI_TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = tool.id === selectedTool;

            return (
              <button
                key={tool.id}
                type="button"
                aria-pressed={isActive}
                disabled={loading}
                onClick={() => setSelectedTool(tool.id)}
                className={`flex items-center gap-3 rounded-xl border px-2.5 py-2 text-left
                            transition disabled:opacity-50 focus-visible:outline-2
                            focus-visible:outline-offset-2 focus-visible:outline-violet-500
                   ${
                    isActive
                      ? tool.selected
                      : "border-transparent hover:bg-gray-50"
                  }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center
                              rounded-lg ${tool.tint} ${tool.accent}`}
                >
                  <Icon size={17} />
                </span>

                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-gray-900">
                    {tool.name}
                  </span>
                  <span className="block truncate text-xs text-gray-500">
                    {tool.desc}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prompt */}
      <div className="shrink-0 border-t border-gray-100 bg-gray-50/60 p-4">
        <Textarea
          value={userInput}
          maxLength={MAX_PROMPT}
          disabled={loading}
          onChange={(event) => setUserInput(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={currentAiTool.placeholder}
          className="min-h-21 resize-none border-gray-200 bg-white text-sm
        placeholder:text-gray-400 focus-visible:ring-violet-500/30"
        />

        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-xs tabular-nums text-gray-400">
            {userInput.length}/{MAX_PROMPT}
          </span>

          <Button
            onClick={onClickGenerate}
            disabled={!canGenerate}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Generating
              </>
            ) : (
              <>
                <Sparkles size={15} />
                Generate
                <CornerDownLeft size={13} className="opacity-50" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}