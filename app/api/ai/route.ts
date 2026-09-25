import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// =========================================
// DIAGRAM SCHEMA
// =========================================

const diagramSchema = {
  type: "object",

  properties: {
    type: {
      type: "string",
      enum: ["diagram", "flowchart", "architecture"],
    },

    nodes: {
      type: "array",

      items: {
        type: "object",

        properties: {
          id: {
            type: "string",
          },

          label: {
            type: "string",
          },

          shape: {
            type: "string",
            enum: [
              "rectangle",
              "ellipse",
              "diamond",
            ],
          },

          x: {
            type: "number",
          },

          y: {
            type: "number",
          },

          width: {
            type: "number",
          },

          height: {
            type: "number",
          },
        },

        required: [
          "id",
          "label",
          "shape",
          "x",
          "y",
          "width",
          "height",
        ],

        additionalProperties: false,
      },
    },

    edges: {
      type: "array",

      items: {
        type: "object",

        properties: {
          from: {
            type: "string",
          },

          to: {
            type: "string",
          },

          label: {
            type: "string",
          },
        },

        required: [
          "from",
          "to",
          "label",
        ],

        additionalProperties: false,
      },
    },
  },

  required: [
    "type",
    "nodes",
    "edges",
  ],

  additionalProperties: false,
};

// =========================================
// WEB MOCKUP SCHEMA
// =========================================

const webMockupSchema = {
  type: "object",

  properties: {
    type: {
      type: "string",
      enum: ["web"],
    },

    components: {
      type: "array",

      items: {
        type: "object",

        properties: {
          type: {
            type: "string",

            enum: [
              "heading",
              "text",
              "input",
              "button",
              "link",
              "card",
              "image",
            ],
          },

          text: {
            type: "string",
          },

          label: {
            type: "string",
          },

          placeholder: {
            type: "string",
          },
        },

        required: [
          "type",
          "text",
          "label",
          "placeholder",
        ],

        additionalProperties: false,
      },
    },
  },

  required: [
    "type",
    "components",
  ],

  additionalProperties: false,
};

// =========================================
// MOBILE MOCKUP SCHEMA
// =========================================

const mobileMockupSchema = {
  type: "object",

  properties: {
    type: {
      type: "string",
      enum: ["mobile"],
    },

    screens: {
      type: "array",

      items: {
        type: "object",

        properties: {
          title: {
            type: "string",
          },

          components: {
            type: "array",

            items: {
              type: "object",

              properties: {
                type: {
                  type: "string",

                  enum: [
                    "heading",
                    "text",
                    "input",
                    "button",
                    "link",
                    "card",
                    "image",
                  ],
                },

                text: {
                  type: "string",
                },

                label: {
                  type: "string",
                },

                placeholder: {
                  type: "string",
                },
              },

              required: [
                "type",
                "text",
                "label",
                "placeholder",
              ],

              additionalProperties: false,
            },
          },
        },

        required: [
          "title",
          "components",
        ],

        additionalProperties: false,
      },
    },
  },

  required: [
    "type",
    "screens",
  ],

  additionalProperties: false,
};

// =========================================
// POST
// =========================================

export async function POST(
  req: NextRequest
) {
  try {
    const body = await req.json();

    const {
      userInput,
      type,
      systemPrompt,
    } = body;

    // -----------------------------------------
    // Validation
    // -----------------------------------------

    if (!userInput?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "User input is required",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================
    // SELECT SCHEMA
    // =========================================

    const normalizedType =
      String(type ?? "")
        .toLowerCase();

    let responseSchema: any;

    if (
      normalizedType.includes(
        "web"
      )
    ) {
      responseSchema =
        webMockupSchema;
    } else if (
      normalizedType.includes(
        "mobile"
      )
    ) {
      responseSchema =
        mobileMockupSchema;
    } else {
      responseSchema =
        diagramSchema;
    }

    // =========================================
    // PROMPT
    // =========================================

    const finalPrompt = `
You are an AI whiteboard generation engine.

Your job is to convert the user's request into
structured semantic data for a whiteboard.

IMPORTANT:

Do NOT generate Excalidraw elements.

Do NOT generate SVG.

Do NOT generate HTML.

Do NOT generate CSS.

Do NOT generate images.

Do NOT generate markdown.

Return ONLY the JSON object matching the
provided schema.

The frontend will handle all rendering.

=========================================
USER REQUEST
=========================================

${userInput}

=========================================
TOOL
=========================================

${type}

=========================================
ADDITIONAL INSTRUCTIONS
=========================================

${systemPrompt ?? ""}

=========================================
GENERAL RULES
=========================================

Create meaningful content based on the
user's request.

Never return empty content when the user
has requested a UI or diagram.

Use realistic labels.

Do not create generic components like
"Box 1", "Box 2", etc.

For diagrams:

- Every node needs a meaningful label.
- Every edge must reference valid node IDs.
- Use rectangle for services/entities.
- Use ellipse for databases/storage.
- Use diamond for decisions.
- Give nodes sensible positions.
- Keep diagrams readable.

For web mockups:

Create a realistic low-fidelity website
wireframe.

Use components such as:

heading
text
input
button
link
card
image

For example, if the user asks for a login
page, include:

- heading
- supporting text
- email input
- password input
- login button
- forgot password link

Do NOT make the entire website one giant
rectangle.

For mobile mockups:

Create one or more realistic mobile
screens.

Each screen should contain meaningful
components.

For example, a login screen should contain:

- heading
- email input
- password input
- login button
- relevant links

Do NOT represent the entire mobile screen
as one generic rectangle.

=========================================
FINAL REQUIREMENT
=========================================

Return ONLY valid JSON.
`;

    console.log(
      "AI REQUEST:",
      {
        type,
        userInput,
      }
    );

    // =========================================
    // GROQ
    // =========================================

    const completion =
      await groq.chat.completions.create({
        model:
          "openai/gpt-oss-120b",

        messages: [
          {
            role: "system",
            content:
              "You are a structured whiteboard generation engine. Follow the JSON schema exactly.",
          },

          {
            role: "user",
            content: finalPrompt,
          },
        ],

        temperature: 0.7,

        max_completion_tokens: 4096,

        top_p: 1,

        reasoning_effort: "medium",

        stream: false,

        response_format: {
          type: "json_schema",

          json_schema: {
            name:
              "whiteboard_generation",

            strict: true,

            schema:
              responseSchema,
          },
        },
      });

    // =========================================
    // GET RESPONSE
    // =========================================

    const content =
      completion.choices[0]
        ?.message
        ?.content;

    console.log(
      "GROQ RAW RESPONSE:",
      content
    );

    if (!content) {
      throw new Error(
        "Groq returned an empty response"
      );
    }

    // =========================================
    // PARSE JSON
    // =========================================

    const diagramResult =
      JSON.parse(content);

    console.log(
      "PARSED DIAGRAM:",
      JSON.stringify(
        diagramResult,
        null,
        2
      )
    );

    // =========================================
    // RETURN
    // =========================================

    return NextResponse.json({
      success: true,
      diagramResult,
    });

  } catch (error: any) {
    console.error(
      "AI ROUTE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ??
          "AI generation failed",
      },
      {
        status: 500,
      }
    );
  }
}