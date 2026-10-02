import TaskGroup from "../components/TaskGroup";
import AddTaskForm from "../components/AddTaskForm";

export default function Today({
  tasks,
  loading,
  error,
  onAddTask,
  onDeleteTask,
  onCompleteTask,
  onUpdateTask,
}) {
  return (
    <>
      <header>
        <div>
          <h1 className="app-title">Today</h1>
          <p className="app-subtitle">Focus on what matters today.</p>
        </div>
      </header>

      <section className="app-content">
        <AddTaskForm onAddTask={onAddTask} />
        {error && <p className="error-text">{error}</p>}

        {loading ? (
          <p>Loading tasks...</p>
        ) : (
          <div className="today-groups">
            <TaskGroup
              title="Morning"
              icon="☀"
              tasks={tasks.filter((task) => task.period === "morning")}
              onDeleteTask={onDeleteTask}
              onCompleteTask={onCompleteTask}
              onUpdateTask={onUpdateTask}
            />
            <TaskGroup
              title="Afternoon"
              icon="☀"
              tasks={tasks.filter((task) => task.period === "afternoon")}
              onDeleteTask={onDeleteTask}
              onCompleteTask={onCompleteTask}
              onUpdateTask={onUpdateTask}
            />
            <TaskGroup
              title="Evening"
              icon="☾"
              tasks={tasks.filter((task) => task.period === "evening")}
              onDeleteTask={onDeleteTask}
              onCompleteTask={onCompleteTask}
              onUpdateTask={onUpdateTask}
            />
          </div>
        )}
      </section>
    </>
  );
}
