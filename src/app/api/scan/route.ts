import { NextRequest, NextResponse } from "next/server";
import { createTask } from "@/lib/ninja";
import { MODULES } from "@/lib/modules";

// Helper to pause execution
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, competitors, modules: selectedModules } = body as {
      apiKey?: string;
      competitors: string[];
      modules: string[];
    };

    if (!competitors || competitors.length === 0 || competitors.length > 3) {
      return NextResponse.json(
        { error: "Provide 1-3 competitor URLs" },
        { status: 400 }
      );
    }

    if (!selectedModules || selectedModules.length === 0) {
      return NextResponse.json(
        { error: "Select at least one module" },
        { status: 400 }
      );
    }

    // Build all task requests
    const taskRequests = competitors.flatMap((competitor) =>
      selectedModules
        .filter((modId: string) => MODULES.find((m) => m.id === modId))
        .map((modId: string) => ({
          competitor,
          modId,
          mod: MODULES.find((m) => m.id === modId)!,
        }))
    );

    // Fire tasks one at a time to avoid concurrent_task_limit_reached
    const tasks: Array<{
      competitor: string;
      moduleId: string;
      taskId: string;
    }> = [];

    for (const { competitor, modId, mod } of taskRequests) {
      const prompt = mod.buildPrompt(competitor);
      const result = await createTask(prompt, mod.resultSchema, "smart", apiKey);
      tasks.push({ competitor, moduleId: modId, taskId: result.taskId });

      // Small delay between task creations to stay safe
      await sleep(1000);
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("401") ? 401 : message.includes("429") ? 429 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
