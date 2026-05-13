import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import Landing from './pages/Landing';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { useStore } from './store/useStore';
import { useEffect } from 'react';
import { supabase } from './lib/supabase';
import { UserRole } from './types';

export default function App() {
  const { user, setUser, setLoading } = useStore();

  useEffect(() => {
    // Force reset loading from any stale persisted state
    setLoading(false);

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncUser(session.user);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        syncUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncUser = async (supabaseUser: any) => {
    try {
      // Determine role based on email hierarchy, otherwise check existing or fallback
      let role: UserRole = 'customer';
      if (supabaseUser.email === 'admin@gmail.com') {
        role = 'admin';
      } else if (supabaseUser.email === 'staff@gmail.com') {
        role = 'staff';
      } else {
        const { data: existingUser } = await supabase.from('users').select('role').eq('id', supabaseUser.id).maybeSingle();
        if (existingUser && existingUser.role) {
          role = existingUser.role as UserRole;
        }
      }

      // Upsert user record to record existence safely
      console.log('[App] Starting DB sync for user:', supabaseUser.id);
      const { error: syncErr } = await supabase.from('users').upsert({
        id: supabaseUser.id,
        email: supabaseUser.email,
        role: role,
        created_at: supabaseUser.created_at || new Date().toISOString()
      });

      if (syncErr) {
        console.warn('[App] Upsert sync failed / blocked by RLS:', syncErr.message);
      } else {
        console.log('[App] DB sync successful');
      }

      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: role,
        created_at: supabaseUser.created_at
      });
      console.log('[App] Auth state updated for:', supabaseUser.email);
    } catch (e) {
      console.error('[App] Critical Sync Error:', e);
      // Absolute fallback: set user even if DB is totally unreachable
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: 'customer',
        created_at: supabaseUser.created_at
      });
    }
  };

  return (
    <Router>
      <div className="min-h-screen text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
        <Navbar />
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={user ? <Navigate to="/app" replace /> : <Landing />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/vehicles/:id" element={<VehicleDetail />} />
            <Route path="/login" element={user ? <Navigate to="/app" replace /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/app" replace /> : <Login />} />
            
            {/* Protected Routes */}
            <Route 
              path="/app/*" 
              element={user ? <Dashboard /> : <Navigate to="/login" replace />} 
            />
          </Routes>
        </main>
        
        <Footer />

        {/* Dynamic Background elements for "Liquid Glass" feel */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-cyan-600/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
          
          <div className="absolute top-[30%] left-[20%] w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] animate-float" />
          <div className="absolute bottom-[20%] right-[30%] w-72 h-72 bg-cyan-400/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '-3s' }} />
        </div>

        {/* Floating gradient mesh (subtle) */}
        <div className="fixed inset-0 pointer-events-none z-[-1] opacity-30">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(15,23,42,0)_0%,rgba(15,23,42,1)_100%)]" />
        </div>
      </div>
    </Router>
  );
}
