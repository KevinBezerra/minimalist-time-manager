import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createTask,
  deleteTask,
  readTasks,
  renameTaskCategory,
  subscribeToTaskChanges,
  updateTask,
} from "../services/taskApi";
import {
  createCategory,
  deleteCategory,
  readCategories,
  renameCategory,
  subscribeToCategoryChanges,
} from "../services/categoryApi";

// Single source of truth for tasks. The Today section, the main list and the
// completed view all read from here, so a change made in one is seen by all.
// Every change goes through the actions below: write to storage first, then
// refresh state from storage, so state and storage cannot drift apart.

const TasksContext = createContext(null);

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState(() => readTasks());
  const [categories, setCategories] = useState(() => readCategories());
  const [error, setError] = useState("");
  const [categoryError, setCategoryError] = useState("");

  const refresh = useCallback(() => setTasks(readTasks()), []);

  // Keep this tab up to date when another tab changes the stored tasks.
  useEffect(() => subscribeToTaskChanges(refresh), [refresh]);

  const refreshCategories = useCallback(() => setCategories(readCategories()), []);

  useEffect(
    () => subscribeToCategoryChanges(refreshCategories),
    [refreshCategories]
  );

  // Runs a storage write, then re-reads. Returns the write's result, or null
  // (with an error message) if the write failed.
  const run = useCallback(
    async (action, errorMessage) => {
      try {
        setError("");
        const result = await action();
        refresh();
        return result;
      } catch (err) {
        console.error(err);
        setError(errorMessage);
        return null;
      }
    },
    [refresh]
  );

  const actions = useMemo(
    () => ({
      addTask: (input) => run(() => createTask(input), "Could not add task."),
      updateTask: (id, updates) =>
        run(() => updateTask(id, updates), "Could not update task."),
      deleteTask: (id) => run(() => deleteTask(id), "Could not delete task."),
      completeTask: (id) =>
        run(() => updateTask(id, { isCompleted: 1 }), "Could not complete task."),
      restoreTask: (id) =>
        run(() => updateTask(id, { isCompleted: 0 }), "Could not restore task."),
      unassignTask: (id) =>
        run(
          () => updateTask(id, { period: null, isToday: false }),
          "Could not unassign task."
        ),
      addCategory: async (name) => {
        try {
          setCategoryError("");
          const updatedCategories = createCategory(name);
          setCategories(updatedCategories);
          return true;
        } catch (err) {
          console.error(err);
          setCategoryError(err.message || "Could not add category.");
          return false;
        }
      },
      renameCategory: async (currentName, input) => {
        try {
          setCategoryError("");
          const newName = input.trim();
          if (!newName) {
            throw new Error("Enter a category name.");
          }
          if (!categories.includes(currentName)) {
            throw new Error("Category not found.");
          }
          if (
            categories.some(
              (category) =>
                category !== currentName &&
                category.toLowerCase() === newName.toLowerCase()
            )
          ) {
            throw new Error("That category already exists.");
          }

          renameTaskCategory(currentName, newName);
          const updatedCategories = renameCategory(currentName, newName);
          setCategories(updatedCategories);
          refresh();
          return true;
        } catch (err) {
          console.error(err);
          setCategoryError(err.message || "Could not rename category.");
          return false;
        }
      },
      deleteCategory: async (name) => {
        try {
          setCategoryError("");
          if (tasks.some((task) => task.category === name)) {
            throw new Error("This category is in use. Reassign its tasks before deleting it.");
          }
          const updatedCategories = deleteCategory(name);
          setCategories(updatedCategories);
          return true;
        } catch (err) {
          console.error(err);
          setCategoryError(err.message || "Could not delete category.");
          return false;
        }
      },
    }),
    [run, tasks, categories, refresh]
  );

  const value = useMemo(
    () => ({
      tasks,
      categories,
      activeTasks: tasks.filter((task) => task.isCompleted === 0),
      completedTasks: tasks.filter((task) => task.isCompleted === 1),
      error,
      categoryError,
      ...actions,
    }),
    [tasks, categories, error, categoryError, actions]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error("useTasks must be used inside a TasksProvider");
  }
  return context;
}
