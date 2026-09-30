import TaskItem from "./TaskItem/TaskItem";

function TaskList({ tasks, onDeleteTask, onCompleteTask }) {
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
            onDeleteTask={onDeleteTask}
            onCompleteTask={onCompleteTask}
          />
        ))}
    </div>
  );
}

export default TaskList;
