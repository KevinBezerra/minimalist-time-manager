import { useEffect, useState } from "react";
import {
  createTask,
  getTasks,
  updateTask,
} from "./services/taskApi";
import "./App.css"
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Today from "./pages/Today";


function Placeholder({ name }) {
  return <h1>{name} -- coming soon</h1>
}

function NotFound() {
  return <h1>404 - Page Not Found</h1>
}

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
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          path="/today"
          element={
            <Today 
              tasks={tasks}
              loading={loading}
              error={error}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onCompleteTask={handleCompleteTask}
              onUpdateTask={handleUpdateTask}
            />
          }>
        </Route>
        <Route path="/tasks"      element={<Placeholder name="Tasks" />} />
        <Route path="/pomodoro"   element={<Placeholder name="Pomodoro" />} />
        <Route path="/completed"  element={<Placeholder name="Completed" />} />
        <Route path="/categories" element={<Placeholder name="Categories" />} />

        <Route index element={<Navigate to="/today" replace />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;