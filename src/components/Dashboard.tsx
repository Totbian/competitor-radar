"use client";

import { useState, useCallback } from "react";
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

  const pollTask = useCallback(async (taskId: string): Promise<TaskInfo | null> => {
    const maxAttempts = 120; // 30 min max with long-poll
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const res = await fetch(`/api/result?taskId=${taskId}&wait=1&apiKey=${encodeURIComponent(apiKey.trim())}`);
        if (!res.ok) throw new Error("Failed to poll task");
        const data = await res.json();

        if (data.status === "completed" || data.status === "failed") {
          return data;
        }

        // Small delay between polls for pending tasks
        if (data.status === "pending") {
          await new Promise((r) => setTimeout(r, 2000));
        }
      } catch {
        await new Promise((r) => setTimeout(r, 3000));
      }
      attempts++;
    }
    return null;
  }, [apiKey]);

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

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          competitors: validCompetitors,
          modules: selectedModules,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start scan");
      }

      const data = await res.json();
      const initialTasks: TaskInfo[] = data.tasks.map(
        (t: { competitor: string; moduleId: string; taskId: string }) => ({
          ...t,
          status: "pending",
          result: null,
          error: null,
        })
      );

      setTasks(initialTasks);

      // Poll all tasks in parallel
      initialTasks.forEach(async (task) => {
        // Update to in_progress
        setTasks((prev) =>
          prev.map((t) =>
            t.taskId === task.taskId ? { ...t, status: "in_progress" } : t
          )
        );

        const result = await pollTask(task.taskId);
        if (result) {
          setTasks((prev) =>
            prev.map((t) =>
              t.taskId === task.taskId
                ? {
                    ...t,
                    status: result.status,
                    result: result.result as Record<string, unknown> | null,
                    error: result.error,
                  }
                : t
            )
          );
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setScanning(false);
    }
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

        <button
          className={`btn-scan ${scanning ? "scanning" : ""}`}
          onClick={startScan}
          disabled={scanning}
        >
          {scanning ? "⏳ Launching scans..." : "🔍 Scan Competitors"}
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
