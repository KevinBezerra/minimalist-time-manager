import { useEffect, useRef, useState } from "react";
import "./TaskItem.css";

// Displays one task. The task itself comes from the shared tasks state (props);
// only the in-progress edit (draft title and day part) lives here.
function TaskItem({
  task,
  onDeleteTask,
  onCompleteTask,
  onRestoreTask,
  onUpdateTask,
  onUnassignTask,
}) {
  const isCompleted = task.isCompleted === 1;
  const period = task.period || "";
  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState(task.title);
  const [draftPeriod, setDraftPeriod] = useState(period);
  const [draftDuration, setDraftDuration] = useState(task.duration || 30);
  const actionsRef = useRef(null);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    function handlePointerDown(event) {
      if (!actionsRef.current?.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  function handleToggle() {
    if (isCompleted) {
      onRestoreTask?.(task.id);
    } else {
      onCompleteTask(task.id);
    }
  }

  async function handleSave() {
    const cleanTitle = draftTitle.trim();

    if (!cleanTitle) {
      return;
    }

    const updates = { title: cleanTitle, duration: draftDuration };
    if (draftPeriod !== period) {
      updates.period = draftPeriod || null;
      updates.isToday = Boolean(draftPeriod);
    }

    const updatedTask = await onUpdateTask(task.id, {
      ...updates,
    });

    if (updatedTask) {
      setIsEditing(false);
    }
  }

  function handleStartEdit() {
    setDraftPeriod(period);
    setDraftTitle(task.title);
    setDraftDuration(task.duration || 30);
    setIsEditing(true);
    setIsMenuOpen(false);
  }

  function handleDelete() {
    const confirmed = window.confirm(`Delete "${task.title}"? This action cannot be undone.`);
    if (!confirmed) return;

    setIsMenuOpen(false);
    onDeleteTask(task.id);
  }

  function handleUnassign() {
    setIsMenuOpen(false);
    onUnassignTask(task.id);
  }

  function handleRestore() {
    setIsMenuOpen(false);
    onRestoreTask?.(task.id);
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
      {!isEditing && (
        <span className={`task-badge task-badge-${task.category?.toLowerCase() || "default"}`}>
          {task.category || "Personal"}
        </span>
      )}

      {!isEditing && task.duration && (
        <span className="task-duration">{`${task.duration} min`}</span>
      )}

      <div className="task-actions" ref={actionsRef}>
        {isEditing ? (
          <>
            <select
              aria-label="Duration"
              value={draftDuration}
              onChange={(event) => setDraftDuration(Number(event.target.value))}
            >
              <option value={30}>30 min</option>
              <option value={60}>1 h</option>
              <option value={90}>1.5 h</option>
              <option value={120}>2 h</option>
            </select>
            <select
              aria-label="Day part"
              value={draftPeriod}
              onChange={(event) => setDraftPeriod(event.target.value)}
            >
              <option value="">Unassigned</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
            <button type="button" onClick={handleSave}>
              Save
            </button>
            <button type="button" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              className="task-menu-trigger"
              type="button"
              aria-label={`More actions for ${task.title}`}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <span aria-hidden="true">⋮</span>
            </button>
            {isMenuOpen && (
              <div className="task-menu" role="menu">
                {isCompleted ? (
                  <button type="button" role="menuitem" onClick={handleRestore}>
                    Restore
                  </button>
                ) : (
                  <>
                    <button type="button" role="menuitem" onClick={handleStartEdit}>
                      Edit
                    </button>
                    <button type="button" role="menuitem" onClick={handleUnassign}>
                      Unassign
                    </button>
                    <button
                      className="task-menu-delete"
                      type="button"
                      role="menuitem"
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default TaskItem;
