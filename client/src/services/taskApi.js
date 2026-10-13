// Using localStorage fallback as per project plan

export const STORAGE_KEY = "tasks";
export const CATEGORIES_STORAGE_KEY = "task-categories";
export const CATEGORY_COLORS_STORAGE_KEY = "task-category-colors";
export const DEFAULT_CATEGORIES = ["Personal", "Work", "Health"];

const VALID_PERIODS = ["morning", "afternoon", "evening"];
const DEFAULT_CATEGORY_COLORS = {
  personal: {
    background: "var(--badge-personal-bg)",
    text: "var(--badge-personal-text)",
  },
  work: {
    background: "var(--badge-work-bg)",
    text: "var(--badge-work-text)",
  },
  health: {
    background: "var(--badge-health-bg)",
    text: "var(--badge-health-text)",
  },
};

// Turns whatever was stored for one task into a well-formed task, or returns
// null when the entry is unusable (so one bad entry never breaks the app).
function normalizeTask(raw) {
  if (!raw || typeof raw !== "object") return null;
  const hasValidId =
    (typeof raw.id === "string" && raw.id !== "") || Number.isFinite(raw.id);
  if (!hasValidId || typeof raw.title !== "string") return null;

  return {
    ...raw,
    isCompleted: raw.isCompleted === 1 || raw.isCompleted === true ? 1 : 0,
    isToday: Boolean(raw.isToday),
    period:
      raw.period === null
        ? null
        : VALID_PERIODS.includes(raw.period)
          ? raw.period
          : "morning",
  };
}

// crypto.randomUUID() only exists in secure contexts (HTTPS or localhost), so
// fall back to a timestamp plus random suffix when it is unavailable.
function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
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

export function readCategories() {
  let storedCategories = DEFAULT_CATEGORIES;
  try {
    const stored = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    const parsed = stored === null ? DEFAULT_CATEGORIES : JSON.parse(stored);
    if (Array.isArray(parsed)) {
      storedCategories = parsed.filter(
        (category) => typeof category === "string" && category.trim(),
      );
    } else {
      console.error("Could not read categories from storage: expected a list.");
    }
  } catch (error) {
    console.error("Could not read categories from storage:", error);
  }

  const taskCategories = readTasks()
    .map((task) => task.category)
    .filter((category) => typeof category === "string" && category.trim());
  const uniqueCategories = new Map();

  [...storedCategories, ...taskCategories].forEach((category) => {
    const clean = category.trim();
    const key = clean.toLocaleLowerCase();
    if (!uniqueCategories.has(key)) uniqueCategories.set(key, clean);
  });

  return Array.from(uniqueCategories.values());
}

function createCategoryColor(index, usedBackgrounds) {
  let candidateIndex = index;
  let color;

  do {
    const cycle = Math.floor(candidateIndex / 360);
    const hue = (candidateIndex * 137.508) % 360;
    const saturation = 76 - (cycle % 3) * 8;
    const lightness = 92 - (cycle % 5) * 7;
    color = {
      background: `hsl(${hue.toFixed(3)} ${saturation}% ${lightness}%)`,
      text: `hsl(${hue.toFixed(3)} ${saturation}% 30%)`,
    };
    candidateIndex += 1;
  } while (usedBackgrounds.has(color.background));

  return color;
}

export function readCategoryColors() {
  let storedColors = {};
  try {
    const stored = localStorage.getItem(CATEGORY_COLORS_STORAGE_KEY);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        storedColors = parsed;
      } else {
        console.error("Could not read category colors from storage: expected a map.");
      }
    }
  } catch (error) {
    console.error("Could not read category colors from storage:", error);
  }

  const colors = { ...DEFAULT_CATEGORY_COLORS };
  Object.entries(storedColors).forEach(([name, color]) => {
    if (
      color &&
      typeof color.background === "string" &&
      typeof color.text === "string"
    ) {
      colors[name.toLocaleLowerCase()] = color;
    }
  });

  const usedBackgrounds = new Set(
    Object.values(colors).map((color) => color.background),
  );
  readCategories().forEach((name, index) => {
    const key = name.toLocaleLowerCase();
    if (!colors[key]) {
      const color = createCategoryColor(index, usedBackgrounds);
      colors[key] = color;
      usedBackgrounds.add(color.background);
    }
  });

  return colors;
}

