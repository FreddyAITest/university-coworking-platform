import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { listFiles, downloadFile, moveFile } from '../onedrive.js';
import { classifyDocument } from '../sorter.js';
import db from '../db.js';

const router = Router();
router.use(requireAuth);

router.get('/status', (_req, res) => {
  const unsorted = db.prepare("SELECT count(*) as count FROM documents WHERE status = 'unsorted'").get();
  const sorted = db.prepare("SELECT count(*) as count FROM documents WHERE status = 'sorted'").get();
  res.json({ unsorted: unsorted.count, sorted: sorted.count });
});

router.post('/scan', async (req, res) => {
  try {
    const files = await listFiles('/');
    const existing = new Set(
      db.prepare('SELECT onedrive_id FROM documents').all().map(r => r.onedrive_id)
    );

    const newFiles = files.filter(f => !f.folder && !existing.has(f.id));
    const insert = db.prepare(
      'INSERT OR IGNORE INTO documents (id, onedrive_id, name, folder_path, status) VALUES (?, ?, ?, ?, ?)'
    );

    for (const f of newFiles) {
      insert.run(crypto.randomUUID(), f.id, f.name, '/', 'unsorted');
    }

    res.json({ scanned: newFiles.length, total: files.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/run', async (_req, res) => {
  try {
    const unsorted = db.prepare("SELECT * FROM documents WHERE status = 'unsorted'").all();
    const folders = db.prepare("SELECT DISTINCT folder_path FROM documents WHERE status = 'sorted'")
      .all().map(r => r.folder_path);

    if (!folders.length) folders.push('/Courses', '/Projects', '/Notes', '/Admin', '/Unsorted');

    const results = [];
    for (const doc of unsorted) {
      try {
        const content = await downloadFile(doc.onedrive_id);
        const classification = await classifyDocument(doc.name, content, folders);

        const targetFolder = classification.folder || '/Unsorted';
        await moveFile(doc.onedrive_id, targetFolder);

        db.prepare('UPDATE documents SET status = ?, folder_path = ?, metadata = ?, updated_at = datetime(?) WHERE id = ?')
          .run('sorted', targetFolder, JSON.stringify(classification), 'now', doc.id);

        results.push({ name: doc.name, folder: targetFolder, confidence: classification.confidence });
      } catch (err) {
        results.push({ name: doc.name, error: err.message });
      }
    }

    res.json({ sorted: results.length, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
