import TaskGroup from "../components/TaskGroup";
import AddTaskForm from "../components/AddTaskForm";
import TaskItem from "../components/TaskItem/TaskItem";
import { useTasks } from "../context/TasksContext";
import "./Dashboard.css";

export default function Dashboard() {
  const { activeTasks, tasksByPeriod, error, addTask } = useTasks();
  const unassignedTasks = activeTasks.filter((task) => task.period === null);

  return (
    <div className="page dashboard-page">
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Organize your tasks and plan your day.</p>
        </div>
        <AddTaskForm compact onAddTask={addTask} />
      </header>

      {error && <p className="error-text">{error}</p>}

      <div className="dashboard-columns">
        <section className="dashboard-panel" aria-labelledby="task-list-heading">
          <div className="dashboard-panel-header">
            <h2 id="task-list-heading" className="dashboard-panel-title">
              Task list
            </h2>
            <span className="dashboard-task-count">{unassignedTasks.length}</span>
          </div>

          {unassignedTasks.length === 0 ? (
            <p className="muted-text">No unassigned tasks.</p>
          ) : (
            <ul className="dashboard-task-list">
              {unassignedTasks.map((task) => (
                <li key={task.id}>
                  <TaskItem task={task} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="dashboard-panel" aria-labelledby="today-heading">
          <div className="dashboard-panel-header">
            <h2 id="today-heading" className="dashboard-panel-title">
              Today
            </h2>
          </div>

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
        </section>
      </div>
    </div>
  );
}
