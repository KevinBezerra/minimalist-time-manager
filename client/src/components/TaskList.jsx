import TaskItem from "./TaskItem/TaskItem";

function TaskList({
  tasks,
  categories,
  onDeleteTask,
  onCompleteTask,
  onUpdateTask,
  onUnassignTask,
}) {
  const activeTasks = tasks.filter((task) => task.isCompleted !== 1);

  if (activeTasks.length === 0) {
    return <p>No active tasks.</p>;
  }

  return (
    <div className="task-list">
        {activeTasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            categories={categories}
            onDeleteTask={onDeleteTask}
            onCompleteTask={onCompleteTask}
            onUpdateTask={onUpdateTask}
            onUnassignTask={onUnassignTask}
          />
        ))}
    </div>
  );
}

export default TaskList;
