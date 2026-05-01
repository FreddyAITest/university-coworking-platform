import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

export default function Documents({ user, supabase }) {
  const [files, setFiles] = useState([]);
  const [folder, setFolder] = useState('/');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const authHeaders = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
    };
  }, [supabase]);

  const fetchFiles = async (f) => {
    setLoading(true);
    setError(null);
    const headers = await authHeaders();
    fetch(`/api/documents/files?folder=${encodeURIComponent(f)}`, { headers })
      .then(r => r.ok ? r.json() : Promise.reject('Failed to load'))
      .then(data => { setFiles(data.files); setFolder(data.folder); })
      .catch(e => setError(e.message || String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFiles('/'); }, []);

  const navTo = (f) => fetchFiles(folder === '/' ? `/${f}` : `${folder}/${f}`);

  const signOut = () => supabase.auth.signOut();

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Documents</h1>
        <div>
          <span style={{ marginRight: '1rem', color: '#666' }}>{user?.user_metadata?.full_name || user?.email}</span>
          <button onClick={signOut} style={{ background: '#eee' }}>Logout</button>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/dashboard" style={{ color: '#666' }}>Dashboard</Link>
        <Link to="/documents" style={{ fontWeight: 'bold', color: '#1a73e8' }}>Documents</Link>
      </nav>

      <div className="card">
        <div style={{ marginBottom: '0.5rem', color: '#666', fontSize: '0.85rem' }}>
          Path: {folder}
        </div>

        {error && <p style={{ color: '#d32f2f', marginBottom: '1rem' }}>{error}</p>}

        {loading ? (
          <p style={{ color: '#999' }}>Loading...</p>
        ) : files.length === 0 ? (
          <p style={{ color: '#999' }}>No files found. Upload documents to the storage folder to get started.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem' }}>Name</th>
                <th style={{ padding: '0.5rem' }}>Type</th>
                <th style={{ padding: '0.5rem' }}>Modified</th>
              </tr>
            </thead>
            <tbody>
              {files.map(f => (
                <tr key={f.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '0.5rem' }}>
                    {f.folder ? (
                      <button onClick={() => navTo(f.name)}
                        style={{ background: 'none', color: '#1a73e8', textDecoration: 'underline', padding: 0, fontSize: 'inherit' }}>
                        {f.name}/
                      </button>
                    ) : f.name}
                  </td>
                  <td style={{ padding: '0.5rem', color: '#666' }}>
                    {f.folder ? 'Folder' : 'File'}
                  </td>
                  <td style={{ padding: '0.5rem', color: '#666', fontSize: '0.85rem' }}>
                    {f.lastModified ? new Date(f.lastModified).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
