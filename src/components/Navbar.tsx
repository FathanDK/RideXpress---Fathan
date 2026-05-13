import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Button } from './ui/Button';
import { Car, Menu, LogOut, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

export function Navbar() {
  const { user, setUser } = useStore();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setUser(null);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4"
      >
        <div className="glass-panel px-6 py-3 rounded-full flex items-center justify-between w-full max-w-4xl gap-8">
          <Link to="/" className="flex items-center gap-2 group" onClick={closeMenu}>
            <div className="p-2 rounded-full bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
              <Car size={24} />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">RideXpress</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/vehicles" className="text-sm font-medium hover:text-cyan-400 transition-colors">Vehicles</Link>
            {user ? (
              <>
                <Link to="/app" className="text-sm font-medium hover:text-cyan-400 transition-colors">Dashboard</Link>
                <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-semibold">{user.email}</span>
                    <span className="text-[10px] opacity-50 uppercase tracking-widest">{user.role}</span>
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleLogout} 
                    className="px-4 py-2 flex items-center gap-2 rounded-xl group hover:bg-red-500/10 hover:text-red-400 border-white/5 transition-all"
                  >
                    <span className="text-xs font-bold hidden sm:inline">Logout</span>
                    <LogOut size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="px-5 rounded-xl font-bold bg-cyan-500 text-black">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          <button 
            className="md:hidden p-2 rounded-full hover:bg-white/10"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={20} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
            onClick={closeMenu}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 bottom-0 w-[280px] bg-slate-900 border-l border-white/10 p-6 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-bold text-xl tracking-tight">Menu</span>
                <button 
                  onClick={closeMenu}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                <Link to="/vehicles" onClick={closeMenu} className="text-lg font-medium hover:text-cyan-400 transition-colors">
                  Vehicles
                </Link>
                
                {user ? (
                  <>
                    <Link to="/app" onClick={closeMenu} className="text-lg font-medium hover:text-cyan-400 transition-colors">
                      Dashboard
                    </Link>
                    <div className="h-px bg-white/10 my-2" />
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold">{user.email}</span>
                      <span className="text-[10px] opacity-50 uppercase tracking-widest">{user.role}</span>
                    </div>
                    <Button 
                      variant="secondary" 
                      onClick={handleLogout} 
                      className="w-full mt-4 py-3 flex justify-center items-center gap-2 rounded-xl hover:bg-red-500/10 hover:text-red-400 border-white/5 transition-all text-sm font-bold"
                    >
                      <LogOut size={16} />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="h-px bg-white/10 my-2" />
                    <Link to="/login" onClick={closeMenu}>
                      <Button variant="ghost" className="w-full justify-start text-lg">Sign In</Button>
                    </Link>
                    <Link to="/register" onClick={closeMenu}>
                      <Button variant="primary" className="w-full bg-cyan-500 text-black font-bold h-12">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
