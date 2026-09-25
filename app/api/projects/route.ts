import { db, projects, WhiteboardData } from "@/db"
import { currentUser } from "@clerk/nextjs/server"
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

export async function GET(req:NextRequest){
    const searchParams = req.nextUrl.searchParams;
    const projectId = searchParams.get('projectId')

    const user = await currentUser()

    if(!projectId){
        return NextResponse.json({error: "Project Information missing"})
    }

    const userProject = await db.select().from(projects).where(and(eq(projects.projectId, projectId), eq(projects.userEmail, user?.primaryEmailAddress?.emailAddress ?? "")))

    if(userProject.length === 0){
        return NextResponse.json({
            error: "Unauthorised user"
        })
    }

    const result = await db.select().from(WhiteboardData).where(eq(WhiteboardData.projectId, projectId))

    return NextResponse.json({
        canvas: result[0],
        userProject: userProject[0]
    })
}