import { useState } from "react";
import "./AddTaskForm.css";


function AddTaskForm({ onAddTask }) {
  const [title, setTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [duration, setDuration] = useState(30);
  const [category, setCategory] = useState("Personal");
  const [period, setPeriod] = useState("morning");

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanTitle = title.trim();

    if (!cleanTitle) {
      return;
    }

    try {
      setSubmitting(true);

      const added = await onAddTask({
        title: cleanTitle,
        category,
        duration,
        period,
      });

      if (added) {
        setTitle("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="add-task-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter a task"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <select value={category} onChange={(event) => setCategory(event.target.value)}>
        <option value="Personal">Personal</option>
        <option value="Work">Work</option>
        <option value="Health">Health</option>
      </select>

      <select value={duration} onChange={(event) => setDuration(Number(event.target.value))} >
        <option value={30}>30 min</option>
        <option value={60}>1 h</option>
        <option value={90}>1.5 h</option>
        <option value={120}>2 h</option>
      </select>

      <select
        aria-label="Day part"
        required
        value={period}
        onChange={(event) => setPeriod(event.target.value)}
      >
        <option value="morning">Morning</option>
        <option value="afternoon">Afternoon</option>
        <option value="evening">Evening</option>
      </select>

      <button type="submit" disabled={submitting}>
        {submitting ? "Adding..." : "Add Task"}
      </button>
    </form>
  );
}

export default AddTaskForm;