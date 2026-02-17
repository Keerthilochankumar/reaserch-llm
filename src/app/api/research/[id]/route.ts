import { NextRequest, NextResponse } from "next/server";
import dbConnect from "~/server/db/mongoose";
import { ResearchTask, ResearchBrief } from "~/server/db/models";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;
    await dbConnect();
    
    const brief = await ResearchBrief.findOne({ briefId: id });
    if (!brief) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }
    
    const tasks = await ResearchTask.find({ taskId: { $in: brief.taskIds } });
    
    return NextResponse.json({
      ...brief.toObject(),
      tasks
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch brief" }, { status: 500 });
  }
}
