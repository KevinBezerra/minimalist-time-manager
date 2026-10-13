import { useEffect, useMemo, useRef, useState } from "react";
import { useTasks } from "../context/TasksContext";
import "./Categories.css";

const COLORS = {
  Personal: "var(--badge-personal-bg)",
  Work: "var(--badge-work-bg)",
  Health: "var(--badge-health-bg)",
};

function CategoryActions({ category, onRename, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const hasTasks = category.total > 0;

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleOutside(event) {
      if (!menuRef.current?.contains(event.target)) setIsOpen(false);
    }

    function handleEscape(event) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="category-menu" ref={menuRef}>
      <button
        type="button"
        className="category-menu-trigger"
        aria-label={`Options for ${category.name}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      </button>

      {isOpen && (
        <div className="category-menu-items" role="menu">
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onRename(category.name);
            }}
          >
            Rename
          </button>
          <button
            type="button"
            role="menuitem"
            className="category-menu-delete"
            disabled={hasTasks}
            title={
              hasTasks
                ? "Reassign or remove all tasks in this category before deleting it."
                : "Delete category"
            }
            onClick={() => {
              setIsOpen(false);
              onDelete(category.name);
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default function Categories() {
  const { tasks, categories, addCategory, renameCategory, deleteCategory, error } =
    useTasks();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [validationError, setValidationError] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    if (!isAddOpen) return undefined;

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsAddOpen(false);
        setNewCategory("");
        setValidationError("");
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isAddOpen]);

  const stats = useMemo(() => {
    const byCategory = new Map(
      categories.map((name) => [name, { name, total: 0, done: 0, minutes: 0 }]),
    );

    tasks.forEach((task) => {
      const name = task.category || "Personal";

      if (!byCategory.has(name)) {
        byCategory.set(name, { name, total: 0, done: 0, minutes: 0 });
      }

      const category = byCategory.get(name);
      category.total++;

      if (task.isCompleted === 1) {
        category.done++;
        category.minutes += Number(task.duration) || 0;
      }
    });

    return Array.from(byCategory.values());
  }, [tasks, categories]);

  async function handleAddCategory(event) {
    event.preventDefault();
    const cleanName = newCategory.trim();

    if (!cleanName) {
      setValidationError("Enter a category name.");
      return;
    }
    if (
      categories.some(
        (category) =>
          category !== editingCategory &&
          category.toLocaleLowerCase() === cleanName.toLocaleLowerCase(),
      )
    ) {
      setValidationError("A category with that name already exists.");
      return;
    }

    setValidationError("");
    const result = editingCategory
      ? await renameCategory(editingCategory, cleanName)
      : await addCategory(cleanName);
    if (result) {
      setNewCategory("");
      setIsAddOpen(false);
      setEditingCategory(null);
    }
  }

  function closeAddCategory() {
    setIsAddOpen(false);
    setNewCategory("");
    setValidationError("");
    setEditingCategory(null);
  }

  function openAddCategory() {
    setEditingCategory(null);
    setNewCategory("");
    setValidationError("");
    setIsAddOpen(true);
  }

  function openRenameCategory(name) {
    setEditingCategory(name);
    setNewCategory(name);
    setValidationError("");
    setIsAddOpen(true);
  }

  async function handleDeleteCategory(name) {
    await deleteCategory(name);
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Your time, broken down.</p>
        </div>
        <button
          type="button"
          className="btn-add-task"
          onClick={openAddCategory}
        >
          <svg
            className="btn-add-task-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Category
        </button>
      </header>

      {error && <p className="error-text">{error}</p>}

      {stats.length === 0 ? (
        <p className="muted-text">No categories yet.</p>
      ) : (
        <ul className="category-grid">
          {stats.map((category) => {
            const pending = category.total - category.done;
            const percentage =
              category.total === 0
                ? 0
                : Math.round((category.done / category.total) * 100);
            const categoryColor = COLORS[category.name];

            return (
              <li key={category.name} className="category-card">
                <div className="category-card-header">
                  <span
                    className={`task-badge task-badge-${categoryColor ? category.name.toLowerCase() : "default"}`}
                    style={categoryColor ? { background: categoryColor } : undefined}
                  >
                    {category.name}
                  </span>
                  <span className="category-count">
                    {category.done}/{category.total}
                  </span>
                  <CategoryActions
                    category={category}
                    onRename={openRenameCategory}
                    onDelete={handleDeleteCategory}
                  />
                </div>

                <p className="category-pending">
                  {pending} pending · {category.minutes} min completed
                </p>

                <div className="category-progress">
                  <div
                    className="category-progress-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <span className="category-percentage">{percentage}% done</span>
                {category.total > 0 && (
                  <p className="category-delete-hint">
                    Reassign or remove its {category.total}{" "}
                    {category.total === 1 ? "task" : "tasks"} to enable deletion.
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {isAddOpen && (
        <div
          className="category-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeAddCategory();
          }}
        >
          <div
            className="category-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-category-title"
          >
            <div className="category-modal-header">
              <div>
                <h2 id="new-category-title">
                  {editingCategory ? "Rename Category" : "New Category"}
                </h2>
                <p>
                  {editingCategory
                    ? "Choose a new name for this category."
                    : "Create a category to organize your tasks."}
                </p>
              </div>
              <button
                type="button"
                className="category-modal-close"
                onClick={closeAddCategory}
                aria-label="Close new category dialog"
              >
                ×
              </button>
            </div>
            <form className="category-form" onSubmit={handleAddCategory}>
              <label htmlFor="new-category-name">Category name</label>
              <input
                id="new-category-name"
                type="text"
                autoFocus
                maxLength={40}
                value={newCategory}
                onChange={(event) => {
                  setNewCategory(event.target.value);
                  setValidationError("");
                }}
              />
              {validationError && (
                <p className="category-validation-error">{validationError}</p>
              )}
              <div className="category-form-actions">
                <button type="button" className="btn-ghost" onClick={closeAddCategory}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={!newCategory.trim()}>
                  {editingCategory ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
