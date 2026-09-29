import TaskItem from "./TaskItem/TaskItem";

function TaskList({ tasks, onDeleteTask, onUpdateTask, title }) {
  if (tasks.length === 0) {
    return <p>No {title.toLowerCase()}  .</p>;
  }

  return (
    <div>
      <h2>{title}</h2>

      <ul>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onDeleteTask={onDeleteTask}
            onUpdateTask={onUpdateTask}

          />
        ))}
      </ul>
    </div>
  );
}

export default TaskList;