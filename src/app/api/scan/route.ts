import { NextRequest, NextResponse } from "next/server";
import { createTask } from "@/lib/ninja";
import { MODULES } from "@/lib/modules";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, competitor, moduleId } = body as {
      apiKey?: string;
      competitor: string;
      moduleId: string;
    };

    if (!competitor) {
      return NextResponse.json(
        { error: "Competitor URL is required" },
        { status: 400 }
      );
    }

    const mod = MODULES.find((m) => m.id === moduleId);
    if (!mod) {
      return NextResponse.json(
        { error: "Invalid module ID" },
        { status: 400 }
      );
    }

    const prompt = mod.buildPrompt(competitor);
    const result = await createTask(prompt, mod.resultSchema, "smart", apiKey);

    return NextResponse.json({
      competitor,
      moduleId,
      taskId: result.taskId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("401") ? 401 : message.includes("429") ? 429 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
