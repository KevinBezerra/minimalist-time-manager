// Using localStorage fallback as per project plan

const STORAGE_KEY = "tasks";

export async function getTasks() {
  // Read from local storage, default to empty array if nothing exists
  const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  return tasks;
}

export async function createTask(task) {
  const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  
  const newTask = {
    id: Date.now(), // Generate a unique numeric ID
    title: task.title,
    isCompleted: 0,
    period: task.period || null
  };
  
  tasks.push(newTask);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  
  return newTask;
}

export async function updateTask(id, updates) {
  let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  let updatedTask = null;
  
  tasks = tasks.map(t => {
    if (t.id === id) {
      updatedTask = { ...t, ...updates };
      return updatedTask;
    }
    return t;
  });
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  return updatedTask;
}

export async function deleteTask(id) {
  let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  tasks = tasks.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  
  return { message: "Task deleted successfully" };
}