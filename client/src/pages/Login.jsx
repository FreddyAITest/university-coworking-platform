export default function Login({ supabase }) {
  const signInWithGoogle = () => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' },
    });
  };

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
        <button
          className="btn-primary"
          style={{ fontSize: '1rem', padding: '0.8rem 2rem' }}
          onClick={signInWithGoogle}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
