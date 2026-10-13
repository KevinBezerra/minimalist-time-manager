import { useState } from "react";
import TaskItem  from "./TaskItem/TaskItem";
import "./TaskGroup.css";

function TaskGroup({ title, icon, tasks }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="task-group">
      <button type="button" className="task-group-header"
        onClick={() => setIsOpen((o) => !o)} aria-expanded={isOpen}>
        <span className="task-group-icon">{icon}</span>
        <span className="task-group-title">{title} ({tasks.length})</span>
        <svg
          className={`task-group-chevron ${isOpen ? "open" : "closed"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {isOpen && (
        <div className="task-group-body">
          {tasks.map((task) => <TaskItem key={task.id} task={task} />)}
        </div>
      )}
    </div>
  );
}

export default TaskGroup;