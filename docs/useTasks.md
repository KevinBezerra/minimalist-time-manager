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
  categories,      // available categories, including categories without tasks
  activeTasks,     // isCompleted === 0  (Dashboard)
  completedTasks,  // isCompleted === 1  (Completed view)
  tasksByPeriod,   // active tasks as { morning, afternoon, evening }
  error,           // message if the last action failed, else ""
  addTask,
  addCategory,
  renameCategory,
  deleteCategory,
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
| Add category | `addCategory(name)` | Creates a persistent category available in task forms |
| Rename category | `renameCategory(currentName, newName)` | Renames a category and updates tasks assigned to it |
| Delete category | `deleteCategory(name)` | Deletes a category only when no tasks use it |
| Edit | `updateTask(id, { title: "New" })` | Changes any fields |
| Unassign from Dashboard sections | `unassignTask(id)` | Sets `period` to `null`: removes it from the day sections, keeps it in the Dashboard task list |
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

`Dashboard.jsx` and `TaskItem.jsx` are working examples in the repo. New tasks are unassigned by default and appear in the Dashboard task list until moved to a day section.
