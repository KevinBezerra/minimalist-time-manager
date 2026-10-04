import { useState } from "react";
import "./TaskItem.css";

// Displays one task. The task itself comes from the shared tasks state (props);
// only the in-progress edit (draft title and day part) lives here.
function TaskItem({ task, onDeleteTask, onCompleteTask, onRestoreTask, onUpdateTask }) {
  const isCompleted = task.isCompleted === 1;
  const period = task.period || "morning";
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [draftPeriod, setDraftPeriod] = useState(period);

  function handleToggle() {
    if (isCompleted) {
      onRestoreTask?.(task.id);
    } else {
      onCompleteTask(task.id);
    }
  }

  async function handlePeriodChange(event) {
    const nextPeriod = event.target.value;
    setDraftPeriod(nextPeriod);
    const cleanTitle = draftTitle.trim();
    const updates = { period: nextPeriod };

    if (cleanTitle) {
      updates.title = cleanTitle;
    }

    const updatedTask = await onUpdateTask(task.id, updates);

    if (updatedTask) {
      setIsEditing(false);
    }
  }

  async function handleEdit() {
    if (!isEditing) {
      setDraftPeriod(period);
      setDraftTitle(task.title);
      setIsEditing(true);
      return;
    }

    const cleanTitle = draftTitle.trim();

    if (!cleanTitle) {
      return;
    }

    const updatedTask = await onUpdateTask(task.id, {
      title: cleanTitle,
      period: draftPeriod,
    });

    if (updatedTask) {
      setIsEditing(false);
    }
  }

  function handleDelete() {
    onDeleteTask(task.id);
  }

  return (
    <div className={`task-row ${isCompleted ? "completed" : ""}`}>
      <button
        className={`task-checkbox ${isCompleted ? "checked" : ""}`}
        onClick={handleToggle}
        aria-label="Toggle task"
        >
          {isCompleted && <span className="checkMark">✓</span>}
      </button>

      <div className="task-content">
        {isEditing ? (
          <input
            className="task-edit-input"
            type="text"
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
          />
        ) : (
          <span className="task-title">{task.title}</span>
        )}
      </div>
      <span className={`task-badge task-badge-${task.category?.toLowerCase() || "default"}`}>
        {task.category || "Personal"}
      </span>

      <span className="task-duration">
        {task.duration ? `${task.duration} min` : ""}
      </span>

      {!isEditing && (
        <span className="task-duration">
          {period.charAt(0).toUpperCase() + period.slice(1)}
        </span>
      )}

      <div className="task-actions">
        {isEditing && (
          <select
            aria-label="Day part"
            value={draftPeriod}
            onChange={handlePeriodChange}
          >
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </select>
        )}

        <button type="button" onClick={handleEdit}>
          {isEditing ? "Save" : "Edit"}
        </button>

        <button type="button" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default TaskItem;
