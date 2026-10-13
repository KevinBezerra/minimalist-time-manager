import { useMemo } from "react";
import { useTasks } from "../context/TasksContext";
import "./Categories.css";

const COLORS = {
  Personal: "var(--badge-personal-bg)",
  Work: "var(--badge-work-bg)",
  Health: "var(--badge-health-bg)",
};

export default function Categories() {
  const { tasks } = useTasks();

  const stats = useMemo(() => {
    const byCategory = {};

    tasks.forEach((task) => {
      const name = task.category || "Personal";

      if (!byCategory[name]) {
        byCategory[name] = { name, total: 0, done: 0, minutes: 0 };
      }

      byCategory[name].total++;

      if (task.isCompleted === 1) {
        byCategory[name].done++;
        byCategory[name].minutes += Number(task.duration) || 0;
      }
    });

    return Object.values(byCategory);
  }, [tasks]);

  if (stats.length === 0) {
    return (
      <div className="page">
        <header className="page-header">
          <div>
            <h1 className="page-title">Categories</h1>
            <p className="page-subtitle">Your time, broken down.</p>
          </div>
        </header>
        <p className="muted-text">No tasks yet.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Your time, broken down.</p>
        </div>
      </header>

      <ul className="category-grid">
        {stats.map((category) => {
          const pending = category.total - category.done;
          const percentage =
            category.total === 0 ? 0 : Math.round((category.done / category.total) * 100);

          return (
            <li key={category.name} className="category-card">
              <div className="category-card-header">
                <span
                  className={`task-badge task-badge-${category.name.toLowerCase()}`}
                  style={{ background: COLORS[category.name] }}
                >
                  {category.name}
                </span>
                <span className="category-count">
                  {category.done}/{category.total}
                </span>
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
            </li>
          );
        })}
      </ul>
    </div>
  );
}
