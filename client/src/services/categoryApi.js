export const CATEGORY_STORAGE_KEY = "task-categories";

const DEFAULT_CATEGORIES = ["Personal", "Work", "Health"];

function normalizeCategories(categories) {
  const uniqueCategories = new Map();

  categories.forEach((category) => {
    if (typeof category !== "string") return;
    const name = category.trim();
    if (name && !uniqueCategories.has(name.toLowerCase())) {
      uniqueCategories.set(name.toLowerCase(), name);
    }
  });

  return [...uniqueCategories.values()];
}

export function readCategories() {
  try {
    const stored = localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (stored === null) return DEFAULT_CATEGORIES;

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? normalizeCategories(parsed) : DEFAULT_CATEGORIES;
  } catch (error) {
    console.error("Could not read categories from storage:", error);
    return DEFAULT_CATEGORIES;
  }
}

export function subscribeToCategoryChanges(onChange) {
  function handleStorage(event) {
    if (event.key === null || event.key === CATEGORY_STORAGE_KEY) {
      onChange();
    }
  }

  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}

export function createCategory(input) {
  const name = input.trim();
  if (!name) {
    throw new Error("Enter a category name.");
  }

  const categories = readCategories();
  if (categories.some((category) => category.toLowerCase() === name.toLowerCase())) {
    throw new Error("That category already exists.");
  }

  const updatedCategories = [...categories, name];
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(updatedCategories));
  return updatedCategories;
}

export function renameCategory(currentName, input) {
  const name = input.trim();
  if (!name) {
    throw new Error("Enter a category name.");
  }

  const categories = readCategories();
  if (!categories.includes(currentName)) {
    throw new Error("Category not found.");
  }
  if (
    categories.some(
      (category) =>
        category !== currentName && category.toLowerCase() === name.toLowerCase()
    )
  ) {
    throw new Error("That category already exists.");
  }

  const updatedCategories = categories.map((category) =>
    category === currentName ? name : category
  );
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(updatedCategories));
  return updatedCategories;
}

export function deleteCategory(name) {
  const categories = readCategories();
  if (!categories.includes(name)) {
    throw new Error("Category not found.");
  }

  const updatedCategories = categories.filter((category) => category !== name);
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(updatedCategories));
  return updatedCategories;
}
