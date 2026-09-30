import TaskItem from "./TaskItem/TaskItem";

function TaskList({ tasks, onDeleteTask }) {
  if (tasks.length === 0) {
    return <p>No active tasks.</p>;
  }

  return (
    <div className="task-list">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onDeleteTask={onDeleteTask}
          />
        ))}
    </div>
  );
}

export default TaskList;
