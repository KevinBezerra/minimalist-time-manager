import TaskGroup from "../components/TaskGroup";
import AddTaskForm from "../components/AddTaskForm";
import { useTasks } from "../context/TasksContext";

export default function Today() {
  const { tasksByPeriod, error, addTask } = useTasks();

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-title">Today</h1>
          <p className="page-subtitle">Focus on what matters today.</p>
        </div>
        <AddTaskForm compact onAddTask={addTask} />
      </header>

      {error && <p className="error-text">{error}</p>}

      <div className="groups">
        <TaskGroup
          title="Morning"
          icon="☀"
          tasks={tasksByPeriod.morning}
        />
        <TaskGroup
          title="Afternoon"
          icon="☀"
          tasks={tasksByPeriod.afternoon}
        />
        <TaskGroup
          title="Evening"
          icon="☾"
          tasks={tasksByPeriod.evening}
        />
      </div>
    </>
  );
}
