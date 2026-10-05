import { useEffect, useMemo, useState } from "react";
import { TasksContext } from "./TasksContext";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "../services/taskApi";

export default function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    getTasks()
      .then((data) => {
        if (isCurrent) {
          const allTasks = data.map((task) => ({
            ...task,
            period: ["morning", "afternoon", "evening"].includes(task.period)
              ? task.period
              : "morning",
          }));
          setTasks(allTasks);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isCurrent) setError("Tasks couldn't be loaded.");
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  async function addTask(taskInput) {
    try {
      setError("");

      const newTask = await createTask({
        title: taskInput.title,
        category: taskInput.category,
        duration: taskInput.duration,
        period: taskInput.period,
      });

      if (newTask.isCompleted === 0) {
        setTasks((current) => [...current, newTask]);
        return newTask;
      }
      return null;
    } catch (err) {
      console.error(err);
      setError("Task couldn't be created.");
      return null;
    }
  }

  async function editTask(taskId, updates) {
    try {
      const updatedTask = await updateTask(taskId, updates);
      if (!updatedTask) return null;

      setTasks((current) =>
        current.map((task) => (task.id === taskId ? updatedTask : task)),
      );
      return updatedTask;
    } catch (err) {
      console.error(err);
      setError("Task couldn't be updated.");
      return null;
    }
  }

  async function removeTask(taskId) {
    setTasks((current) => current.filter((task) => task.id !== taskId));
    await deleteTask(taskId);
  }

  async function toggleTask(taskId) {
    const target = tasks.find((task) => task.id === taskId);
    if (!target) return;

    const willComplete = target.isCompleted !== 1;

    await editTask(taskId, {
      isCompleted: willComplete ? 1 : 0,
      completedAt: willComplete ? new Date().toISOString() : null,
    });
  }

  const activeTasks = useMemo(
    () => tasks.filter((task) => task.isCompleted !== 1),
    [tasks],
  );

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.isCompleted === 1),
    [tasks],
  );

  const tasksByPeriod = useMemo(() => {
    const grouped = { morning: [], afternoon: [], evening: [] };

    activeTasks.forEach((task) => {
      if (grouped[task.period]) {
        grouped[task.period].push(task);
      }
    });

    return grouped;
  }, [activeTasks]);

  const value = {
    tasks,
    activeTasks,
    completedTasks,
    tasksByPeriod,
    loading,
    error,
    addTask,
    editTask,
    removeTask,
    toggleTask,
  };

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
}
