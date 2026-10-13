import { useState } from "react";
import "./AddTaskForm.css";

const CATEGORIES = ["Personal", "Work", "Health"];
const PERIODS = ["morning", "afternoon", "evening"];
const DURATIONS = [15, 30, 45, 60, 90, 120];

function formatDuration(minutes) {
  const total = Number(minutes) || 0;
  if (total < 60) return `${total} min`;
  const rest = total % 60;
  return rest === 0 ? `${total / 60} h` : `${total / 60} h ${rest} min`;
}

function AddTaskForm({ onAddTask, compact = false }) {
  const [isOpen, setIsOpen] = useState(!compact);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [category, setCategory] = useState("Personal");
  const [period, setPeriod] = useState("morning");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    setSubmitting(true);
    try {
      const added = await onAddTask({
        title: cleanTitle,
        category,
        duration,
        period,
      });

      if (added) {
        setTitle("");
        if (compact) setIsOpen(false);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    setIsOpen(false);
    setTitle("");
  }

  return (
    <div className="add-task">
      <button
        type="button"
        className="btn-add-task"
        onClick={() => compact && setIsOpen((open) => !open)}
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
        Add Task
      </button>

      {isOpen && (
        <form
          className={`add-task-panel ${compact ? "floating" : ""}`}
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            placeholder="What needs to be done?"
            value={title}
            autoFocus={compact}
            onChange={(event) => setTitle(event.target.value)}
          />

          <div className="add-task-fields">
            <select
              aria-label="Period"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
            >
              {PERIODS.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>

            <select
              aria-label="Category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              aria-label="Duration"
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
            >
              {DURATIONS.map((option) => (
                <option key={option} value={option}>
                  {formatDuration(option)}
                </option>
              ))}
            </select>
          </div>

          <div className="add-task-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={submitting || !title.trim()}
            >
              {submitting ? "Adding…" : "Add"}
            </button>

            {compact && (
              <button type="button" className="btn-ghost" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}

export default AddTaskForm;
