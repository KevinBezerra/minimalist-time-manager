const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

const VALID_PERIODS = ['morning', 'afternoon', 'evening'];

app.use(cors());
app.use(express.json());

// A period is valid when it is one of the day parts, or null/empty (unassigned).
function isValidPeriod(period) {
  return period === null || period === '' || VALID_PERIODS.includes(period);
}

// Accepts 0/1/true/false and returns 0 or 1, or undefined if it is not a flag.
function toFlag(value) {
  if (value === 0 || value === false) return 0;
  if (value === 1 || value === true) return 1;
  return undefined;
}

// GET /tasks - Fetch all tasks
// Optional filters: ?isToday=0|1  ?isCompleted=0|1  ?period=morning|afternoon|evening|none
app.get('/tasks', (req, res) => {
  const conditions = [];
  const params = [];

  for (const field of ['isToday', 'isCompleted']) {
    if (req.query[field] !== undefined) {
      const flag = toFlag(Number(req.query[field]));
      if (flag === undefined) {
        return res.status(400).json({ error: `${field} must be 0 or 1` });
      }
      conditions.push(`${field} = ?`);
      params.push(flag);
    }
  }

  if (req.query.period !== undefined) {
    if (req.query.period === 'none') {
      conditions.push('period IS NULL');
    } else if (VALID_PERIODS.includes(req.query.period)) {
      conditions.push('period = ?');
      params.push(req.query.period);
    } else {
      return res.status(400).json({
        error: `period must be one of: ${VALID_PERIODS.join(', ')}, none`
      });
    }
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  db.all(`SELECT * FROM tasks ${where} ORDER BY id DESC`, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET /tasks/today - Active tasks assigned to Today, optionally for one day part
// Optional filter: ?period=morning|afternoon|evening
app.get('/tasks/today', (req, res) => {
  const params = [];
  let sql = 'SELECT * FROM tasks WHERE isToday = 1 AND isCompleted = 0';

  if (req.query.period !== undefined) {
    if (!VALID_PERIODS.includes(req.query.period)) {
      return res.status(400).json({
        error: `period must be one of: ${VALID_PERIODS.join(', ')}`
      });
    }
    sql += ' AND period = ?';
    params.push(req.query.period);
  }

  db.all(`${sql} ORDER BY id DESC`, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// POST /tasks - Create a new task
app.post('/tasks', (req, res) => {
  const { title, period, isToday } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  if (period !== undefined && !isValidPeriod(period)) {
    return res.status(400).json({
      error: `period must be one of: ${VALID_PERIODS.join(', ')}, or null`
    });
  }
  const todayFlag = isToday === undefined ? 0 : toFlag(isToday);
  if (todayFlag === undefined) {
    return res.status(400).json({ error: 'isToday must be 0 or 1' });
  }

  const periodValue = period || null;
  const sql = 'INSERT INTO tasks (title, isCompleted, period, isToday) VALUES (?, 0, ?, ?)';

  db.run(sql, [title, periodValue, todayFlag], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      id: this.lastID,
      title,
      isCompleted: 0,
      period: periodValue,
      isToday: todayFlag
    });
  });
});

// PUT /tasks/:id - Update an existing task
// Only the fields present in the body are changed, so period can be set back
// to null (unassigned) and isToday can be cleared.
app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const updates = [];
  const params = [];

  if ('title' in req.body) {
    if (typeof req.body.title !== 'string' || !req.body.title.trim()) {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }
    updates.push('title = ?');
    params.push(req.body.title);
  }

  for (const field of ['isCompleted', 'isToday']) {
    if (field in req.body) {
      const flag = toFlag(req.body[field]);
      if (flag === undefined) {
        return res.status(400).json({ error: `${field} must be 0 or 1` });
      }
      updates.push(`${field} = ?`);
      params.push(flag);
    }
  }

  if ('period' in req.body) {
    if (!isValidPeriod(req.body.period)) {
      return res.status(400).json({
        error: `period must be one of: ${VALID_PERIODS.join(', ')}, or null`
      });
    }
    updates.push('period = ?');
    params.push(req.body.period || null);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  db.run(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, [...params, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    db.get('SELECT * FROM tasks WHERE id = ?', [id], (getErr, row) => {
      if (getErr) {
        return res.status(500).json({ error: getErr.message });
      }
      res.json(row);
    });
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
