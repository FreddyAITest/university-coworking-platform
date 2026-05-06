import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Documents from './pages/Documents.jsx';

const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const DEV_USER = {
  id: 'dev-user',
  email: 'board@localhost',
  user_metadata: { full_name: 'Board User' },
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (DEV_MODE) {
      setUser(DEV_USER);
      setLoading(false);
      return;
    }

    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user || null);
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });

      return () => subscription.unsubscribe();
    }

    setLoading(false);
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
