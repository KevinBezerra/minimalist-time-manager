import { useMemo } from "react";
import TaskItem from "../components/TaskItem/TaskItem";
import { useTasks } from "../context/TasksContext";
import "./Completed.css";

function timeAgo(isoString) {
  if (!isoString) return "";

  const then = new Date(isoString).getTime();
  if (Number.isNaN(then)) return "";

  const minutes = Math.floor((Date.now() - then) / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;

  const days = Math.floor(hours / 24);
  return `${days} d ago`;
}

export default function Completed() {
  const { completedTasks } = useTasks();

  const sorted = useMemo(
    () =>
      [...completedTasks].sort(
        (a, b) => new Date(b.completedAt ?? 0) - new Date(a.completedAt ?? 0),
      ),
    [completedTasks],
  );

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Completed</h1>
          <p className="page-subtitle">A look back at what you've finished.</p>
        </div>
      </header>

      {sorted.length === 0 ? (
        <p className="muted-text">Nothing completed yet.</p>
      ) : (
        <ul className="completed-list">
          {sorted.map((task) => (
            <li key={task.id} className="completed-item">
              <span className="completed-time">{timeAgo(task.completedAt)}</span>
              <TaskItem task={task} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
