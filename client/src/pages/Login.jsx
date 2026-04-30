export default function Login() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', background: '#f0f4f8',
    }}>
      <div className="card" style={{ textAlign: 'center', maxWidth: 400 }}>
        <h1>Coworking Platform</h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          AI-powered document sorting and task overviews for your university workspace.
        </p>
        <a href="/api/auth/google">
          <button className="btn-primary" style={{ fontSize: '1rem', padding: '0.8rem 2rem' }}>
            Sign in with Google
          </button>
        </a>
      </div>
    </div>
  );
}
