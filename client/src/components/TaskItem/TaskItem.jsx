import { useState } from "react";
import {
  deleteTask,
  updateTask,
} from "../../services/taskApi";
import "./TaskItem.css";


function TaskItem({ task, onDeleteTask, onCompleteTask, onUpdateTask }) {
  const [isCompleted, setIsCompleted] = useState(
    task.isCompleted === 1
  );
  const [period, setPeriod] = useState(task.period || "morning");
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  async function handleToggle() {
    const newValue = isCompleted ? 0 : 1;

    try {
      await updateTask(task.id, {
        isCompleted: newValue,
      });

      setIsCompleted(newValue === 1);
      if (newValue === 1) {
        onCompleteTask(task.id);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handlePeriodChange(event) {
    const nextPeriod = event.target.value;
    const cleanTitle = title.trim();
    const updates = { period: nextPeriod };

    if (cleanTitle) {
      updates.title = cleanTitle;
    }

    const updatedTask = await onUpdateTask(task.id, updates);

    if (updatedTask) {
      setTitle(updatedTask.title);
      setPeriod(updatedTask.period);
      setIsEditing(false);
    }
  }

  async function handleEdit() {
    if (!isEditing) {
      setPeriod(task.period || "morning");
      setTitle(task.title);
      setIsEditing(true);
      return;
    }

    const cleanTitle = title.trim();

    if (!cleanTitle) {
      return;
    }

    try {
      const updatedTask = await onUpdateTask(task.id, {
        title: cleanTitle,
        period,
      });

      if (updatedTask) {
        setTitle(updatedTask.title);
        setPeriod(updatedTask.period);
        setIsEditing(false);
      }
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
        aria-label="Toggle task"
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
            value={period}
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
