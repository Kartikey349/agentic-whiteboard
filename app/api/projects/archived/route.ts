import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db, projects } from "@/db";


export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clerkClient();

    const user = await client.users.getUser(userId);

    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    const archivedProjects = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.userEmail, userEmail),
          eq(projects.isArchived, true)
        )
      );

    return NextResponse.json(archivedProjects);
  } catch (error) {
    console.error("GET ARCHIVED PROJECTS ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch archived projects" },
      { status: 500 }
    );
  }
}