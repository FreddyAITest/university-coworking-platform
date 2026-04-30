import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Documents from './pages/Documents.jsx';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="container">Loading...</div>;

  if (!user) return <Login supabase={supabase} />;

  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard user={user} supabase={supabase} />} />
      <Route path="/documents" element={<Documents user={user} supabase={supabase} />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
