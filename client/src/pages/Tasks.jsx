import { useMemo, useState } from "react";
import TaskItem from "../components/TaskItem/TaskItem";
import AddTaskForm from "../components/AddTaskForm";
import { useTasks } from "../context/TasksContext";
import "./Tasks.css";

const CATEGORY_OPTIONS = ["All Categories", "Personal", "Work", "Health"];
const STATUS_OPTIONS = ["All Status", "Pending", "Completed"];

export default function Tasks() {
  const { tasks, loading, error, addTask } = useTasks();
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Status");

  const visible = useMemo(
    () =>
      tasks.filter((task) => {
        const okCategory =
          category === "All Categories" || task.category === category;

        const okStatus =
          status === "All Status" ||
          (status === "Completed"
            ? task.isCompleted === 1
            : task.isCompleted === 0);

        return okCategory && okStatus;
      }),
    [tasks, category, status],
  );

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Manage and organize your tasks.</p>
        </div>
        <AddTaskForm compact onAddTask={addTask} />
      </header>

      {error && <p className="error-text">{error}</p>}

      <div className="tasks-toolbar">
        <select
          aria-label="Filter by category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="muted-text">Loading…</p>
      ) : visible.length === 0 ? (
        <p className="muted-text">No tasks match these filters.</p>
      ) : (
        <ul className="tasks-list">
          {visible.map((task) => (
            <li key={task.id} className="tasks-list-item">
              <TaskItem task={task} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
