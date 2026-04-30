import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';

let client = null;

export function getClient(accessToken) {
  if (!client) {
    client = Client.init({
      authProvider: (done) => done(null, accessToken),
    });
  }
  return client;
}

export function initClient(accessToken) {
  client = Client.init({
    authProvider: (done) => done(null, accessToken),
  });
  return client;
}

export async function listFiles(folderPath = '/') {
  const c = client;
  if (!c) throw new Error('OneDrive client not initialized');

  const path = folderPath === '/' ? '/drive/root/children' : `/drive/root:${folderPath}:/children`;
  const res = await c.api(path).get();
  return res.value.map(f => ({
    id: f.id,
    name: f.name,
    folder: f.folder ? true : false,
    size: f.size,
    lastModified: f.lastModifiedDateTime,
    webUrl: f.webUrl,
  }));
}

export async function createFolder(parentPath, name) {
  const c = client;
  if (!c) throw new Error('OneDrive client not initialized');

  const path = parentPath === '/'
    ? '/drive/root/children'
    : `/drive/root:${parentPath}:/children`;

  const res = await c.api(path).post({
    name,
    folder: {},
    '@microsoft.graph.conflictBehavior': 'rename',
  });
  return res;
}

export async function moveFile(fileId, newParentPath) {
  const c = client;
  if (!c) throw new Error('OneDrive client not initialized');

  const parentRef = { path: `/drive/root:${newParentPath}` };
  const res = await c.api(`/drive/items/${fileId}`).update({ parentReference: parentRef });
  return res;
}

export async function downloadFile(fileId) {
  const c = client;
  if (!c) throw new Error('OneDrive client not initialized');

  return c.api(`/drive/items/${fileId}/content`).get();
}
