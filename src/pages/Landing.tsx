import { motion } from 'motion/react';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Zap, ArrowRight, Star } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { useStore } from '../store/useStore';
import { useEffect } from 'react';

export default function Landing() {
  const { vehicles, user, fetchVehicles } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const featuredVehicles = vehicles.slice(0, 3);

  return (
    <div className="pt-32 pb-20 px-6">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto text-center mb-32 relative">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full glass-panel text-xs font-semibold tracking-widest uppercase text-cyan-400 mb-6 border-cyan-500/20">
            Premium Vehicle Rental
          </span>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            Experience <br /> <span className="italic text-cyan-400">The Best Ride.</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Rent premium cars and motors with a seamless, glass-smooth experience. 
            Luxury at your fingertips, powered by RideXpress.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/vehicles">
              <Button size="lg" className="w-full sm:w-auto">
                Browse Collection <ArrowRight size={20} className="ml-1" />
              </Button>
            </Link>
            <Link to="/vehicles">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Explore All
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Featured Vehicles */}
      <section className="max-w-7xl mx-auto mb-32">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Elite Fleet</h2>
            <p className="text-gray-400">Handpicked premium vehicles for your journey.</p>
          </div>
          <Link to="/vehicles" className="text-cyan-400 font-medium hover:underline flex items-center gap-2">
            View all vehicles <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredVehicles.map((vehicle, i) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="group overflow-hidden p-0 h-full flex flex-col">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img 
                    src={vehicle.image_url} 
                    alt={vehicle.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 glass-panel px-3 py-1 rounded-full text-xs font-bold text-cyan-400">
                    {formatCurrency(vehicle.price_per_day)} <span className="opacity-60 font-normal">/ day</span>
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-400/10 capitalize">
                      {vehicle.type}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                      {vehicle.brand}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{vehicle.name}</h3>
                  <p className="text-sm text-gray-400 mb-6 line-clamp-2">{vehicle.description}</p>
                  <div className="mt-auto">
                    <Button 
                      variant="secondary" 
                      className="w-full"
                      onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                    >
                      Rent Now
                    </Button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats / Proof */}
      <section className="max-w-5xl mx-auto">
        <GlassCard className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 text-center" hover={false}>
          <div>
            <div className="text-3xl font-bold mb-1">500+</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">Vehicles</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">12k+</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">Happy Clients</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">15</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">Cities</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-1">4.9/5</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest flex items-center justify-center gap-1">
              Rating <Star size={12} className="text-yellow-500 fill-yellow-500" />
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
