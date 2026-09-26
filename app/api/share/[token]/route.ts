import { db, projects, WhiteboardData, projectShares } from "@/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: "Share token is missing" },
        { status: 400 }
      );
    }

    // Find share link
    const share = await db
      .select()
      .from(projectShares)
      .where(eq(projectShares.shareToken, token))
      .limit(1);

    if (share.length === 0) {
      return NextResponse.json(
        { error: "Share link not found" },
        { status: 404 }
      );
    }

    const projectShare = share[0];

    // Check if sharing is active
    if (!projectShare.isActive) {
      return NextResponse.json(
        { error: "This share link has been disabled" },
        { status: 403 }
      );
    }

    // Get project
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.projectId, projectShare.projectId))
      .limit(1);

    if (project.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Get whiteboard data
    const whiteboard = await db
      .select()
      .from(WhiteboardData)
      .where(eq(WhiteboardData.projectId, projectShare.projectId))
      .limit(1);

    if (whiteboard.length === 0) {
      return NextResponse.json(
        { error: "Whiteboard data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,

      project: project[0],

      share: {
        permission: projectShare.permission,
      },

      canvas: whiteboard[0],
    });
  } catch (error) {
    console.error("GET SHARED WHITEBOARD ERROR:", error);

    return NextResponse.json(
      { error: "Failed to load shared whiteboard" },
      { status: 500 }
    );
  }
}