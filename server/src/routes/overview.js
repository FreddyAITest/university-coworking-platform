import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { downloadFile } from '../storage.js';
import { extractTasks } from '../sorter.js';
import db from '../db.js';

const router = Router();
router.use(requireAuth);

router.get('/tasks', (req, res) => {
  const period = req.query.period || 'week';
  const tasks = db.prepare('SELECT * FROM tasks WHERE period = ?').all(period);
  res.json({ period, tasks });
});

router.post('/generate', async (req, res) => {
  try {
    const period = req.body.period || 'week';

    // Get all sorted documents
    const docs = db.prepare("SELECT * FROM documents WHERE status = 'sorted'").all();

    // Clear old tasks for this period
    db.prepare('DELETE FROM tasks WHERE period = ?').run(period);

    const allTasks = [];
    for (const doc of docs) {
      try {
        const content = await downloadFile(doc.storage_path);
        const tasks = await extractTasks(content, period);

        const insertTask = db.prepare(
          'INSERT INTO tasks (id, title, description, priority, due_date, source_doc_id, period, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );

        for (const t of tasks) {
          const id = crypto.randomUUID();
          insertTask.run(id, t.title, t.description || '', t.priority || 'medium', t.due_date || null, doc.id, period, 'pending');
          allTasks.push({ ...t, id, source_doc_id: doc.id });
        }
      } catch {
        // Skip docs we can't read
      }
    }

    res.json({ period, tasksGenerated: allTasks.length, tasks: allTasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
