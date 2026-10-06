import TaskGroup from "./components/TaskGroup";
import Sidebar from "./components/Sidebar";
import AddTaskForm from "./components/AddTaskForm";
import CompletedTasks from "./components/CompletedTasks";
import { TasksProvider, useTasks } from "./context/TasksContext";
import "./App.css"
import { useState } from "react";

function TodayView() {
  const {
    activeTasks,
    completedTasks,
    error,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    restoreTask,
  } = useTasks();
  const [currentView, setCurrentView] = useState("today");

  async function handleAddTask(taskInput) {
    const newTask = await addTask({
      title: taskInput.title,
      category: taskInput.category,
      duration: taskInput.duration,
      period: taskInput.period,
    });

    return newTask !== null;
  }

  return (
    <div className="app-layout">
      <Sidebar onCompletedClick={() => setCurrentView("completed")} />
      <main className="app-main">
        <header className="app-header">
          <div>
            <h1 className="app-title">Today</h1>
            <p className="app-subtitle">Focus on what matters today.</p>
          </div>
        </header>
        <section className="app-content">
          <AddTaskForm onAddTask={handleAddTask} />
          {error && <p className="error-text">{error}</p>}

          {currentView === "today" ? (
            <div className="today-groups">
          <TaskGroup
            title="Morning"
            icon="☀"
            tasks={activeTasks.filter((task) => task.period === "morning")}
            onDeleteTask={deleteTask}
            onCompleteTask={completeTask}
            onUpdateTask={updateTask}
          />

          <TaskGroup
            title="Afternoon"
            icon="☀"
            tasks={activeTasks.filter((task) => task.period === "afternoon")}
            onDeleteTask={deleteTask}
            onCompleteTask={completeTask}
            onUpdateTask={updateTask}
          />

          <TaskGroup
            title="Evening"
            icon="☾"
            tasks={activeTasks.filter((task) => task.period === "evening")}
            onDeleteTask={deleteTask}
            onCompleteTask={completeTask}
            onUpdateTask={updateTask}
          />
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
    </div>
  );
}

function App() {
  return (
    <TasksProvider>
      <TodayView />
    </TasksProvider>
  );
}

export default App;
