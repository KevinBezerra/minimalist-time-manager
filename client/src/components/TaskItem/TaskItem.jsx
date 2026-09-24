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
    <li className={`task-item ${isCompleted ? "completed" : ""}`}>
      <input
        className="task-checkbox"
        type="checkbox"
        checked={isCompleted}
        onChange={handleToggle}
      />

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

      <div className="task-actions">
        <button type="button" onClick={handleEdit}>
          {isEditing ? "Save" : "Edit"}
        </button>

        <button type="button" onClick={handleDelete}>
          Delete
        </button>
      </div>
    </li>
  );
}

export default TaskItem;