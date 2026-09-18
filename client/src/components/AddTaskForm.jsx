import { useState } from "react";

function AddTaskForm({ onAddTask }) {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanTitle = title.trim();

    if (!cleanTitle) {
      return;
    }

    try {
      setSubmitting(true);

      await onAddTask(cleanTitle);

      setTitle("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter a task"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />

      <button type="submit" disabled={submitting}>
        {submitting ? "Adding..." : "Add Task"}
      </button>
    </form>
  );
}

export default AddTaskForm;