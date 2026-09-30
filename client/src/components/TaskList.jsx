import { useState } from "react";
import TaskItem from "./TaskItem/TaskItem";

function TaskList({
  tasks,
  onDeleteTask,
  onUpdateTask,
  onReorderTasks,
  title,
}) {
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  if (tasks.length === 0) {
    return (
      <div>
        <h2>{title}</h2>
        <p>No tasks.</p>
      </div>
    );
  }

  function handleDragStart(taskId) {
    setDraggedTaskId(taskId);
  }

  function handleDragOver(event) {
    event.preventDefault();
  }

  function handleDrop(targetTaskId) {
    if (
      draggedTaskId === null ||
      draggedTaskId === targetTaskId
    ) {
      return;
    }

    const draggedIndex = tasks.findIndex(
      (task) => task.id === draggedTaskId
    );

    const targetIndex = tasks.findIndex(
      (task) => task.id === targetTaskId
    );

    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }

    const reorderedTasks = [...tasks];

    const [draggedTask] = reorderedTasks.splice(
      draggedIndex,
      1
    );

    reorderedTasks.splice(
      targetIndex,
      0,
      draggedTask
    );

    onReorderTasks(
      reorderedTasks,
      tasks[0].isCompleted
    );

    setDraggedTaskId(null);
  }

  function handleDragEnd() {
    setDraggedTaskId(null);
  }

  return (
    <div>
      <h2>{title}</h2>

      <ul className="task-list">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onDeleteTask={onDeleteTask}
            onUpdateTask={onUpdateTask}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            isDragging={draggedTaskId === task.id}
          />
        ))}
      </ul>
    </div>
  );
}

export default TaskList;
