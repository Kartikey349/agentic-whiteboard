import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import crypto from "crypto";
import { db, projects, projectShares } from "@/db";

// ======================================================
// POST - Create / Enable Share
// ======================================================

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Get logged-in user's email
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const userEmail =
      user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // Verify project belongs to this user
    const project = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.projectId, projectId),
          eq(projects.userEmail, userEmail)
        )
      )
      .limit(1);

    if (project.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Check if share already exists
    const existingShare = await db
      .select()
      .from(projectShares)
      .where(eq(projectShares.projectId, projectId))
      .limit(1);

    // If share already exists, enable it again
    if (existingShare.length > 0) {
      const share = existingShare[0];

      const updatedShare = await db
        .update(projectShares)
        .set({
          isActive: true,
        })
        .where(eq(projectShares.projectId, projectId))
        .returning();

      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${share.shareToken}`;

      return NextResponse.json({
        success: true,
        shareUrl,
        share: updatedShare[0],
      });
    }

    // Create new share token
    const shareToken = crypto
      .randomBytes(32)
      .toString("hex");

    const newShare = await db
      .insert(projectShares)
      .values({
        projectId,
        shareToken,
        isActive: true,
        permission: "view",
      })
      .returning();

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareToken}`;

    return NextResponse.json({
      success: true,
      shareUrl,
      share: newShare[0],
    });
  } catch (error) {
    console.error("CREATE SHARE ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    );
  }
}

// ======================================================
// GET - Get Active Shared Projects
// ======================================================

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get logged-in user's email
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const userEmail =
      user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // Get only projects that are currently shared
    const sharedProjects = await db
      .select({
        id: projects.id,
        projectId: projects.projectId,
        projectName: projects.projectName,
        userEmail: projects.userEmail,
        isArchived: projects.isArchived,
        createdAt: projects.createdAt,

        shareToken: projectShares.shareToken,
        permission: projectShares.permission,
        sharedAt: projectShares.createdAt,
      })
      .from(projects)
      .innerJoin(
        projectShares,
        eq(
          projects.projectId,
          projectShares.projectId
        )
      )
      .where(
        and(
          eq(projects.userEmail, userEmail),
          eq(projectShares.isActive, true),
          eq(projects.isArchived, false)
        )
      );

    return NextResponse.json({
      success: true,
      projects: sharedProjects,
    });
  } catch (error) {
    console.error("GET SHARED PROJECTS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch shared projects" },
      { status: 500 }
    );
  }
}

// ======================================================
// PATCH - Enable / Disable Sharing
// ======================================================

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { projectId, isActive } = await req.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean" },
        { status: 400 }
      );
    }

    // Get logged-in user's email
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const userEmail =
      user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // Verify that the project belongs to this user
    const project = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.projectId, projectId),
          eq(projects.userEmail, userEmail)
        )
      )
      .limit(1);

    if (project.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Update sharing status
    const updatedShare = await db
      .update(projectShares)
      .set({
        isActive,
      })
      .where(
        eq(projectShares.projectId, projectId)
      )
      .returning();

    if (updatedShare.length === 0) {
      return NextResponse.json(
        { error: "Share link not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      share: updatedShare[0],
    });
  } catch (error) {
    console.error("UPDATE SHARE ERROR:", error);

    return NextResponse.json(
      { error: "Failed to update sharing status" },
      { status: 500 }
    );
  }
}