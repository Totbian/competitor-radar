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
    const { competitors, modules: selectedModules } = body as {
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

    // Fire tasks in batches of 8 to stay within rate limits (10 req/min)
    const BATCH_SIZE = 8;
    const tasks: Array<{
      competitor: string;
      moduleId: string;
      taskId: string;
    }> = [];

    for (let i = 0; i < taskRequests.length; i += BATCH_SIZE) {
      const batch = taskRequests.slice(i, i + BATCH_SIZE);

      const batchResults = await Promise.all(
        batch.map(async ({ competitor, modId, mod }) => {
          const prompt = mod.buildPrompt(competitor);
          const result = await createTask(prompt, mod.resultSchema);
          return { competitor, moduleId: modId, taskId: result.taskId };
        })
      );

      tasks.push(...batchResults);

      // If there are more batches, wait to respect rate limits
      if (i + BATCH_SIZE < taskRequests.length) {
        await sleep(7000); // Wait 7s between batches
      }
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
