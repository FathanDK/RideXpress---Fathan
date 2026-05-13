import { useStore } from '../store/useStore';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { useLocation } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  TrendingUp, 
  Package, 
  DollarSign, 
  Clock,
  Edit2,
  MapPin,
  Car,
  Activity,
  ShieldCheck,
  ArrowUpRight,
  Trash2,
  X,
  CheckCircle2
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect } from 'react';
import { VehicleFormModal } from '../components/admin/VehicleFormModal';
import { Booking, Vehicle } from '../types';

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculate = () => {
      const end = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('WAKTU HABIS');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      let str = '';
      if (days > 0) str += `${days} hari `;
      str += `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      setTimeLeft(str);
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return <span className="font-mono text-purple-400 font-bold">{timeLeft}</span>;
};

export default function Dashboard() {
  const { user, vehicles, bookings, deleteVehicle, deleteBooking, updateBookingStatus, fetchVehicles, fetchBookings } = useStore();
  const location = useLocation();
  const [showSuccess, setShowSuccess] = useState(location.state?.bookingSuccess || false);
  
  const [viewImage, setViewImage] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';

  React.useEffect(() => {
    fetchVehicles();
    fetchBookings();
    
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>(undefined);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Sync selectedBooking with latest store data
  React.useEffect(() => {
    setViewImage(null); // Reset image viewer when changing booking
    if (selectedBooking) {
      const updated = bookings.find(b => b.id === selectedBooking.id);
      if (updated) {
        setSelectedBooking(updated);
      } else {
        setSelectedBooking(null);
      }
    }
  }, [bookings]);

  const openAddModal = () => {
    setEditingVehicle(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kendaraan ini?')) {
      deleteVehicle(id);
    }
  };

  const handleDeleteBooking = (e: React.MouseEvent, id: string) => {
    console.log('[Dashboard] handleDeleteBooking triggered for ID:', id);
    e.preventDefault();
    e.stopPropagation();
    
    // Using simple confirmation state or just delete directly since confirm() is blocked
    // For now, we will perform the deletion immediately. Users were complaining 
    // it doesn't do anything because window.confirm is not working in iframe.
    console.log('[Dashboard] Delete direct call to store.deleteBooking...');
    deleteBooking(id).then(() => {
      console.log('[Dashboard] deleteBooking call finished');
    }).catch(err => {
      console.error('[Dashboard] deleteBooking call failed:', err);
    });
  };

  const handleStatusUpdate = (id: string, status: any) => {
    updateBookingStatus(id, status).then(() => {
      if (selectedBooking?.id === id) {
        setSelectedBooking(null);
      }
    });
  };

  const getDaysRemaining = (endDateStr: string) => {
    const end = new Date(endDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Dynamic calculations
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const activeRentalsCount = bookings.filter(b => b.status === 'ongoing').length;

  const getChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map(m => ({ name: m, value: 0 }));
    
    bookings.forEach(b => {
      if (b.start_date) {
        const d = new Date(b.start_date);
        const monthIndex = d.getMonth();
        if (monthIndex >= 0 && monthIndex <= 11) {
          data[monthIndex].value += Number(b.total_price) || 0;
        }
      }
    });

    const currentMonth = new Date().getMonth();
    let startIndex = currentMonth - 5; // Show last 6 months
    if (startIndex < 0) startIndex = 0;
    
    return data.slice(startIndex, currentMonth + 1);
  };
  const chartData = getChartData();


  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-12">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-green-500/10 border border-green-500/20 p-6 rounded-3xl flex items-center gap-4 text-green-400"
          >
            <div className="bg-green-500/20 p-2 rounded-xl">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h4 className="font-bold">Pemesanan Berhasil!</h4>
              <p className="text-sm opacity-80">Pesanan Anda telah diterima dan sedang diproses oleh tim kami. Kami akan menghubungi Anda segera.</p>
            </div>
            <button onClick={() => setShowSuccess(false)} className="ml-auto p-2 hover:bg-white/5 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">My RIdeXpress</h1>
          <div className="flex items-center gap-3">
             <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-cyan-400' : isStaff ? 'bg-purple-400' : 'bg-green-400 animate-pulse'}`} />
                <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                  {isAdmin ? 'System Administrator' : isStaff ? 'Staff Personnel' : 'Customer Account'}
                </span>
             </div>
             <span className="text-xs text-gray-500 font-medium">{user?.email}</span>
          </div>
        </div>
        
        {isAdmin && (
          <Button onClick={openAddModal} className="h-14 px-8 rounded-2xl group">
             <Plus className="mr-2 group-hover:rotate-90 transition-transform" /> 
             TAMBAH UNIT BARU
          </Button>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <VehicleFormModal 
            vehicle={editingVehicle} 
            onClose={() => setIsModalOpen(false)} 
          />
        )}
      </AnimatePresence>

      {/* Booking Detail Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedBooking(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl glass-panel p-8 rounded-3xl my-auto shadow-2xl border-white/10"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500" />
              
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                  <div className="bg-cyan-500/20 p-3 rounded-2xl">
                    <Package className="text-cyan-400" size={32} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-tight">Detail Reservasi</h3>
                    <div className="flex items-center gap-2">
                       <p className="text-xs text-gray-500 font-mono">ID PESANAN:</p>
                       <p className="text-xs text-cyan-400 font-mono font-bold tracking-widest">{selectedBooking.id}</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="p-3 hover:bg-white/10 rounded-2xl transition-colors group"
                >
                  <X size={32} className="group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Vehicle & Visuals */}
                <div className="space-y-6">
                  <div className="aspect-video rounded-3xl overflow-hidden glass-panel p-1 border-white/5">
                    <img 
                      src={vehicles.find(v => v.id === selectedBooking.vehicle_id)?.image_url} 
                      className="w-full h-full object-cover rounded-[20px]"
                      alt="Vehicle"
                    />
                  </div>
                  
                  <div className="glass-panel p-6 rounded-3xl border-white/5 bg-white/[0.02]">
                    <div className="text-[10px] text-cyan-400 font-black uppercase mb-2 tracking-widest">Informasi Unit</div>
                    <div className="text-2xl font-black mb-1">{vehicles.find(v => v.id === selectedBooking.vehicle_id)?.name}</div>
                    <div className="text-secondary-400 font-bold flex items-center gap-2">
                       <Car size={16} />
                       {vehicles.find(v => v.id === selectedBooking.vehicle_id)?.brand}
                    </div>
                  </div>

                  <div className={`p-6 rounded-3xl border flex flex-col items-center justify-center gap-2 ${
                    selectedBooking.status === 'completed' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                    selectedBooking.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                    'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                  }`}>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em]">Status Pesanan</div>
                    <div className="text-2xl font-black uppercase">{selectedBooking.status}</div>
                  </div>

                  {['approved', 'ongoing'].includes(selectedBooking.status) && (
                    <div className="p-6 rounded-3xl border border-purple-500/20 bg-purple-500/5 flex flex-col items-center justify-center gap-2">
                      <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Sisa Waktu Rental</div>
                      <CountdownTimer targetDate={selectedBooking.end_date} />
                    </div>
                  )}
                </div>

                {/* Middle Column: Customer & Dates */}
                <div className="space-y-6 lg:border-x lg:border-white/5 lg:px-8">
                  <div className="glass-panel p-6 rounded-3xl border-white/5">
                    <div className="text-[10px] uppercase font-black text-gray-500 mb-4 tracking-widest">Profil Penyewa</div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase">Nama Lengkap</p>
                        <p className="font-bold text-lg">{selectedBooking.full_name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase">Kontak WhatsApp</p>
                        <a 
                          href={`https://wa.me/${selectedBooking.whatsapp_number.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-bold text-green-400 hover:underline flex items-center gap-2"
                        >
                          {selectedBooking.whatsapp_number}
                          <ArrowUpRight size={14} />
                        </a>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase">Alamat Tinggal</p>
                        <p className="text-xs text-gray-400 leading-relaxed mt-1">{selectedBooking.address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass-panel p-5 rounded-3xl border-white/5 text-center">
                        <div className="text-[10px] uppercase font-black text-gray-500 mb-1">Mulai</div>
                        <div className="font-bold text-sm">{selectedBooking.start_date}</div>
                      </div>
                      <div className="glass-panel p-5 rounded-3xl border-white/5 text-center">
                        <div className="text-[10px] uppercase font-black text-gray-500 mb-1">Selesai</div>
                        <div className="font-bold text-sm">{selectedBooking.end_date}</div>
                      </div>
                    </div>
                    
                    <div className="glass-panel p-5 rounded-3xl border-white/5 flex justify-between items-center bg-cyan-500/5">
                       <div>
                         <div className="text-[10px] uppercase font-black text-gray-500">Durasi</div>
                         <div className="font-black text-cyan-400 uppercase tracking-widest">{selectedBooking.duration_type}</div>
                       </div>
                       <div className="text-right">
                         <div className="text-[10px] uppercase font-black text-gray-500">Total</div>
                         <div className="font-black text-xl text-white">{formatCurrency(selectedBooking.total_price)}</div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Delivery & Documents */}
                <div className="space-y-6">
                  <div className="glass-panel p-6 rounded-3xl border-white/5 bg-white/[0.02]">
                    <div className="text-[10px] uppercase font-black text-gray-500 mb-4 tracking-widest">Pengiriman & Berkas</div>
                    
                    <div className="mb-6">
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase font-black text-orange-400">Metode: {selectedBooking.delivery_method}</span>
                          <MapPin size={14} className="text-orange-400" />
                       </div>
                       {selectedBooking.delivery_method === 'delivery' ? (
                         <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 text-xs text-orange-200 leading-relaxed italic">
                           {selectedBooking.delivery_address}
                         </div>
                       ) : (
                         <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-[10px] text-gray-400 text-center">
                           Ambil Unit di Lokasi RIdeXpress
                         </div>
                       )}
                    </div>

                    <div className="space-y-4">
                       <div className="text-[10px] uppercase font-black text-gray-500 px-1">Verifikasi Dokumen</div>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { label: 'Identitas KTP', val: selectedBooking.document_ktp },
                            { label: 'SIM Nasional', val: selectedBooking.document_sim },
                            { label: 'Bukti Transfer', val: selectedBooking.transfer_proof }
                          ].map(doc => (
                            <div key={doc.label} className="glass-panel p-3 rounded-2xl border-white/5 flex items-center justify-between px-4 group hover:bg-white/5 transition-colors">
                               <div className="flex items-center gap-3">
                                  <ShieldCheck size={18} className="text-cyan-400" />
                                  <span className="text-[10px] font-bold uppercase">{doc.label}</span>
                               </div>
                               {doc.val ? (
                                 <button onClick={() => setViewImage(doc.val)} className="text-[10px] font-black text-gray-400 group-hover:text-cyan-400 transition-colors cursor-pointer ml-auto">
                                   LIHAT
                                 </button>
                               ) : (
                                 <span className="text-[10px] font-black text-gray-600">KOSONG</span>
                               )}
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>

                  {(isAdmin || isStaff) && selectedBooking.status === 'pending' && (
                    <div className="flex gap-3 pt-4">
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-500 text-white rounded-2xl py-4 font-black text-xs shadow-lg shadow-green-900/40"
                        onClick={() => handleStatusUpdate(selectedBooking.id, 'approved')}
                      >
                        APPROVE
                      </Button>
                      <Button 
                        className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded-2xl py-4 font-black text-xs shadow-lg shadow-red-900/40"
                        onClick={() => handleStatusUpdate(selectedBooking.id, 'rejected')}
                      >
                        REJECT
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            {isAdmin ? 'Admin Dashboard' : isStaff ? 'Staff Dashboard' : 'My RideXpress'}
          </h1>
          <p className="text-gray-400">
            {isAdmin 
              ? 'Kelola armada dan pantau performa bisnis Anda.' 
              : isStaff
                ? 'Kelola status penyewaan dan verifikasi dokumen.'
                : `Selamat datang kembali, ${user?.email?.split('@')[0]}. Pantau perjalanan Anda di sini.`}
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="secondary" className="px-5">
            <Search size={18} /> Search
          </Button>
        </div>
      </div>

      {isAdmin ? (
        <>
          {/* Admin Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: 'Total Pemasukan', value: formatCurrency(totalRevenue), icon: <DollarSign />, trend: totalRevenue > 0 ? '+12.5%' : 'N/A', color: 'text-green-400' },
              { label: 'Rental Aktif', value: activeRentalsCount.toString(), icon: <Package />, trend: activeRentalsCount > 0 ? 'Live' : 'Kosong', color: 'text-cyan-400' },
              { label: 'Total Model Kendaraan', value: vehicles.length.toString(), icon: <Car />, trend: 'Stabil', color: 'text-purple-400' },
            ].map((stat, i) => (
              <GlassCard key={i} className="relative overflow-hidden group">
                 <div className={stat.color + " p-3 rounded-2xl bg-white/5 w-fit mb-4 group-hover:scale-110 transition-transform"}>
                    {stat.icon}
                 </div>
                 <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">{stat.label}</div>
                 <div className="text-2xl font-bold flex items-center gap-3">
                   {stat.value}
                   <span className="text-[10px] text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full">{stat.trend}</span>
                 </div>
              </GlassCard>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <GlassCard className="lg:col-span-2 p-8" hover={false}>
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="text-xl font-bold">Analisis Pendapatan Tahun Ini</h3>
                    <p className="text-xs text-gray-500 mt-1">Pelacakan performa finansial berdasarkan pesanan.</p>
                 </div>
                 <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl">
                    <Activity size={18} />
                 </Button>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.some(d => d.value > 0) ? chartData : [{name: 'Belum ada data', value: 0}]}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        backdropFilter: 'blur(10px)'
                      }} 
                    />
                    <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard className="p-8" hover={false}>
               <h3 className="text-xl font-bold mb-6">Aktivitas Terbaru</h3>
               <div className="space-y-6">
                  {bookings.length > 0 ? bookings.slice(0, 4).map((b, i) => (
                    <div key={i} className="flex gap-4 group cursor-pointer" onClick={() => setSelectedBooking(b)}>
                       <div className={`w-1.5 rounded-full ${b.status === 'completed' ? 'bg-green-500' : 'bg-cyan-500'} self-stretch group-hover:w-2 transition-all`} />
                       <div className="flex-grow">
                          <div className="flex justify-between items-start">
                             <h4 className="text-sm font-bold truncate">{vehicles.find(v => v.id === b.vehicle_id)?.name || 'Rental'}</h4>
                             <span className="text-[10px] text-gray-500 shrink-0">{b.start_date}</span>
                          </div>
                          <div className="flex justify-between items-center mt-0.5">
                             <p className="text-[10px] text-gray-500 uppercase">{b.status}</p>
                             <p className="text-xs font-bold text-cyan-400">{formatCurrency(b.total_price)}</p>
                          </div>
                       </div>
                       <ArrowUpRight size={14} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  )) : (
                    <div className="text-center py-12 text-gray-500">
                      <Clock size={40} className="mx-auto mb-4 opacity-20" />
                      <p className="text-xs uppercase tracking-widest tracking-[0.2em]">Belum ada aktivitas</p>
                    </div>
                  )}
               </div>
            </GlassCard>
          </div>

          <GlassCard className="p-8 overflow-x-auto" hover={false}>
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold">Manajemen Armada Kendaraan</h3>
                <div className="text-xs text-cyan-400 font-bold bg-cyan-400/10 px-3 py-1 rounded-full uppercase tracking-widest">
                   {vehicles.length} Kendaraan Tersedia
                </div>
             </div>
             <table className="w-full text-left text-sm">
                <thead>
                   <tr className="border-b border-white/5 text-gray-500 text-[10px] uppercase tracking-widest">
                      <th className="pb-4 font-bold">Kendaraan</th>
                      <th className="pb-4 font-bold">Tipe</th>
                      <th className="pb-4 font-bold">Status</th>
                      <th className="pb-4 font-bold">Stok</th>
                      <th className="pb-4 font-bold">Harga</th>
                      <th className="pb-4 font-bold text-right">Aksi</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {vehicles.map((v) => (
                      <tr 
                        key={v.id} 
                        className={`group hover:bg-white/5 transition-colors cursor-pointer`}
                        onClick={() => openEditModal(v)}
                      >
                         <td className="py-4">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl overflow-hidden glass-panel p-0 border-white/10">
                                  <img src={v.image_url} alt="" className="w-full h-full object-cover" />
                               </div>
                               <div>
                                  <div className="font-bold">{v.name}</div>
                                  <div className="text-xs text-gray-500">{v.brand}</div>
                               </div>
                            </div>
                         </td>
                         <td className="py-4">
                            <span className="text-[10px] uppercase font-bold text-gray-400 border border-white/10 px-2 py-0.5 rounded-full">{v.type}</span>
                         </td>
                         <td className="py-4">
                            <div className="flex items-center gap-2">
                               <div className={`w-2 h-2 rounded-full ${v.status === 'available' ? 'bg-green-400' : 'bg-orange-400'}`} />
                               <span className="capitalize">{v.status}</span>
                            </div>
                         </td>
                         <td className="py-4 font-mono">
                            <div className="flex items-center gap-2">
                               <div className={`w-2 h-2 rounded-full ${(v.stock || 0) > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
                               <span className={(v.stock || 0) > 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{v.stock || 0} Unit</span>
                            </div>
                         </td>
                         <td className="py-4 font-mono">{formatCurrency(v.price_per_day)}/d</td>
                         <td className="py-4 text-right">
                               <div className="flex justify-end pr-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-tighter">
                                    Click to Edit
                                  </div>
                               </div>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </GlassCard>
        </>
      ) : isStaff ? (
        <>
          {/* Staff Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: 'Total Pesanan Menunggu', value: bookings.filter(b => b.status === 'pending').length.toString(), icon: <Activity />, color: 'text-orange-400' },
              { label: 'Total Rental Berjalan', value: bookings.filter(b => b.status === 'ongoing').length.toString(), icon: <Package />, color: 'text-cyan-400' },
              { label: 'Total Selesai', value: bookings.filter(b => b.status === 'completed').length.toString(), icon: <CheckCircle2 />, color: 'text-green-400' },
            ].map((stat, i) => (
              <GlassCard key={i} className="relative overflow-hidden group">
                 <div className={stat.color + " p-3 rounded-2xl bg-white/5 w-fit mb-4 group-hover:scale-110 transition-transform"}>
                    {stat.icon}
                 </div>
                 <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">{stat.label}</div>
                 <div className="text-2xl font-bold flex items-center gap-3">
                   {stat.value}
                 </div>
              </GlassCard>
            ))}
          </div>

          {/* Staff View: Booking Management */}
          <GlassCard className="p-8 overflow-x-auto" hover={false}>
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold">Manajemen Seluruh Pesanan</h3>
                <div className="text-xs text-orange-400 font-bold bg-orange-400/10 px-3 py-1 rounded-full uppercase tracking-widest">
                   {bookings.length} Total Pesanan
                </div>
             </div>
             <table className="w-full text-left text-sm">
                <thead>
                   <tr className="border-b border-white/5 text-gray-500 text-[10px] uppercase tracking-widest">
                      <th className="pb-4 font-bold">ID Rental</th>
                      <th className="pb-4 font-bold">Penyewa / Detail</th>
                      <th className="pb-4 font-bold">Kontak</th>
                      <th className="pb-4 font-bold">Status</th>
                      <th className="pb-4 font-bold">Ubah Status</th>
                      <th className="pb-4 font-bold text-right">Aksi Tambahan</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {bookings.map((b) => (
                      <tr 
                        key={b.id} 
                        className="group hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => setSelectedBooking(b)}
                      >
                         <td className="py-4">
                            <span className="font-mono text-cyan-400">#{b.id}</span>
                         </td>
                         <td className="py-4">
                            <div className="text-xs font-bold">{vehicles.find(v => v.id === b.vehicle_id)?.name || 'Unknown Vehicle'}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-gray-500 font-mono font-bold uppercase">{b.full_name || 'Guest'}</span>
                              {['approved', 'ongoing'].includes(b.status) && (
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getDaysRemaining(b.end_date) <= 1 ? 'bg-red-500/20 text-red-500' : 'bg-purple-500/10 text-purple-400'}`}>
                                  Sisa {Math.max(0, getDaysRemaining(b.end_date))} Hari
                                </span>
                              )}
                            </div>
                         </td>
                         <td className="py-4">
                            <div className="flex flex-col gap-1">
                               <a 
                                 href={`https://wa.me/${b.whatsapp_number?.replace(/\D/g, '')}`} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 onClick={(e) => e.stopPropagation()}
                                 className="text-xs text-green-400 hover:underline inline-flex items-center gap-1"
                               >
                                  WA: {b.whatsapp_number}
                               </a>
                               {(b.user as any)?.email && (
                                 <a 
                                   href={`mailto:${(b.user as any).email}?subject=Konfirmasi Pesanan RIdeXpress - ${b.id}`}
                                   onClick={(e) => e.stopPropagation()}
                                   className="text-xs text-cyan-400 hover:underline inline-flex items-center gap-1"
                                 >
                                    Email: {(b.user as any).email}
                                 </a>
                               )}
                            </div>
                         </td>
                         <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold ${
                              b.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                              b.status === 'approved' ? 'bg-blue-500/10 text-blue-500' :
                              b.status === 'ongoing' ? 'bg-cyan-500/10 text-cyan-500' :
                              b.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                              'bg-red-500/10 text-red-500'
                            }`}>
                               {b.status}
                            </span>
                         </td>
                         <td className="py-4">
                            <select 
                              className="bg-[#1a202c] text-white border border-white/20 rounded-lg text-[10px] p-2 outline-none appearance-none cursor-pointer hover:bg-white/5 transition-colors"
                              value={b.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => handleStatusUpdate(b.id, e.target.value as any)}
                            >
                              <option value="pending" className="bg-[#1a202c]">Pending (Menunggu)</option>
                              <option value="approved" className="bg-[#1a202c]">Approved</option>
                              <option value="ongoing" className="bg-[#1a202c]">Berjalan (Ongoing)</option>
                              <option value="completed" className="bg-[#1a202c]">Selesai (Completed)</option>
                              <option value="rejected" className="bg-[#1a202c]">Ditolak (Rejected)</option>
                            </select>
                         </td>
                         <td className="py-4 text-right">
                            <div className="flex justify-end items-center gap-2">
                               {b.status === 'approved' && (
                                 <button 
                                   type="button"
                                   className="px-3 py-1.5 text-[10px] font-black text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors cursor-pointer"
                                   onClick={(e) => {
                                     e.preventDefault(); e.stopPropagation();
                                     handleStatusUpdate(b.id, 'ongoing');
                                   }}
                                 >
                                   MULAI TIMER
                                 </button>
                               )}
                               <button 
                                 type="button"
                                 className={`p-2 font-black text-white rounded-full transition-all flex items-center justify-center ${(b.status === 'completed' || isAdmin) ? 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-900/20 cursor-pointer active:scale-90' : 'bg-gray-600 opacity-50 cursor-not-allowed'}`}
                                 title={isAdmin || b.status === 'completed' ? "Hapus Pesanan" : "Hanya pesanan selesai yang dapat dihapus"}
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   if (isAdmin || b.status === 'completed') {
                                     handleDeleteBooking(e, b.id);
                                   } else {
                                     alert('Maaf, Staff hanya dapat menghapus pesanan yang sudah berstatus Selesai (Completed).');
                                   }
                                 }}
                               >
                                 <Trash2 size={14} className="pointer-events-none" />
                               </button>
                            </div>
                         </td>
                      </tr>
                   ))}
                   {bookings.length === 0 && (
                     <tr>
                        <td colSpan={6} className="py-20 text-center text-gray-500 uppercase tracking-widest text-[10px]">
                           Belum ada pesanan masuk
                        </td>
                     </tr>
                   )}
                </tbody>
             </table>
          </GlassCard>
        </>
      ) : (
        <div className="space-y-8">
          {/* Customer Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: 'Total Pesanan', value: bookings.filter(b => b.user_id === user?.id).length.toString(), icon: <Package />, color: 'text-cyan-400' },
              { label: 'Sewa Sedang Jalan', value: bookings.filter(b => b.user_id === user?.id && b.status === 'ongoing').length.toString(), icon: <Clock />, color: 'text-purple-400' },
              { label: 'Status Verifikasi', value: 'Terverifikasi', icon: <ShieldCheck />, color: 'text-green-400' },
            ].map((stat, i) => (
              <GlassCard key={i} className="relative overflow-hidden group">
                 <div className={stat.color + " p-3 rounded-2xl bg-white/5 w-fit mb-4 group-hover:scale-110 transition-transform"}>
                    {stat.icon}
                 </div>
                 <div className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">{stat.label}</div>
                 <div className="text-2xl font-bold flex items-center gap-3">
                   {stat.value}
                 </div>
              </GlassCard>
            ))}
          </div>

          <GlassCard className="p-8 overflow-x-auto" hover={false}>
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold">Riwayat Persewaan Saya</h3>
                <div className="text-xs text-cyan-400 font-bold bg-cyan-400/10 px-3 py-1 rounded-full uppercase tracking-widest">
                   {bookings.filter(b => b.user_id === user?.id).length} Pesanan
                </div>
             </div>
             
             {bookings.filter(b => b.user_id === user?.id).length > 0 ? (
               <table className="w-full text-left text-sm">
                  <thead>
                     <tr className="border-b border-white/5 text-gray-500 text-[10px] uppercase tracking-widest">
                        <th className="pb-4 font-bold">ID Rental</th>
                        <th className="pb-4 font-bold">Kendaraan</th>
                        <th className="pb-4 font-bold">Tanggal Sewa</th>
                        <th className="pb-4 font-bold">Total</th>
                        <th className="pb-4 font-bold">Status</th>
                        <th className="pb-4 font-bold text-right">Detail</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {bookings.filter(b => b.user_id === user?.id).map((b) => (
                        <tr 
                          key={b.id} 
                          className="group hover:bg-white/5 transition-colors cursor-pointer"
                          onClick={() => setSelectedBooking(b)}
                        >
                           <td className="py-4">
                              <span className="font-mono text-cyan-400">#{b.id}</span>
                           </td>
                           <td className="py-4">
                              <div className="text-xs font-bold">{vehicles.find(v => v.id === b.vehicle_id)?.name || 'Unit Ridexpress'}</div>
                              <div className="text-[10px] text-gray-500">{vehicles.find(v => v.id === b.vehicle_id)?.brand}</div>
                           </td>
                           <td className="py-4 space-y-1">
                              <div className="text-[10px] font-bold">{b.start_date} s/d {b.end_date}</div>
                              {['approved', 'ongoing'].includes(b.status) && (
                                <div className="flex items-center gap-2">
                                  <Clock size={10} className="text-purple-400" />
                                  <CountdownTimer targetDate={b.end_date} />
                                </div>
                              )}
                           </td>
                           <td className="py-4 font-mono font-bold text-white">{formatCurrency(b.total_price)}</td>
                           <td className="py-4">
                              <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold ${
                                b.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                b.status === 'approved' ? 'bg-blue-500/10 text-blue-500' :
                                b.status === 'ongoing' ? 'bg-cyan-500/10 text-cyan-500' :
                                b.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                'bg-red-500/10 text-red-500'
                              }`}>
                                 {b.status}
                              </span>
                           </td>
                           <td className="py-4 text-right">
                               <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg group-hover:bg-cyan-500 group-hover:text-black">
                                  <ArrowUpRight size={14} />
                               </Button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
             ) : (
               <div className="text-center py-20">
                  <Package size={48} className="mx-auto mb-4 text-gray-600 opacity-20" />
                  <p className="text-gray-500 font-bold mb-4">Anda belum memiliki riwayat rental.</p>
                  <Button onClick={() => window.location.href = '/vehicles'}>Cari Kendaraan Sekarang</Button>
               </div>
             )}
          </GlassCard>
        </div>
      )}

      <AnimatePresence>
        {viewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setViewImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute -top-12 right-0 text-white hover:text-cyan-400 bg-white/10 rounded-full p-2"
                onClick={() => setViewImage(null)}
              >
                <X size={24} />
              </button>
              <img 
                src={viewImage} 
                alt="Document View" 
                className="w-full h-full object-contain rounded-2xl bg-[#0a0a0a] shadow-2xl border border-white/10" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/1a1a1a/cyan?text=Format+Gambar+Tidak+Didukung';
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
