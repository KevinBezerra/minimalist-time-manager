const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function getTasks() {
  const response = await fetch(`${API_URL}/tasks`);

  if (!response.ok) {
    throw new Error("Unable to load tasks.");
  }

  return response.json();
}

export async function createTask(task) {
  const response = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    throw new Error("Unable to create task.");
  }

  return response.json();
}