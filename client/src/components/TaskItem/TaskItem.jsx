import { useState } from "react";
import {
  deleteTask,
  updateTask,
} from "../../services/taskApi";
import "./TaskItem.css";


function TaskItem({ task, onDeleteTask }) {
  const [isCompleted, setIsCompleted] = useState(
    task.isCompleted === 1
  );
  const [isToday, setIsToday] = useState(
    task.isToday === true || task.isToday === 1
  );
  const [period, setPeriod] = useState(task.period || "");
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  async function handleToggle() {
    const newValue = isCompleted ? 0 : 1;

    try {
      await updateTask(task.id, {
        isCompleted: newValue,
      });

      setIsCompleted(newValue === 1);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleTodayChange(event) {
    const nextIsToday = event.target.checked;

    try {
      await updateTask(task.id, { isToday: nextIsToday });
      setIsToday(nextIsToday);
    } catch (error) {
      console.error(error);
    }
  }

  async function handlePeriodChange(event) {
    const nextPeriod = event.target.value;

    try {
      await updateTask(task.id, { period: nextPeriod || null });
      setPeriod(nextPeriod);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleEdit() {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    const cleanTitle = title.trim();

    if (!cleanTitle) {
      return;
    }

    try {
      await updateTask(task.id, {
        title: cleanTitle,
      });

      setTitle(cleanTitle);
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDelete() {
    try {
      await deleteTask(task.id);
      onDeleteTask(task.id);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className={`task-row ${isCompleted ? "completed" : ""}`}>
      <button
        className={`task-checkbox ${isCompleted ? "checked" : ""}`}
        onClick={handleToggle}
        arial-label="Toggle task"
        >
          {isCompleted && <span className="checkMark">✓</span>}
      </button>

      <div className="task-content">
        {isEditing ? (
          <input
            className="task-edit-input"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        ) : (
          <span className="task-title">{title}</span>
        )}
      </div>
      <span className={`task-badge task-badge-${task.category?.toLowerCase() || "default"}`}>
        {task.category || "Personal"}
      </span>

      <span className="task-duration">
        {task.duration ? `{task.duration} min` : "" }
      </span>

      <div className="task-actions">
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