export async function createCategory(name) {
  const cleanName = name.trim();
  if (!cleanName) throw new Error("Category name cannot be empty.");

  const categories = readCategories();
  if (
    categories.some(
      (category) => category.toLocaleLowerCase() === cleanName.toLocaleLowerCase(),
    )
  ) {
    throw new Error("A category with this name already exists.");
  }

  const categoryColors = readCategoryColors();
  const usedBackgrounds = new Set(
    Object.values(categoryColors).map((color) => color.background),
  );
  const color = createCategoryColor(categories.length, usedBackgrounds);
  const updatedCategories = [...categories, cleanName];
  localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updatedCategories));
  localStorage.setItem(
    CATEGORY_COLORS_STORAGE_KEY,
    JSON.stringify({
      ...categoryColors,
      [cleanName.toLocaleLowerCase()]: color,
    }),
  );
  return cleanName;
}

export async function renameCategory(currentName, name) {
  const cleanName = name.trim();
  if (!cleanName) throw new Error("Category name cannot be empty.");

  const categories = readCategories();
  const currentCategory = categories.find(
    (category) => category.toLocaleLowerCase() === currentName.toLocaleLowerCase(),
  );
  if (!currentCategory) throw new Error("Category no longer exists.");
  if (
    categories.some(
      (category) =>
        category.toLocaleLowerCase() !== currentCategory.toLocaleLowerCase() &&
        category.toLocaleLowerCase() === cleanName.toLocaleLowerCase(),
    )
  ) {
    throw new Error("A category with this name already exists.");
  }

  const tasks = readTasks();
  const updatedTasks = tasks.map((task) =>
    typeof task.category === "string" &&
    task.category.toLocaleLowerCase() === currentCategory.toLocaleLowerCase()
      ? { ...task, category: cleanName }
      : task,
  );
  const updatedCategories = categories.map((category) =>
    category === currentCategory ? cleanName : category,
  );
  const categoryColors = readCategoryColors();
  const currentColor = categoryColors[currentCategory.toLocaleLowerCase()];
  const updatedColors = { ...categoryColors };
  delete updatedColors[currentCategory.toLocaleLowerCase()];
  updatedColors[cleanName.toLocaleLowerCase()] = currentColor;

  const previousTaskStorage = localStorage.getItem(STORAGE_KEY);
  const previousCategoryStorage = localStorage.getItem(CATEGORIES_STORAGE_KEY);
  const previousColorStorage = localStorage.getItem(CATEGORY_COLORS_STORAGE_KEY);
  try {
    if (updatedTasks.some((task, index) => task !== tasks[index])) {
      writeTasks(updatedTasks);
    }
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updatedCategories));
    localStorage.setItem(CATEGORY_COLORS_STORAGE_KEY, JSON.stringify(updatedColors));
  } catch (error) {
    try {
      if (previousTaskStorage === null) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, previousTaskStorage);
      }
      if (previousCategoryStorage === null) {
        localStorage.removeItem(CATEGORIES_STORAGE_KEY);
      } else {
        localStorage.setItem(CATEGORIES_STORAGE_KEY, previousCategoryStorage);
      }
      if (previousColorStorage === null) {
        localStorage.removeItem(CATEGORY_COLORS_STORAGE_KEY);
      } else {
        localStorage.setItem(CATEGORY_COLORS_STORAGE_KEY, previousColorStorage);
      }
    } catch (rollbackError) {
      console.error("Could not roll back category rename:", rollbackError);
    }
    throw error;
  }
  return cleanName;
}

export async function deleteCategory(name) {
  const cleanName = name.trim();
  const categories = readCategories();
  const category = categories.find(
    (item) => item.toLocaleLowerCase() === cleanName.toLocaleLowerCase(),
  );
  if (!category) throw new Error("Category no longer exists.");

  const hasAssignedTasks = readTasks().some(
    (task) =>
      typeof task.category === "string" &&
      task.category.toLocaleLowerCase() === category.toLocaleLowerCase(),
  );
  if (hasAssignedTasks) {
    throw new Error("Reassign or remove this category's tasks before deleting it.");
  }

  const updatedCategories = categories.filter((item) => item !== category);
  const updatedColors = { ...readCategoryColors() };
  delete updatedColors[category.toLocaleLowerCase()];
  localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updatedCategories));
  localStorage.setItem(CATEGORY_COLORS_STORAGE_KEY, JSON.stringify(updatedColors));
  return category;
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
    if (
      event.key === null ||
      event.key === STORAGE_KEY ||
      event.key === CATEGORIES_STORAGE_KEY ||
      event.key === CATEGORY_COLORS_STORAGE_KEY
    ) {
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
    id: generateId(),
    title: task.title,
    isCompleted: 0,
    isToday: false,
    completedAt: null,
    period: task.period ?? null,
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
