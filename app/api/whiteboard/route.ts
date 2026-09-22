import { db, WhiteboardData } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
    const {projectId, elements, files, appState} = await req.json()

    const user = await currentUser()

    if(!user){
        return NextResponse.json("unauthorised user")
    }
    try{

        if(projectId){
            const result = await db.insert(WhiteboardData).values({
                projectId: projectId,
                elements: elements,
                appState: appState,
                files: files
            }).onConflictDoUpdate({
                target: WhiteboardData.projectId,
                set: {
                    elements: elements,
                    appState: appState,
                    files: files,
                    updateAt: new Date()
                }
            })
    
            return NextResponse.json(result)
        }
    }catch(e){
        return NextResponse.json('Internal server error')
    }
    return NextResponse.json('Project info missing')

}