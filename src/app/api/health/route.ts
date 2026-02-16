import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { concurrencyManager } from "~/lib/concurrency";

export async function GET() {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  const concurrencyStats = concurrencyManager.getStats();
  
  return NextResponse.json({
    status: "healthy",
    database: dbStatus,
    concurrency: concurrencyStats,
    timestamp: new Date().toISOString()
  });
}
