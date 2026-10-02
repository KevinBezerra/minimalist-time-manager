// Using localStorage fallback as per project plan

export const STORAGE_KEY = "tasks";

const VALID_PERIODS = ["morning", "afternoon", "evening"];

// Turns whatever was stored for one task into a well-formed task, or returns
// null when the entry is unusable (so one bad entry never breaks the app).
function normalizeTask(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (typeof raw.id !== "number" || typeof raw.title !== "string") return null;

  return {
    ...raw,
    isCompleted: raw.isCompleted === 1 || raw.isCompleted === true ? 1 : 0,
    isToday: Boolean(raw.isToday),
    period: VALID_PERIODS.includes(raw.period) ? raw.period : "morning",
  };
}

// Synchronous read used by the context provider and by the writes below.
// Missing, corrupt, or unexpected data falls back to an empty list.
export function readTasks() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(parsed) ? parsed.map(normalizeTask).filter(Boolean) : [];
  } catch (error) {
    console.error("Could not read tasks from storage:", error);
    return [];
  }
}

// Throws if the browser refuses the write (storage full or disabled), so
// callers can report the failure instead of silently losing the change.
function writeTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Calls onChange whenever another tab or window changes the stored tasks.
// The browser only fires "storage" events in the *other* tabs, so changes made
// in this tab are handled by the caller. Returns a function that unsubscribes.
export function subscribeToTaskChanges(onChange) {
  function handleStorage(event) {
    // event.key is null when the whole storage area was cleared
    if (event.key === null || event.key === STORAGE_KEY) {
      onChange();
    }
  }

  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}

export async function getTasks() {
  return readTasks();
}

export async function createTask(task) {
  const tasks = readTasks();

  const newTask = {
    id: Date.now(), // Generate a unique numeric ID
    title: task.title,
    isCompleted: 0,
    isToday: false,
    period: task.period || "morning", // defaults to morning
    category: task.category || "Personal",
    duration: task.duration || 30,
  };

  tasks.push(newTask);
  writeTasks(tasks);

  return newTask;
}

export async function updateTask(id, updates) {
  let updatedTask = null;

  const tasks = readTasks().map((t) => {
    if (t.id === id) {
      updatedTask = { ...t, ...updates };
      return updatedTask;
    }
    return t;
  });

  writeTasks(tasks);
  return updatedTask;
}

export async function deleteTask(id) {
  const tasks = readTasks().filter((t) => t.id !== id);
  writeTasks(tasks);

  return { message: "Task deleted successfully" };
}
