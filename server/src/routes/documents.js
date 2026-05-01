import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { listFiles, createFolder, moveFile } from '../storage.js';

const router = Router();

router.use(requireAuth);

router.get('/files', async (req, res) => {
  try {
    const folder = req.query.folder || '/';
    const files = await listFiles(folder);
    res.json({ files, folder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/folders', async (req, res) => {
  try {
    const { parentPath, name } = req.body;
    const folder = await createFolder(parentPath || '/', name);
    res.json({ folder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/move', async (req, res) => {
  try {
    const { fileId, newPath } = req.body;
    const result = await moveFile(fileId, newPath);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
