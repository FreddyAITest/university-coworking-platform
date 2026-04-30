import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard({ user }) {
  const [period, setPeriod] = useState('week');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchTasks = (p) => {
    setLoading(true);
    fetch(`/api/overview/tasks?period=${p}`)
      .then(r => r.json())
      .then(d => setTasks(d.tasks || []))
      .finally(() => setLoading(false));
  };

  const generateTasks = () => {
    setGenerating(true);
    fetch('/api/overview/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period }),
    })
      .then(r => r.json())
      .then(d => setTasks(d.tasks || []))
      .finally(() => setGenerating(false));
  };

  useEffect(() => { fetchTasks('week'); }, []);

  const switchPeriod = (p) => { setPeriod(p); fetchTasks(p); };

  const priorityColor = {
    high: '#d32f2f',
    medium: '#f57c00',
    low: '#388e3c',
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Dashboard</h1>
        <div>
          <span style={{ marginRight: '1rem', color: '#666' }}>{user?.displayName}</span>
          <a href="/api/auth/logout"><button style={{ background: '#eee' }}>Logout</button></a>
        </div>
      </div>

      <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <Link to="/dashboard" style={{ fontWeight: 'bold', color: '#1a73e8' }}>Dashboard</Link>
        <Link to="/documents" style={{ color: '#666' }}>Documents</Link>
      </nav>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        {['day', 'week', 'month'].map(p => (
          <button key={p}
            onClick={() => switchPeriod(p)}
            style={{
              background: period === p ? '#1a73e8' : '#eee',
              color: period === p ? 'white' : '#333',
            }}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
        <button onClick={generateTasks} disabled={generating}
          style={{ marginLeft: 'auto', background: '#4caf50', color: 'white' }}>
          {generating ? 'Generating...' : 'Generate Tasks'}
        </button>
      </div>

      <div className="card">
        <h2>{period.charAt(0).toUpperCase() + period.slice(1)} Overview</h2>

        {loading ? (
          <p style={{ color: '#999' }}>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p style={{ color: '#999' }}>
            No tasks yet. Click "Generate Tasks" to run AI extraction from your OneDrive documents.
          </p>
        ) : (
          <div>
            {tasks.map(t => (
              <div key={t.id} style={{
                padding: '0.75rem', marginBottom: '0.5rem',
                borderLeft: `3px solid ${priorityColor[t.priority] || '#ccc'}`,
                background: '#fafafa', borderRadius: '4px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <strong>{t.title}</strong>
                  <span style={{
                    fontSize: '0.75rem', color: 'white',
                    background: priorityColor[t.priority] || '#ccc',
                    padding: '0.1rem 0.5rem', borderRadius: '3px',
                  }}>
                    {t.priority}
                  </span>
                </div>
                {t.description && <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.25rem' }}>{t.description}</p>}
                {t.due_date && (
                  <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.25rem' }}>
                    Due: {new Date(t.due_date).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
