import fs from 'fs';
import path from 'path';

const BASE = path.resolve(process.env.STORAGE_PATH || path.join(import.meta.dirname, '..', 'storage'));

function resolvePath(relativePath) {
  const normalized = path.normalize(relativePath).replace(/^\/+/, '');
  const resolved = path.join(BASE, normalized);
  if (!resolved.startsWith(BASE)) throw new Error('Path traversal not allowed');
  return resolved;
}

export async function listFiles(folderPath = '/') {
  const dir = resolvePath(folderPath);
  if (!fs.existsSync(dir)) return [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.map(e => {
    const fullPath = path.join(dir, e.name);
    const stat = fs.statSync(fullPath);
    return {
      id: e.name,
      name: e.name,
      folder: e.isDirectory(),
      size: stat.size,
      lastModified: stat.mtime.toISOString(),
      webUrl: null,
    };
  });
}

export async function createFolder(parentPath, name) {
  const dir = resolvePath(path.join(parentPath || '/', name));
  fs.mkdirSync(dir, { recursive: true });
  return { name, path: dir };
}

export async function moveFile(fileName, newParentPath) {
  const src = resolvePath(fileName);
  const dest = resolvePath(path.join(newParentPath, path.basename(fileName)));

  if (!fs.existsSync(src)) throw new Error(`File not found: ${fileName}`);

  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  fs.renameSync(src, dest);
  return { name: path.basename(fileName), path: dest };
}

export async function downloadFile(filePath) {
  const file = resolvePath(filePath);
  if (!fs.existsSync(file)) throw new Error(`File not found: ${filePath}`);
  return fs.readFileSync(file, 'utf-8');
}
