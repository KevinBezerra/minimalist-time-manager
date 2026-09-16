# Minimalist Time Manager - Backend API Documentation

## Base URLs
- Local Development: http://localhost:5000
- Production (Render): https://minimalist-time-manager-api.onrender.com/

---

## Data Model (Task Schema)
| Field | Type | Description |
| :--- | :--- | :--- |
| id | Integer | Primary key (auto-generated) |
| title | Text | Description of the task (required) |
| isCompleted | Integer (0 or 1) | 0 = Active, 1 = Done (default 0) |
| period | Text / Null | Section of day (morning, afternoon, night, or null) |

---

## Endpoints

### 1. Fetch All Tasks
- Route: GET /tasks
- Response (200 OK): Array of task objects

### 2. Add New Task
- Route: POST /tasks
- Headers: Content-Type: application/json
- Body: {"title": "Task name (required)", "period": "morning"}
- Response (201 Created): Created task object with generated id and isCompleted: 0

### 3. Update Task
- Route: PUT /tasks/:id
- Headers: Content-Type: application/json
- Body: Any combination of {"title": "Updated title", "isCompleted": 1, "period": "afternoon"}
- Response (200 OK): {"message": "Task updated successfully"}

### 4. Delete Task
- Route: DELETE /tasks/:id
- Response (200 OK): {"message": "Task deleted successfully"}

---

## Team Task Mapping

### For Hania
- Connect API: Set base URL in React to http://localhost:5000[cite: 2].
- Add Task Input: Send POST /tasks with { title: taskInput }[cite: 2].
- Task List View: Fetch GET /tasks and filter where isCompleted === 0[cite: 2].

### For Christian
- Task Edit Title: Send PUT /tasks/:id with { title: newTitle }[cite: 2].
- Toggle Completion: Send PUT /tasks/:id with { isCompleted: 1 } or { isCompleted: 0 }[cite: 2].
- Delete Task: Send DELETE /tasks/:id[cite: 2].