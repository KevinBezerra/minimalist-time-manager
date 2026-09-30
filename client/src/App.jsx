import { useEffect, useState } from "react";
import AddTaskForm from "./components/AddTaskForm";
import TaskList from "./components/TaskList";
import {
  createTask,
  getTasks,
} from "./services/taskApi";

function App() {
  const [tasks, setTasks] = useState([]);
  const activeTasks = tasks.filter((task) => task.isCompleted === 0);
  const completedTasks = tasks.filter((task) => task.isCompleted === 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    getTasks()
      .then((data) => {
        if (isCurrent) {
          setTasks(data);
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
  function handleUpdateTask(updatedTask) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  }
  function handleReorderTasks(reorderedTasks, isCompleted) {
    setTasks((currentTasks) => {
      const otherTasks = currentTasks.filter(
        (task) => task.isCompleted !== isCompleted
      );

      return [...reorderedTasks, ...otherTasks];
    });
  }
  return (
    <main>
      <h1>Task Manager</h1>

      <AddTaskForm onAddTask={handleAddTask} />

      {error && <p>{error}</p>}

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <>  
          <TaskList
            tasks={activeTasks}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
            onReorderTasks={handleReorderTasks}
            title="Active Tasks"
          />

          <TaskList
            tasks={completedTasks}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
            onReorderTasks={handleReorderTasks}
            title="Completed Tasks"
          />
        </>
      )}
    </main>
  );
}

export default App;
