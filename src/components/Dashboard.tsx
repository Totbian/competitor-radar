"use client";

import { useState, useRef } from "react";
import { MODULES } from "@/lib/modules";
import { ResultCard } from "./ResultCard";

interface TaskInfo {
  competitor: string;
  moduleId: string;
  taskId: string;
  status: string;
  result: Record<string, unknown> | null;
  error: string | null;
}

export function Dashboard() {
  const [apiKey, setApiKey] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ninja_api_key") || "";
    }
    return "";
  });
  const [competitors, setCompetitors] = useState<string[]>([""]);
  const [selectedModules, setSelectedModules] = useState<string[]>(
    MODULES.map((m) => m.id)
  );
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  const abortRef = useRef(false);

  const saveApiKey = (value: string) => {
    setApiKey(value);
    if (typeof window !== "undefined") {
      localStorage.setItem("ninja_api_key", value);
    }
  };

  const addCompetitor = () => {
    if (competitors.length < 3) {
      setCompetitors([...competitors, ""]);
    }
  };

  const removeCompetitor = (index: number) => {
    if (competitors.length > 1) {
      setCompetitors(competitors.filter((_, i) => i !== index));
    }
  };

  const updateCompetitor = (index: number, value: string) => {
    const updated = [...competitors];
    updated[index] = value;
    setCompetitors(updated);
  };

  const toggleModule = (moduleId: string) => {
    setSelectedModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((m) => m !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Poll a single task until it completes
  const waitForTask = async (taskId: string): Promise<{ status: string; result: Record<string, unknown> | null; error: string | null }> => {
    const maxAttempts = 120;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const res = await fetch(`/api/result?taskId=${taskId}&wait=1&apiKey=${encodeURIComponent(apiKey.trim())}`);
        if (!res.ok) throw new Error("Failed to poll task");
        const data = await res.json();

        if (data.status === "completed" || data.status === "failed") {
          return {
            status: data.status,
            result: data.result as Record<string, unknown> | null,
            error: data.error,
          };
        }

        if (data.status === "pending") {
          await new Promise((r) => setTimeout(r, 2000));
        }
      } catch {
        await new Promise((r) => setTimeout(r, 3000));
      }
      attempts++;
    }

    return { status: "failed", result: null, error: "Timed out waiting for result" };
  };

  // Submit one task and return its taskId
  const submitTask = async (competitor: string, moduleId: string): Promise<string> => {
    const res = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: apiKey.trim(),
        competitor,
        moduleId,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to submit task");
    }

    const data = await res.json();
    return data.taskId;
  };

  const startScan = async () => {
    if (!apiKey.trim()) {
      setError("Enter your Ninja API key first");
      return;
    }
    const validCompetitors = competitors.filter((c) => c.trim().length > 0);
    if (validCompetitors.length === 0) {
      setError("Enter at least one competitor URL");
      return;
    }
    if (selectedModules.length === 0) {
      setError("Select at least one module");
      return;
    }

    setError(null);
    setScanning(true);
    setTasks([]);
    abortRef.current = false;

    // Build the queue of work
    const queue: Array<{ competitor: string; moduleId: string }> = [];
    for (const competitor of validCompetitors) {
      for (const moduleId of selectedModules) {
        queue.push({ competitor, moduleId });
      }
    }

    const totalTasks = queue.length;

    // Process queue sequentially: submit one task, wait for it to finish, then next
    for (let i = 0; i < queue.length; i++) {
      if (abortRef.current) break;

      const { competitor, moduleId } = queue[i];
      const mod = MODULES.find((m) => m.id === moduleId);
      setProgress(`Running task ${i + 1} of ${totalTasks}: ${mod?.name || moduleId} for ${competitor}`);

      try {
        // Submit the task
        const taskId = await submitTask(competitor, moduleId);

        // Add it to the list as in_progress
        const newTask: TaskInfo = {
          competitor,
          moduleId,
          taskId,
          status: "in_progress",
          result: null,
          error: null,
        };
        setTasks((prev) => [...prev, newTask]);

        // Wait for it to complete before starting the next
        const result = await waitForTask(taskId);

        // Update with the result
        setTasks((prev) =>
          prev.map((t) =>
            t.taskId === taskId
              ? { ...t, status: result.status, result: result.result, error: result.error }
              : t
          )
        );
      } catch (err) {
        // Add as failed task
        const failedTask: TaskInfo = {
          competitor,
          moduleId,
          taskId: `failed-${i}`,
          status: "failed",
          result: null,
          error: err instanceof Error ? err.message : "Unknown error",
        };
        setTasks((prev) => [...prev, failedTask]);
      }
    }

    setScanning(false);
    setProgress("");
  };

  return (
    <>
      <section className="input-section">
        <h2>Ninja API Key</h2>
        <p>Enter your API key to get started (starts with nsk_)</p>
        <div className="competitor-inputs" style={{ marginBottom: "1.5rem" }}>
          <div className="competitor-input-row">
            <input
              type="password"
              placeholder="nsk_your_api_key_here"
              value={apiKey}
              onChange={(e) => saveApiKey(e.target.value)}
              style={{ fontFamily: "monospace" }}
            />
          </div>
        </div>

        <h2>Enter Competitor URLs</h2>
        <p>Add up to 3 competitor websites to analyze (max 3)</p>

        <div className="competitor-inputs">
          {competitors.map((comp, idx) => (
            <div key={idx} className="competitor-input-row">
              <input
                type="text"
                placeholder={`https://competitor${idx + 1}.com`}
                value={comp}
                onChange={(e) => updateCompetitor(idx, e.target.value)}
              />
              {competitors.length > 1 && (
                <button
                  className="btn-remove"
                  onClick={() => removeCompetitor(idx)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {competitors.length < 3 && (
            <button className="btn-add" onClick={addCompetitor}>
              + Add competitor
            </button>
          )}
        </div>

        <div className="modules-section">
          <h3>Intelligence Modules</h3>
          <div className="modules-grid">
            {MODULES.map((mod) => (
              <div
                key={mod.id}
                className={`module-toggle ${selectedModules.includes(mod.id) ? "active" : ""}`}
                onClick={() => toggleModule(mod.id)}
              >
                <span className="icon">{mod.icon}</span>
                <span className="label">{mod.name}</span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <p style={{ color: "var(--danger)", fontSize: "0.85rem", marginBottom: "1rem" }}>
            {error}
          </p>
        )}

        {progress && (
          <p style={{ color: "var(--info)", fontSize: "0.85rem", marginBottom: "1rem" }}>
            {progress}
          </p>
        )}

        <button
          className={`btn-scan ${scanning ? "scanning" : ""}`}
          onClick={startScan}
          disabled={scanning}
        >
          {scanning ? "⏳ Scanning..." : "🔍 Scan Competitors"}
        </button>
      </section>

      {tasks.length > 0 && (
        <section className="results-section">
          <h2>Intelligence Results</h2>
          <div className="results-grid">
            {tasks.map((task) => (
              <ResultCard key={task.taskId} task={task} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
