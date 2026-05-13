import { useLocation } from 'react-router-dom';
import { Mail, Phone, Instagram, Youtube, MapPin } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

export function Footer() {
  const location = useLocation();

  // Sembunyikan footer di Dashboard untuk memaksimalkan ruang layar aplikasi
  if (location.pathname.startsWith('/app')) {
    return null;
  }

  return (
    <footer className="relative z-10 pt-20 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <GlassCard className="p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Kiri: Google Maps */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent flex items-center gap-2">
                <MapPin className="text-cyan-400" /> Lokasi Kami
              </h3>
              <div className="rounded-xl overflow-hidden shadow-lg border border-white/5 h-48 w-full bg-slate-800">
                <iframe
                  title="Google Maps Lokasi Ridexpress"
                  src="https://maps.google.com/maps?q=-6.217105021556169,106.88391211019659&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Tengah: Kontak */}
            <div className="space-y-6 flex flex-col justify-center">
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Hubungi Kami
              </h3>
              <div className="space-y-4">
                <a href="mailto:contact@ridexpress.id" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors">
                    <Mail size={18} />
                  </div>
                  <span>contact@ridexpress.id</span>
                </a>
                <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-green-500/20 group-hover:text-green-400 transition-colors">
                    <Phone size={18} />
                  </div>
                  <span>WhatsApp Center</span>
                </a>
              </div>
            </div>

            {/* Kanan: Sosial Media */}
            <div className="space-y-6 flex flex-col justify-center">
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Sosial Media
              </h3>
              <div className="space-y-4">
                <a href="https://instagram.com/ridexpress.id" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-pink-500/20 group-hover:text-pink-400 transition-colors">
                    <Instagram size={18} />
                  </div>
                  <span>@ridexpress.id</span>
                </a>
                
                <a href="https://tiktok.com/@ridexpress.id" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-slate-500/20 group-hover:text-white transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-music"
                    >
                      <path d="M9 18V5l12-2v13" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="18" cy="16" r="3" />
                    </svg>
                  </div>
                  <span>@ridexpress.id</span>
                </a>

                <a href="https://youtube.com/@ridexpress.id" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-red-500/20 group-hover:text-red-400 transition-colors">
                    <Youtube size={18} />
                  </div>
                  <span>Ridexpress ID</span>
                </a>
              </div>
            </div>

          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-slate-400">
            <p>&copy; {new Date().getFullYear()} Ridexpress ID. All rights reserved.</p>
          </div>
        </GlassCard>
      </div>
    </footer>
  );
}
