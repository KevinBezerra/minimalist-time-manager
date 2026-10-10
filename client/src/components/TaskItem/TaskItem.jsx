import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTasks } from "../../context/TasksContext";
import "./TaskItem.css";

const PERIODS = ["morning", "afternoon", "evening"];

function formatDuration(minutes) {
  const total = Number(minutes) || 0;
  if (total < 60) return `${total} min`;
  const rest = total % 60;
  return rest === 0 ? `${total / 60} h` : `${total / 60} h ${rest} min`;
}

function TaskItem({ task }) {
  const { toggleTask, deleteTask, updateTask } = useTasks();
  const menuRef = useRef(null);
  const triggerRef = useRef(null);


  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState(null);
  // floating dropdown menu coordinates (top, left) for positioning the menu
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });


  const isCompleted = task.isCompleted === 1;

  const isEditingTitle = isEditing && draftTitle !== null;
  const title = draftTitle ?? task.title;

  const handleToggleMenu = () => {
    if (!isMenuOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuCoords({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX - 160, // align menu to the right of the trigger
      });
    }
    setIsMenuOpen((open) => !open);
  }

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleOutside(event) {

      const menuElement = document.getElementById(`portal-menu-${task.id}`);
      const isInside =
        menuRef.current?.contains(event.target) || menuElement?.contains(event.target);

      if (isInside) return;
      setIsMenuOpen(false);
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen, task.id]);

  function handleCancel() {
    setDraftTitle(null);
    setIsEditing(false);
  }

  async function handleSave() {
    const clean = (draftTitle ?? "").trim();
    if (!clean) return;

    const updated = await updateTask(task.id, { title: clean });
    if (updated) handleCancel();
  }

  return (
    <div className={`task-row ${isCompleted ? "completed" : ""}`}>
      <button
        type="button"
        className={`task-checkbox ${isCompleted ? "checked" : ""}`}
        onClick={() => toggleTask(task.id)}
        aria-label="Toggle task"
      >
        {isCompleted && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </button>

      <div className="task-content">
        {isEditingTitle ? (
          <input
            className="task-edit-input"
            type="text"
            value={title}
            autoFocus
            onChange={(e) => setDraftTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
          />
        ) : (
          <span className="task-title">{task.title}</span>
        )}
      </div>

      <span className={`task-badge task-badge-${(task.category || "personal").toLowerCase()}`}>
        {task.category || "Personal"}
      </span>

      <span className="task-duration">{formatDuration(task.duration)}</span>

      <div className="task-actions" ref={menuRef}>
        {isEditing ? (
          <>
            <button
              type="button"
              className="btn-ghost"
              onClick={handleSave}
              disabled={!draftTitle?.trim()}
            >
              Save
            </button>
            <button type="button" className="btn-ghost" onClick={handleCancel}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              ref={triggerRef}
              type="button"
              className="icon-button"
              aria-label="Options"
              aria-expanded={isMenuOpen}
              onClick={handleToggleMenu}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <circle cx="5" cy="12" r="1.8" />
                <circle cx="12" cy="12" r="1.8" />
                <circle cx="19" cy="12" r="1.8" />
              </svg>
            </button>

            {isMenuOpen && createPortal(
              <div 
                id={`portal-menu-${task.id}`}
                className="task-menu"
                style={{
                  position: "absolute",
                  top: `${menuCoords.top}px`,
                  left: `${menuCoords.left}px`,
                  zIndex: 9999 
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setDraftTitle(task.title);
                    setIsEditing(true);
                  }}
                >
                  Edit
                </button>

                <div className="task-menu-divider">Move to</div>
                {PERIODS.map((period) => (
                  <button
                    key={period}
                    type="button"
                    disabled={task.period === period}
                    onClick={async () => {
                      setIsMenuOpen(false);
                      await updateTask(task.id, { period });
                    }}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}

                <div className="task-menu-divider" />
                <button
                  type="button"
                  className="danger"
                  onClick={async () => {
                    setIsMenuOpen(false);
                    await deleteTask(task.id);
                  }}
                >
                  Delete
                </button>
              </div>,
              document.body
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default TaskItem;