import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Search, Car, Bike } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function Vehicles() {
  const { vehicles, fetchVehicles, user } = useStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'mobil' | 'motor'>('all');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         v.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || v.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Explore Collection</h1>
        <p className="text-gray-400">Discover your next journey with our premium fleet.</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or brand..." 
            className="w-full pl-12 pr-4 py-3 rounded-full glass-panel focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mb-2 sm:pb-0 sm:mb-0 snap-x hide-scrollbar">
          <Button 
            variant={filterType === 'all' ? 'primary' : 'secondary'} 
            onClick={() => setFilterType('all')}
            className="rounded-full px-6 whitespace-nowrap snap-start"
          >
            All
          </Button>
          <Button 
            variant={filterType === 'mobil' ? 'primary' : 'secondary'} 
            onClick={() => setFilterType('mobil')}
            className="rounded-full px-6 flex items-center gap-2 whitespace-nowrap snap-start"
          >
            <Car size={18} /> Mobil
          </Button>
          <Button 
            variant={filterType === 'motor' ? 'primary' : 'secondary'} 
            onClick={() => setFilterType('motor')}
            className="rounded-full px-6 flex items-center gap-2 whitespace-nowrap snap-start"
          >
            <Bike size={18} /> Motor
          </Button>
        </div>
      </div>

      {/* Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredVehicles.map((vehicle) => (
            <motion.div
              layout
              key={vehicle.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard className="group overflow-hidden p-0 h-full flex flex-col">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img 
                    src={vehicle.image_url} 
                    alt={vehicle.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 glass-panel px-3 py-1 rounded-full text-xs font-bold text-cyan-400">
                    {formatCurrency(vehicle.price_per_day)} <span className="opacity-60 font-normal">/ d</span>
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
                  <h3 className="text-lg font-bold mb-1">{vehicle.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-1.5 h-1.5 rounded-full ${vehicle.stock > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${vehicle.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {vehicle.stock > 0 ? `${vehicle.stock} Tersedia` : 'Habis'}
                    </span>
                  </div>
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
        </AnimatePresence>
      </motion.div>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No vehicles found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
