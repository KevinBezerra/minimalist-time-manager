import { useEffect, useState } from "react";
import TaskGroup from "./components/TaskGroup";
import Sidebar from "./components/Sidebar";
import AddTaskForm from "./components/AddTaskForm";
import {
  createTask,
  getTasks,
  updateTask,
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
          const activeTasks = data
            .filter((task) => task.isCompleted === 0)
            .map((task) => ({
              ...task,
              period: ["morning", "afternoon", "evening"].includes(task.period)
                ? task.period
                : "morning",
            }));
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
        title: taskInput.title,
        category: taskInput.category,
        duration: taskInput.duration,
        period: taskInput.period,
      });

      if (newTask.isCompleted === 0) {
        setTasks((currentTasks) => [
          ...currentTasks,
          newTask,
        ]);
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      setError("Could not add task.");
      return false;
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

  async function handleUpdateTask(taskId, updates) {
    try {
      const updatedTask = await updateTask(taskId, updates);

      if (!updatedTask) {
        return null;
      }

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId ? updatedTask : task
        )
      );

      return updatedTask;
    } catch (error) {
      console.error(error);
      setError("Could not update task.");
      return null;
    }
  }

  function handleCompleteTask(taskId) {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId)
    );
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
                tasks={tasks.filter((task) => task.period === "morning")}
                onDeleteTask={handleDeleteTask}
                onCompleteTask={handleCompleteTask}
                onUpdateTask={handleUpdateTask}
              />
              <TaskGroup
                title="Afternoon"
                icon="☀"
                tasks={tasks.filter((task) => task.period === "afternoon")}
                onDeleteTask={handleDeleteTask}
                onCompleteTask={handleCompleteTask}
                onUpdateTask={handleUpdateTask}
              />
              <TaskGroup
                title="Evening"
                icon="☾"
                tasks={tasks.filter((task) => task.period === "evening")}
                onDeleteTask={handleDeleteTask}
                onCompleteTask={handleCompleteTask}
                onUpdateTask={handleUpdateTask}
              />
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default App;
