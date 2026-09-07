"use client";

import { useState } from "react";
import { createTask, deleteTask, toggleTask } from "@/lib/actions/tasks";
import type { Task } from "@/types/task";

export function TodoList({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [syncedTasks, setSyncedTasks] = useState(initialTasks);
  const [newTitle, setNewTitle] = useState("");
  const [pending, setPending] = useState(false);

  if (initialTasks !== syncedTasks) {
    setSyncedTasks(initialTasks);
    setTasks(initialTasks);
  }

  const remaining = tasks.filter((t) => !t.done).length;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;

    setNewTitle("");
    setPending(true);
    await createTask(title);
    setPending(false);
  }

  async function handleToggle(task: Task) {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t)),
    );
    const result = await toggleTask(task.id, !task.done);
    if (result.error) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, done: task.done } : t)),
      );
    }
  }

  async function handleDelete(id: string) {
    const previous = tasks;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    const result = await deleteTask(id);
    if (result.error) {
      setTasks(previous);
    }
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <h2 className="text-sm font-semibold text-slate-800">
        ✅ To-do ({remaining} remaining)
      </h2>

      <form onSubmit={handleAdd} className="mt-2 flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Put out bandit signs, post on Marketplace…"
          className="w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm focus:border-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending || !newTitle.trim()}
          className="shrink-0 rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {tasks.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">
          Nothing here yet — add tasks that aren&apos;t tied to a specific
          lead.
        </p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => handleToggle(task)}
                className="h-4 w-4 shrink-0 rounded border-slate-300"
              />
              <span
                className={`flex-1 text-sm ${
                  task.done ? "text-slate-400 line-through" : "text-slate-700"
                }`}
              >
                {task.title}
              </span>
              <button
                onClick={() => handleDelete(task.id)}
                className="shrink-0 text-xs text-slate-400 hover:text-red-600"
                aria-label="Delete task"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
