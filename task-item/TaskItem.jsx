function TaskItem({ task, onToggle }) {
  return (
    <div className="task-item">
      <input
        type="checkbox"
        checked={task.isCompleted}
        onChange={() => onToggle(task.id)}
      />

      <span className={task.isCompleted ? "completed" : ""}>
        {task.title}
      </span>
    </div>
  );
}

export default TaskItem;