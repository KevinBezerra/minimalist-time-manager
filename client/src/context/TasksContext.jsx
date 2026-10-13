import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createTask,
  createCategory as saveCategory,
  deleteCategory as removeCategory,
  deleteTask,
  readCategories,
  readTasks,
  renameCategory as updateCategoryName,
  subscribeToTaskChanges,
  updateTask,
} from "../services/taskApi";

// Shared source of truth for tasks and categories. Every change goes through
// the actions below: write to storage first, then refresh so state and storage
// cannot drift apart.

const TasksContext = createContext(null);

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState(() => readTasks());
  const [categories, setCategories] = useState(() => readCategories());
  const [error, setError] = useState("");

  const refresh = useCallback(() => {
    setTasks(readTasks());
    setCategories(readCategories());
  }, []);

  // Keep this tab up to date when another tab changes the stored tasks.
  useEffect(() => subscribeToTaskChanges(refresh), [refresh]);

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
      addCategory: (name) =>
        run(() => saveCategory(name), "Could not create category."),
      renameCategory: (currentName, name) =>
        run(
          () => updateCategoryName(currentName, name),
          "Could not rename category.",
        ),
      deleteCategory: (name) =>
        run(
          () => removeCategory(name),
          "Could not delete category. Reassign its tasks first, if any.",
        ),
      updateTask: (id, updates) =>
        run(() => updateTask(id, updates), "Could not update task."),
      deleteTask: (id) => run(() => deleteTask(id), "Could not delete task."),
      completeTask: (id) =>
        run(
          () => updateTask(id, { isCompleted: 1, completedAt: new Date().toISOString() }),
          "Could not complete task."
        ),
      restoreTask: (id) =>
        run(
          () => updateTask(id, { isCompleted: 0, completedAt: null }),
          "Could not restore task."
        ),
      // Takes the task out of the Today blocks; it stays in the task list.
      unassignTask: (id) =>
        run(() => updateTask(id, { period: null }), "Could not unassign task."),
    }),
    [run]
  );

  const value = useMemo(() => {
    const activeTasks = tasks.filter((task) => task.isCompleted === 0);
    const tasksByPeriod = { morning: [], afternoon: [], evening: [] };
    activeTasks.forEach((task) => tasksByPeriod[task.period]?.push(task));

    return {
      tasks,
      categories,
      activeTasks,
      completedTasks: tasks.filter((task) => task.isCompleted === 1),
      tasksByPeriod,
      error,
      ...actions,
      // Flips a task between active and completed.
      toggleTask: (id) => {
        const task = tasks.find((t) => t.id === id);
        if (!task) return null;
        return task.isCompleted === 1 ? actions.restoreTask(id) : actions.completeTask(id);
      },
    };
  }, [tasks, categories, error, actions]);

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
