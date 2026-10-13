# Using `useTasks()` - Shared Task State

Tasks live in one shared place, `TasksContext` (`client/src/context/TasksContext.jsx`). Every view must read them through `useTasks()`.

## Why

If a view keeps its own copy of the tasks, or reads and writes localStorage directly, it drifts out of sync with the other views. With the shared context, a change made in one view (or in another browser tab) shows up everywhere.

## How to use it

Call the hook inside any component and take what you need:

```jsx
import { useTasks } from "../context/TasksContext";

const {
  tasks,           // all tasks
  activeTasks,     // isCompleted === 0  (Today, main list)
  completedTasks,  // isCompleted === 1  (Completed view)
  tasksByPeriod,   // active tasks as { morning, afternoon, evening }
  error,           // message if the last action failed, else ""
  addTask,
  updateTask,
  deleteTask,
  completeTask,
  restoreTask,
  toggleTask,
  unassignTask,
} = useTasks();
```

| Action | Call | What it does |
| --- | --- | --- |
| Add | `addTask({ title, category, duration, period })` | Creates a task |
| Edit | `updateTask(id, { title: "New" })` | Changes any fields |
| Unassign from Today | `unassignTask(id)` | Sets `period` to `null`: removes it from the Today blocks, keeps it in the list |
| Change day part | `updateTask(id, { period: "evening" })` | Moves it to another block |
| Complete | `completeTask(id)` | Moves it to Completed and sets `completedAt` |
| Uncomplete | `restoreTask(id)` | Moves it back to active |
| Toggle | `toggleTask(id)` | Completes an active task, restores a completed one |
| Delete | `deleteTask(id)` | Removes it |

## Rules

- Don't call `taskApi` or localStorage from components. Use the actions above: they save first, then refresh every view and every open tab.
- Don't copy tasks into your own `useState`. Filter `activeTasks` or `completedTasks` while rendering instead.
- Your component must be inside `<TasksProvider>`. `main.jsx` already wraps the app in it.
- If a save fails, the action returns `null` and `error` is set, so you can show a message.

## Task shape and example

Each task looks like this. Note that `isToday` is a boolean on the client.

```js
{ id (string or number), title, isCompleted: 0 | 1, isToday: boolean,
  period: "morning" | "afternoon" | "evening" | null, category, duration,
  completedAt: ISO string | null }
```

Example: a view that lists only the evening tasks.

```jsx
function EveningList() {
  const { activeTasks, completeTask } = useTasks();
  const evening = activeTasks.filter((t) => t.period === "evening");

  return evening.map((t) => (
    <button key={t.id} onClick={() => completeTask(t.id)}>{t.title}</button>
  ));
}
```

`Today.jsx` and `TaskItem.jsx` are working examples in the repo.
