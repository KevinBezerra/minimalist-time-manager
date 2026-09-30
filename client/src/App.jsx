import { useEffect, useState } from "react";
import TaskGroup from "./components/TaskGroup";
import Sidebar from "./components/Sidebar";
import AddTaskForm from "./components/AddTaskForm";
import {
  createTask,
  getTasks,
} from "./services/taskApi";
import "./App.css"

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    getTasks()
      .then((data) => {
        if (isCurrent) {
          const activeTasks = data.filter((task) => task.isCompleted === 0);
          setTasks(activeTasks);
        }
      })
      .catch((error) => {
        console.error(error);
        if (isCurrent) {
          setError("Could not load tasks.");
        }
      })
      .finally(() => {
        if (isCurrent) {
          setLoading(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  async function handleAddTask(taskInput) {
    try {
      setError("");

      const newTask = await createTask({
        title: taskInput,
        category: taskInput.category,
        duration: taskInput.duration
      });

      if (newTask.isCompleted === 0) {
        setTasks((currentTasks) => [
          ...currentTasks,
          newTask,
        ]);
      }
    } catch (error) {
      console.error(error);
      setError("Could not add task.");
    }
  }

  async function handleDeleteTask(taskId) {
    try {
      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId)
      );
    } catch (error) {
      console.error(error);
      setError("Could not delete task.");
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <header className="app-header">
          <div>
            <h1 className="app-title">Today</h1>
            <p className="app-subtitle">Focus on what matters today.</p>
          </div>
          <button className="btn-add-task">Add Task</button>
        </header>
        <section className="app-content">
          <AddTaskForm onAddTask={handleAddTask} />
          {error && <p className="error-text">{error}</p>}

          {loading ? (
            <p>Loading tasks...</p>
          ) : (
            <div className="today-groups">
              <TaskGroup
                title="Morning"
                icon="☀"
                tasks={tasks.filter(t => t.period === "morning")}
                onDeleteTask={handleDeleteTask}
              />
              <TaskGroup
                title="Afternoon"
                icon="☀"
                tasks={tasks.filter(t => t.period === "afternoon")}
                onDeleteTask={handleDeleteTask}
              />

              <TaskGroup
                title="Evening"
                icon="☾"
                tasks={tasks.filter(t => t.period === "evening")}
                onDeleteTask={handleDeleteTask}
              />
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default App;
