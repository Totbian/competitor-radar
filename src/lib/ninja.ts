const NINJA_BASE_URL = "https://ninja.new";

export interface TaskResponse {
  taskId: string;
  status: string;
}

export interface TaskResult {
  taskId: string;
  status: string;
  result: Record<string, unknown> | string | null;
  error: string | null;
}

export async function createTask(
  prompt: string,
  resultSchema: Record<string, unknown>,
  model: "fast" | "smart" | "super-smart" = "smart"
): Promise<TaskResponse> {
  const apiKey = process.env.NINJA_API_KEY;
  if (!apiKey) {
    throw new Error("NINJA_API_KEY environment variable is not set");
  }

  const response = await fetch(`${NINJA_BASE_URL}/v0/api/task`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ prompt, resultSchema, model }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ninja API error (${response.status}): ${text}`);
  }

  return response.json();
}

export async function getTaskResult(
  taskId: string,
  wait: boolean = false
): Promise<TaskResult> {
  const apiKey = process.env.NINJA_API_KEY;
  if (!apiKey) {
    throw new Error("NINJA_API_KEY environment variable is not set");
  }

  const params = new URLSearchParams({ taskId });
  if (wait) params.set("wait", "1");

  const response = await fetch(
    `${NINJA_BASE_URL}/v0/api/task/result?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ninja API error (${response.status}): ${text}`);
  }

  return response.json();
}
