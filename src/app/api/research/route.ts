import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import dbConnect from "~/server/db/mongoose";
import { ResearchTask, ResearchBrief } from "~/server/db/models";
import { agents } from "~/lib/agents";
import { concurrencyManager } from "~/lib/concurrency";

import { z } from "zod";

const researchSchema = z.object({
  input: z.string().min(5).max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = researchSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ 
        error: "Invalid input", 
        details: result.error.errors 
      }, { status: 400 });
    }

    const { input } = result.data;

    await dbConnect();

    const briefId = uuidv4();
    
    // Phase 0: Intent Analysis
    console.log(`[Research ${briefId}] Intent Analysis...`);
    const intent = await agents.intent(input);

    // Phase 1: Search & Discovery
    console.log(`[Research ${briefId}] Searching...`);
    const searchedUrls = await agents.search(intent.searchQueries || []);
    
    // Combine and validate URLs
    const rawUrls = [...new Set([...(intent.urls || []), ...searchedUrls])];
    const isValidUrl = (url: string) => {
      try { new URL(url); return true; } catch { return false; }
    };
    const allUrls = rawUrls.filter(isValidUrl).slice(0, 10);
    
    if (allUrls.length === 0) {
      return NextResponse.json({ 
        error: "No valid URLs found. Try a more specific query." 
      }, { status: 400 });
    }

    // Phase 2: Create Research Tasks
    const tasks = await Promise.all(allUrls.map(async (url) => {
      const task = new ResearchTask({
        taskId: uuidv4(),
        url,
        status: 'pending'
      });
      await task.save();
      return task;
    }));

    // Phase 3: Bounded Concurrent Processing
    console.log(`[Research ${briefId}] Processing ${allUrls.length} sources...`);
    
    const processedTasks = await Promise.all(
      tasks.map((task: any) => 
        concurrencyManager.execute(async () => {
          try {
            await ResearchTask.updateOne({ taskId: task.taskId }, { status: 'processing' });
            const result = await agents.researcher(task.url);
            return await ResearchTask.findOneAndUpdate(
              { taskId: task.taskId }, 
              { 
                status: 'completed', 
                data: result.data, 
                metadata: result.metadata 
              },
              { returnDocument: 'after' }
            );
          } catch (error: any) {
            return await ResearchTask.findOneAndUpdate(
              { taskId: task.taskId }, 
              { status: 'failed', error: error.message },
              { returnDocument: 'after' }
            );
          }
        })
      )
    );

    const completedTasks = processedTasks.filter((t: any) => t?.status === 'completed');
    
    if (completedTasks.length === 0) {
      return NextResponse.json({ 
        error: "Failed to extract content from any sources." 
      }, { status: 400 });
    }

    // Phase 4: Synthesis
    console.log(`[Research ${briefId}] Synthesizing...`);
    const synthesis = await agents.synthesis(processedTasks, intent.topic);

    // Phase 5: Save Research Brief
    const brief = new ResearchBrief({
      briefId,
      input,
      intent: {
        topic: intent.topic,
        urls: intent.urls || [],
        searchQueries: intent.searchQueries || [],
        depth: intent.depth || 'medium'
      },
      synthesis,
      taskIds: tasks.map((t: any) => t.taskId),
      metadata: {
        totalTokensUsed: processedTasks.reduce((acc: number, t: any) => acc + (t?.metadata?.tokensUsed || 0), 0),
        totalProcessingTimeMs: processedTasks.reduce((acc: number, t: any) => acc + (t?.metadata?.processingTimeMs || 0), 0),
        sourceCount: completedTasks.length
      }
    });
    
    await brief.save();

    return NextResponse.json({
      id: briefId,
      topic: intent.topic,
      brief,
      tasks: processedTasks
    });

  } catch (error: any) {
    console.error(`[Research Error]`, error);
    return NextResponse.json({ error: "Research failed", details: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const briefs = await ResearchBrief.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select('-synthesis.rawMarkdown -synthesis.detailedAnalysis');
    
    return NextResponse.json(briefs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch briefs" }, { status: 500 });
  }
}
