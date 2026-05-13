import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../lib/utils';
import { Users, Fuel, Gauge, Calendar, ShieldCheck, MapPin, ChevronLeft } from 'lucide-react';
import React, { useState } from 'react';
import { differenceInDays } from 'date-fns';
import { motion } from 'motion/react';

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getVehicleById, user, addBooking, loading } = useStore();
  const vehicle = getVehicleById(id || '');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    whatsapp: '',
    address: '',
    startDate: '',
    endDate: '',
    durationType: '24h' as '12h' | '24h' | 'custom',
    deliveryMethod: 'pickup' as 'pickup' | 'delivery',
    deliveryAddress: '',
  });

  const [files, setFiles] = useState({
    ktp: null as File | null,
    sim: null as File | null,
    transfer: null as File | null,
  });

  if (!vehicle) return <div className="pt-32 text-center text-red-400 font-bold">Kendaraan tidak ditemukan.</div>;

  const calculateDays = () => {
    if (formData.durationType === '12h') return 0.5;
    if (formData.durationType === '24h') return 1;
    if (formData.startDate && formData.endDate) {
      const d = differenceInDays(new Date(formData.endDate), new Date(formData.startDate));
      return Math.max(1, d);
    }
    return 0;
  };

  const days = calculateDays();
  const deliveryFee = formData.deliveryMethod === 'delivery' ? 50000 : 0;
  const totalPrice = (days * vehicle.price_per_day) + deliveryFee;

  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setErrorMsg('Silakan login terlebih dahulu untuk melakukan penyewaan.');
      navigate('/login');
      return;
    }

    if (days <= 0 && formData.durationType === 'custom') {
      setErrorMsg('Pilih rentang tanggal yang valid.');
      return;
    }

    if (vehicle.stock <= 0) {
      setErrorMsg('Maaf, kendaraan ini sedang tidak tersedia (habis stok).');
      return;
    }

    if (!files.ktp || !files.sim || !files.transfer) {
      setErrorMsg('Mohon lengkapi semua dokumen (KTP, SIM, dan Bukti Transfer).');
      return;
    }

    try {
      console.log('[VehicleDetail] Starting booking flow...');
      setErrorMsg('');
      setSubmitting(true);

      const ktpBase64 = await toBase64(files.ktp);
      const simBase64 = await toBase64(files.sim);
      const transferBase64 = await toBase64(files.transfer);

      const newBooking = {
        user_id: user.id,
        full_name: formData.fullName,
        whatsapp_number: formData.whatsapp,
        address: formData.address,
        vehicle_id: vehicle.id,
        start_date: formData.startDate || new Date().toISOString().split('T')[0],
        end_date: formData.durationType === 'custom' ? formData.endDate : (formData.startDate || new Date().toISOString().split('T')[0]),
        duration_type: formData.durationType,
        delivery_method: formData.deliveryMethod,
        delivery_address: formData.deliveryMethod === 'delivery' ? formData.deliveryAddress : undefined,
        total_price: totalPrice,
        status: 'pending' as const,
        document_ktp: ktpBase64,
        document_sim: simBase64,
        transfer_proof: transferBase64,
        created_at: new Date().toISOString()
      };
      
      const res = await addBooking(newBooking as any);
      
      if (res) {
        console.log('[VehicleDetail] Success, navigating...');
        navigate('/app', { state: { bookingSuccess: true } });
      }
    } catch (err: any) {
      console.error('[VehicleDetail] Caught Error:', err);
      const msg = err.message || 'Terjadi kesalahan tidak terduga';
      if (msg.includes('memakan waktu terlalu lama')) {
        setErrorMsg(msg);
        alert(msg);
      } else {
        setErrorMsg(msg);
        alert("GAGAL: " + msg);
      }
    } finally {
      console.log('[VehicleDetail] Flow complete.');
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-32 px-6 max-w-7xl mx-auto">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-8 p-0 hover:bg-transparent text-gray-400 hover:text-white flex items-center gap-2"
      >
        <ChevronLeft size={20} /> Kembali ke Armada
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Side: Images & Info */}
        <div className="lg:col-span-7 space-y-8">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="aspect-video rounded-3xl overflow-hidden glass-panel p-2"
          >
            <img 
              src={vehicle.image_url} 
              alt={vehicle.name} 
              className="w-full h-full object-cover rounded-2xl"
            />
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[
               { icon: <Users size={18} />, label: 'Kapasitas', value: vehicle.type === 'mobil' ? '5 Orang' : '1-2 Orang' },
               { icon: <Fuel size={18} />, label: 'Bahan Bakar', value: 'Penuh (Full)' },
               { icon: <Gauge size={18} />, label: 'Kondisi', value: 'Prima' },
               { icon: <MapPin size={18} />, label: 'Lokasi', value: 'Jakarta' }
             ].map((spec, i) => (
                <GlassCard key={i} className="p-4 text-center border-white/5" hover={false}>
                   <div className="text-cyan-400 flex justify-center mb-2">{spec.icon}</div>
                   <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">{spec.label}</div>
                   <div className="text-sm font-bold">{spec.value}</div>
                </GlassCard>
             ))}
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold">{vehicle.name} <span className="text-xl font-normal text-gray-500 ml-2">by {vehicle.brand}</span></h1>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase">{vehicle.type}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${vehicle.stock > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {vehicle.stock > 0 ? 'Tersedia' : 'Habis'}
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed text-lg">
              {vehicle.description} Nikmati kenyamanan berkendara dengan armada premium kami. 
              Kendaraan selalu dalam kondisi bersih dan terawat untuk menjamin perjalanan Anda yang berkesan.
              Sudah termasuk asuransi dasar dan layanan bantuan darurat 24 jam.
            </p>
          </div>
        </div>

        {/* Right Side: Booking Panel */}
        <aside className="lg:col-span-5">
           <GlassCard className="sticky top-32 p-8 border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.1)]" hover={false}>
              <div className="flex items-end justify-between mb-8">
                  <div>
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Harga Sewa</h3>
                    <div className="text-3xl font-bold">{formatCurrency(vehicle.price_per_day)} <span className="text-sm font-normal opacity-50">/ hari</span></div>
                 </div>
                 <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${vehicle.stock > 0 ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                    <ShieldCheck size={12} /> {vehicle.stock > 0 ? `${vehicle.stock} Unit Tersedia` : 'Stok Habis'}
                 </div>
              </div>

              <form onSubmit={handleBooking} className="space-y-6">
                 {/* Personal Info */}
                 <div className="space-y-4">
                    <label className="text-[10px] uppercase font-black tracking-widest text-cyan-400 ml-1 block">
                       Informasi Pribadi
                    </label>
                    <input 
                      type="text" 
                      placeholder="Nama Lengkap Sesuai KTP"
                      required
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                    <input 
                      type="tel" 
                      placeholder="Nomor WhatsApp (Aktif)"
                      required
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                    />
                    <textarea 
                      placeholder="Alamat Tinggal Sekarang"
                      required
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm min-h-[80px]"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                 </div>

                 {/* Rental Config */}
                 <div className="space-y-4">
                    <label className="text-[10px] uppercase font-black tracking-widest text-cyan-400 ml-1 block">
                       Opsi Rental
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                       {(['12h', '24h', 'custom'] as const).map((type) => (
                         <button
                           key={type}
                           type="button"
                           onClick={() => setFormData({...formData, durationType: type})}
                           className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                             formData.durationType === type 
                             ? 'bg-cyan-500 text-black border-cyan-500' 
                             : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
                           }`}
                         >
                           {type === '12h' ? '12 Jam' : type === '24h' ? '24 Jam' : 'Harian'}
                         </button>
                       ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <span className="text-[10px] text-gray-500 ml-2">Tanggal Mulai</span>
                          <input 
                            type="date" 
                            required
                            className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl focus:ring-1 focus:ring-cyan-500 outline-none text-xs"
                            value={formData.startDate}
                            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                          />
                       </div>
                       {formData.durationType === 'custom' && (
                         <div className="space-y-1">
                            <span className="text-[10px] text-gray-500 ml-2">Tanggal Selesai</span>
                            <input 
                              type="date" 
                              required
                              className="w-full bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl focus:ring-1 focus:ring-cyan-500 outline-none text-xs"
                              value={formData.endDate}
                              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                            />
                         </div>
                       )}
                    </div>

                    <div className="space-y-2">
                       <span className="text-[10px] text-gray-500 ml-2 block">Metode Pengambilan</span>
                       <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, deliveryMethod: 'pickup'})}
                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                              formData.deliveryMethod === 'pickup' 
                              ? 'bg-cyan-500 text-black border-cyan-500' 
                              : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
                            }`}
                          >
                            Ambil Sendiri
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, deliveryMethod: 'delivery'})}
                            className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                              formData.deliveryMethod === 'delivery' 
                              ? 'bg-cyan-500 text-black border-cyan-500' 
                              : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
                            }`}
                          >
                            Antar (+50rb)
                          </button>
                       </div>
                    </div>

                    {formData.deliveryMethod === 'delivery' && (
                      <textarea 
                        placeholder="Alamat Pengantaran Kendaraan"
                        required
                        className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm min-h-[60px]"
                        value={formData.deliveryAddress}
                        onChange={(e) => setFormData({...formData, deliveryAddress: e.target.value})}
                      />
                    )}
                 </div>

                 {/* Documents */}
                 <div className="space-y-4">
                    <label className="text-[10px] uppercase font-black tracking-widest text-cyan-400 ml-1 block">
                       Unggah Dokumen & Bukti (PDF/JPG)
                    </label>
                    <div className="space-y-2">
                       {[
                         { id: 'ktp', label: 'Foto KTP', file: files.ktp },
                         { id: 'sim', label: 'Foto SIM', file: files.sim },
                         { id: 'transfer', label: 'Bukti Transfer DP/Lunas', file: files.transfer }
                       ].map((doc) => (
                         <div key={doc.id} className="relative cursor-pointer group">
                            <input 
                              type="file" 
                              required
                              accept="image/*"
                              onChange={(e) => setFiles({...files, [doc.id]: e.target.files?.[0] || null})}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className={`bg-white/5 border border-dashed px-4 py-3 rounded-xl text-xs flex items-center justify-between transition-colors ${doc.file ? 'border-cyan-500 text-cyan-400' : 'border-white/10 text-gray-500 group-hover:border-white/30'}`}>
                               <span>{doc.file ? doc.file.name : doc.label}</span>
                               <div className={`${doc.file ? 'bg-cyan-500 text-black' : 'bg-white/5'} px-3 py-1 rounded-lg font-bold text-[10px]`}>
                                  {doc.file ? 'Terunggah' : 'Pilih File'}
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* Pricing Summary */}
                 <motion.div 
                   className="bg-cyan-500/5 rounded-2xl p-5 space-y-3 border border-cyan-500/20 shadow-inner"
                 >
                    <div className="flex justify-between text-xs font-bold">
                       <span className="text-gray-400">Durasi Sewa</span>
                       <span className="text-white">{days} Hari</span>
                    </div>
                    {formData.deliveryMethod === 'delivery' && (
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-gray-400">Biaya Antar</span>
                        <span className="text-white">{formatCurrency(50000)}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-white/10 flex justify-between font-black text-xl text-cyan-400">
                       <span>Total</span>
                       <span>{formatCurrency(totalPrice)}</span>
                    </div>
                 </motion.div>

                 <Button type="submit" size="lg" className="w-full py-5 rounded-2xl font-black text-lg shadow-xl shadow-cyan-500/20" disabled={vehicle.stock <= 0 || submitting}>
                    {submitting ? 'MEMPROSES...' : vehicle.stock > 0 ? 'KONFIRMASI SEWA' : 'STOK HABIS'}
                 </Button>

                 {errorMsg && (
                   <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium text-center">
                     {errorMsg}
                   </div>
                 )}

                 <div className="text-center">
                    <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest leading-relaxed">
                       Admin akan memverifikasi dokumen Anda. <br />
                       Kami akan menghubungi via WhatsApp setelah disetujui.
                    </p>
                 </div>
              </form>
           </GlassCard>
        </aside>
      </div>
    </div>
  );
}
