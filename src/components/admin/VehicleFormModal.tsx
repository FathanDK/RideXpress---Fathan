import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { X, Save, Image as ImageIcon, Briefcase, Tag, DollarSign, Package, Trash2 } from 'lucide-react';
import { Vehicle } from '../../types';
import { motion } from 'motion/react';

interface VehicleFormModalProps {
  vehicle?: Vehicle;
  onClose: () => void;
}

export function VehicleFormModal({ vehicle, onClose }: VehicleFormModalProps) {
  const { addVehicle, updateVehicle, loading } = useStore();
  
  // Lock background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState<Partial<Vehicle>>(
    vehicle || {
      name: '',
      brand: '',
      type: 'mobil',
      price_per_day: 0,
      status: 'available',
      image_url: '',
      description: '',
      total_stock: 1,
      stock: 1
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErrorMsg('');

    try {
      if (vehicle) {
        await updateVehicle({ 
          ...vehicle, 
          ...formData,
          status: (formData.stock || 0) > 0 ? 'available' : 'rented'
        } as Vehicle);
      } else {
        const stockValue = formData.total_stock || 1;
        await addVehicle({
          ...formData,
          total_stock: stockValue,
          stock: stockValue,
          status: stockValue > 0 ? 'available' : 'rented',
        } as Vehicle);
      }
      onClose();
    } catch (err: any) {
      console.error('Submit error:', err);
      setErrorMsg(err.message || JSON.stringify(err) || 'Terjadi kesalahan saat menyimpan data');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-[var(--radius-ios)]"
      >
        <GlassCard className="p-6 md:p-10 relative border border-white/10" hover={false}>
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors z-20"
          >
            <X size={20} />
          </button>

          <h2 className="text-2xl font-bold mb-8">{vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-1">Vehicle Name</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="text" 
                  required
                  className="w-full glass-panel border-white/5 pl-12 pr-4 py-3 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  placeholder="e.g. Ninja H2R"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-1">Brand</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="text" 
                  required
                  className="w-full glass-panel border-white/5 pl-12 pr-4 py-3 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  placeholder="e.g. Kawasaki"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-1">Type</label>
              <select 
                className="w-full glass-panel border-white/5 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="mobil" className="bg-[#0f172a]">Mobil</option>
                <option value="motor" className="bg-[#0f172a]">Motor</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-1">Price Per Day (IDR)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="number" 
                  required
                  className="w-full glass-panel border-white/5 pl-12 pr-4 py-3 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  placeholder="500000"
                  value={formData.price_per_day === 0 ? '' : formData.price_per_day}
                  onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value === '' ? 0 : Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400 ml-1">Stok Tersedia (Ready)</label>
              <div className="relative">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500" size={16} />
                <input 
                  type="number" 
                  required
                  min="0"
                  className="w-full glass-panel border-white/5 pl-12 pr-4 py-3 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all font-bold"
                  placeholder="3"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-1">Total Kapasitas Armada</label>
              <div className="relative">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="number" 
                  required
                  min="1"
                  className="w-full glass-panel border-white/5 pl-12 pr-4 py-3 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  placeholder="8"
                  value={formData.total_stock || ''}
                  onChange={(e) => setFormData({ ...formData, total_stock: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-1">Image URL</label>
              <div className="relative">
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="url" 
                  required
                  className="w-full glass-panel border-white/5 pl-12 pr-4 py-3 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>
              {formData.image_url && (
                <div className="mt-4 aspect-video rounded-2xl overflow-hidden glass-panel border-white/10">
                   <img src={formData.image_url} className="w-full h-full object-cover" alt="Preview" />
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
               <label className="text-[10px] uppercase font-bold tracking-widest text-gray-500 ml-1">Description</label>
               <textarea 
                  className="w-full glass-panel border-white/5 px-4 py-3 rounded-2xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all min-h-[100px]"
                  placeholder="Enter vehicle description..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
               />
            </div>

            <div className="md:col-span-2 pt-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 rounded-2xl font-bold bg-cyan-500 text-black hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 <Save size={20} className="mr-2" />
                 {loading ? 'Memproses...' : vehicle ? 'Update Vehicle' : 'Save Vehicle'}
              </Button>
              
              {errorMsg && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium text-center">
                  {errorMsg}
                </div>
              )}
            </div>

            {vehicle && (
              <div className="md:col-span-2 mt-12 pt-8 border-t border-red-500/20">
                <div className="bg-red-500/5 rounded-[var(--radius-ios)] p-6 border border-red-500/10">
                  <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                    <Trash2 size={18} />
                    Danger Zone
                  </h3>
                  <p className="text-xs text-red-500/60 mb-4">
                    Menghapus kendaraan ini bersifat permanen dan tidak dapat dibatalkan. Data penyewaan terkait mungkin akan terpengaruh.
                  </p>
                  
                  {!isDeleting ? (
                    <Button 
                      type="button"
                      variant="ghost"
                      className="w-full py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-bold"
                      onClick={() => setIsDeleting(true)}
                    >
                      Hapus Armada Selamanya
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        type="button"
                        className="flex-1 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all text-xs font-bold"
                        onClick={() => {
                          useStore.getState().deleteVehicle(vehicle.id);
                          onClose();
                        }}
                      >
                        Ya, Hapus Sekarang
                      </Button>
                      <Button 
                        type="button"
                        variant="secondary"
                        className="flex-1 py-3 rounded-xl text-xs font-bold"
                        onClick={() => setIsDeleting(false)}
                      >
                        Batal
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
