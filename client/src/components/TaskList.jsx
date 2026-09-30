import TaskItem from "./TaskItem/TaskItem";

function TaskList({ tasks, onDeleteTask }) {
  if (tasks.length === 0) {
    return <p>No active tasks.</p>;
  }

  return (
    <div>
      <h2>Active Tasks</h2>

      <ul>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onDeleteTask={onDeleteTask}
          />
        ))}
      </ul>
    </div>
  );
}

export default TaskList;