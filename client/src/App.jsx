import { useEffect, useState } from "react";
import AddTaskForm from "./components/AddTaskForm";
import TaskList from "./components/TaskList";
import { createTask, getTasks } from "./services/taskApi";

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

  return (
    <main>
      <h1>Task Manager</h1>

      <AddTaskForm onAddTask={handleAddTask} />

      {error && <p>{error}</p>}

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <TaskList tasks={tasks} />
      )}
    </main>
  );
}

export default App;