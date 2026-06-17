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

function resolveApiKey(providedKey?: string): string {
  const key = providedKey || process.env.NINJA_API_KEY;
  if (!key) {
    throw new Error("No API key provided. Enter your Ninja API key to continue.");
  }
  return key;
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(url, options);

    if (response.status === 429 && attempt < maxRetries) {
      // Wait with exponential backoff: 5s, 10s, 20s
      const delay = 5000 * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }

    return response;
  }

  // Should not reach here, but just in case
  return fetch(url, options);
}

export async function createTask(
  prompt: string,
  resultSchema: Record<string, unknown>,
  model: "fast" | "smart" | "super-smart" = "smart",
  apiKey?: string
): Promise<TaskResponse> {
  const key = resolveApiKey(apiKey);

  const response = await fetchWithRetry(`${NINJA_BASE_URL}/v0/api/task`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ prompt, resultSchema, model }),
  });

  if (!response.ok) {
    const text = await response.text();
    if (response.status === 401) {
      throw new Error("Invalid API key. Check your Ninja API key and try again.");
    }
    throw new Error(`Ninja API error (${response.status}): ${text}`);
  }

  return response.json();
}

export async function getTaskResult(
  taskId: string,
  wait: boolean = false,
  apiKey?: string
): Promise<TaskResult> {
  const key = resolveApiKey(apiKey);

  const params = new URLSearchParams({ taskId });
  if (wait) params.set("wait", "1");

  const response = await fetch(
    `${NINJA_BASE_URL}/v0/api/task/result?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Ninja API error (${response.status}): ${text}`);
  }

  return response.json();
}
