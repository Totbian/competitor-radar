import { NextRequest, NextResponse } from "next/server";
import { getTaskResult } from "@/lib/ninja";

export async function GET(request: NextRequest) {
  try {
    const taskId = request.nextUrl.searchParams.get("taskId");
    const wait = request.nextUrl.searchParams.get("wait") === "1";
    const apiKey = request.nextUrl.searchParams.get("apiKey") || undefined;

    if (!taskId) {
      return NextResponse.json(
        { error: "taskId is required" },
        { status: 400 }
      );
    }

    const result = await getTaskResult(taskId, wait, apiKey);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
