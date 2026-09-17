function TaskList({ tasks }) {
  if (tasks.length === 0) {
    return <p>No active tasks.</p>;
  }

  return (
    <div>
      <h2>Active Tasks</h2>

      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TaskList;