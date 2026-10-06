import TaskItem from "./TaskItem/TaskItem";

function CompletedTasks({ tasks, onRestoreTask, onDeleteTask, onUpdateTask }) {
  if (tasks.length === 0) {
    return <p>No completed tasks.</p>;
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onRestoreTask={onRestoreTask}
          onDeleteTask={onDeleteTask}
          onUpdateTask={onUpdateTask}
        />
      ))}
    </div>
  );
}

export default CompletedTasks;