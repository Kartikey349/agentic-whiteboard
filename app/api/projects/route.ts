import { db, projects, WhiteboardData } from "@/db"
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server"
import { and, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req:NextRequest){
    const {projectName, projectId} = await req.json()
    const user = await currentUser()

    if(!projectId || !projectName){
        return NextResponse.json({error: "Project Information missing"})
    }

    const result = await db.insert(projects).values({
        projectId: projectId,
        projectName: projectName ?? "",
        userEmail: user?.primaryEmailAddress?.emailAddress ?? ""
    }).returning()

    return NextResponse.json(result[0])
}

export async function GET(req: NextRequest) {
  const user = await currentUser();

  if (!user?.primaryEmailAddress?.emailAddress) {
    return NextResponse.json({ error: "Unauthorized User" }, { status: 401 });
  }

  const email = user.primaryEmailAddress.emailAddress;

  try {
    // With a projectId this returns that one board (still scoped to the user,
    // so nobody can read someone else's by guessing the id); without one it
    // returns the whole list for the dashboard.
    
      const result = await db
        .select()
        .from(projects)
        .where(
          (eq(projects.userEmail, email))
        )

      return NextResponse.json(result ?? null);

  } catch (e) {
    console.error("Failed to load projects", e);
    return NextResponse.json(
      { error: "Internal server error!" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
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

    // Get current user's email from Clerk
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // Make sure this project belongs to the current user
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

    // Delete whiteboard data first
    await db
      .delete(WhiteboardData)
      .where(eq(WhiteboardData.projectId, projectId));

    // Delete project
    await db
      .delete(projects)
      .where(eq(projects.projectId, projectId));

    return NextResponse.json({
      success: true,
      message: "Project deleted permanently",
    });
  } catch (error) {
    console.error("DELETE PROJECT ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to delete project",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { projectId, projectName, isArchived } =
      await req.json();

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    if (
      projectName === undefined &&
      isArchived === undefined
    ) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400 }
      );
    }

    if (
      projectName !== undefined &&
      (typeof projectName !== "string" ||
        projectName.trim().length === 0)
    ) {
      return NextResponse.json(
        { error: "Project name cannot be empty" },
        { status: 400 }
      );
    }

    if (
      isArchived !== undefined &&
      typeof isArchived !== "boolean"
    ) {
      return NextResponse.json(
        { error: "isArchived must be true or false" },
        { status: 400 }
      );
    }

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

    const existingProject = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.projectId, projectId),
          eq(projects.userEmail, userEmail)
        )
      )
      .limit(1);

    if (existingProject.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const updateData: {
      projectName?: string;
      isArchived?: boolean;
    } = {};

    if (projectName !== undefined) {
      updateData.projectName = projectName.trim();
    }

    if (isArchived !== undefined) {
      updateData.isArchived = isArchived;
    }

    const updatedProject = await db
      .update(projects)
      .set(updateData)
      .where(
        and(
          eq(projects.projectId, projectId),
          eq(projects.userEmail, userEmail)
        )
      )
      .returning();

    return NextResponse.json({
      success: true,
      project: updatedProject[0],
    });
  } catch (error) {
    console.error("UPDATE PROJECT ERROR:", error);

    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}