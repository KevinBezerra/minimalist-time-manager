import TaskGroup from "./components/TaskGroup";
import Sidebar from "./components/Sidebar";
import AddTaskForm from "./components/AddTaskForm";
import CompletedTasks from "./components/CompletedTasks";
import TaskList from "./components/TaskList";
import { TasksProvider, useTasks } from "./context/TasksContext";
import "./App.css";
import { useEffect, useState } from "react";

function MainView() {
  const {
    activeTasks,
    completedTasks,
    error,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    restoreTask,
    unassignTask,
  } = useTasks();
  const [currentView, setCurrentView] = useState("dashboard");
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  useEffect(() => {
    if (!isAddTaskOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsAddTaskOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAddTaskOpen]);

  async function handleAddTask(taskInput) {
    const newTask = await addTask({
      title: taskInput.title,
      category: taskInput.category,
      duration: taskInput.duration,
      period: taskInput.period || null,
      isToday: Boolean(taskInput.period),
    });

    return newTask !== null;
  }

  return (
    <div className="app-layout">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="app-main">
        <header className="app-header">
          <div>
            <h1 className="app-title">
              {currentView === "dashboard" ? "Dashboard" : "Completed"}
            </h1>
            <p className="app-subtitle">
              {currentView === "dashboard"
                ? "Plan your tasks and focus on what matters today."
                : "Review the tasks you have completed."}
            </p>
          </div>
        </header>
        <section className="app-content">
          {error && <p className="error-text">{error}</p>}

          {currentView === "dashboard" ? (
            <div className="dashboard-columns">
              <section className="dashboard-panel" aria-labelledby="task-list-heading">
                <div className="dashboard-panel-heading">
                  <h2 className="dashboard-panel-title" id="task-list-heading">
                    Task List
                  </h2>
                  <button
                    className="btn-add-task"
                    type="button"
                    onClick={() => setIsAddTaskOpen(true)}
                  >
                    Add Task
                  </button>
                </div>
                <TaskList
                  tasks={activeTasks.filter((task) => !task.isToday)}
                  onDeleteTask={deleteTask}
                  onCompleteTask={completeTask}
                  onUpdateTask={updateTask}
                  onUnassignTask={unassignTask}
                />
              </section>

              <section className="dashboard-panel" aria-labelledby="today-heading">
                <h2 className="dashboard-panel-title" id="today-heading">
                  Today
                </h2>
                <div className="today-groups">
                  <TaskGroup
                    title="Morning"
                    icon="☀"
                    tasks={activeTasks.filter(
                      (task) => task.isToday && task.period === "morning"
                    )}
                    onDeleteTask={deleteTask}
                    onCompleteTask={completeTask}
                    onUpdateTask={updateTask}
                    onUnassignTask={unassignTask}
                  />
                  <TaskGroup
                    title="Afternoon"
                    icon="☀"
                    tasks={activeTasks.filter(
                      (task) => task.isToday && task.period === "afternoon"
                    )}
                    onDeleteTask={deleteTask}
                    onCompleteTask={completeTask}
                    onUpdateTask={updateTask}
                    onUnassignTask={unassignTask}
                  />
                  <TaskGroup
                    title="Evening"
                    icon="☾"
                    tasks={activeTasks.filter(
                      (task) => task.isToday && task.period === "evening"
                    )}
                    onDeleteTask={deleteTask}
                    onCompleteTask={completeTask}
                    onUpdateTask={updateTask}
                    onUnassignTask={unassignTask}
                  />
                </div>
              </section>
            </div>
          ) : (
            <CompletedTasks
              tasks={completedTasks}
              onRestoreTask={restoreTask}
              onDeleteTask={deleteTask}
              onUpdateTask={updateTask}
            />
          )}
        </section>
      </main>
      {isAddTaskOpen && (
        <div
          className="task-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsAddTaskOpen(false);
            }
          }}
        >
          <section
            className="task-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-task-heading"
          >
            <div className="task-modal-header">
              <div>
                <h2 id="add-task-heading">Add a task</h2>
                <p>Choose the details for your task.</p>
              </div>
              <button
                className="task-modal-close"
                type="button"
                aria-label="Close add task dialog"
                onClick={() => setIsAddTaskOpen(false)}
              >
                ×
              </button>
            </div>
            <AddTaskForm
              onAddTask={handleAddTask}
              onCancel={() => setIsAddTaskOpen(false)}
              onSuccess={() => setIsAddTaskOpen(false)}
              error={error}
            />
          </section>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <TasksProvider>
      <MainView />
    </TasksProvider>
  );
}

export default App;
