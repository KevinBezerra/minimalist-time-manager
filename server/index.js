const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// GET /tasks - Fetch all tasks
app.get('/tasks', (req, res) => {
  const sql = 'SELECT * FROM tasks ORDER BY id DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST /tasks - Create a new task
app.post('/tasks', (req, res) => {
  const { title, period } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const sql = 'INSERT INTO tasks (title, isCompleted, period) VALUES (?, 0, ?)';
  const params = [title, period || null];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      id: this.lastID,
      title,
      isCompleted: 0,
      period: period || null
    });
  });
});

// PUT /tasks/:id - Update an existing task
app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, isCompleted, period } = req.body;

  const sql = `
    UPDATE tasks
    SET title = COALESCE(?, title),
        isCompleted = COALESCE(?, isCompleted),
        period = COALESCE(?, period)
    WHERE id = ?
  `;
  const params = [title, isCompleted, period, id];

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task updated successfully' });
  });
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM tasks WHERE id = ?';

  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});