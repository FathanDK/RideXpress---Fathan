import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Vehicle, Booking } from '../types';
import { supabase } from '../lib/supabase';

interface AppState {
  user: User | null;
  vehicles: Vehicle[];
  bookings: Booking[];
  loading: boolean;
  
  setUser: (user: User | null) => void;
  setVehicles: (vehicles: Vehicle[]) => void;
  setBookings: (bookings: Booking[]) => void;
  setLoading: (loading: boolean) => void;
  
  // Logic helpers
  getVehicleById: (id: string) => Vehicle | undefined;
  getUserBookings: (userId: string) => Booking[];
  
  // Mutations
  fetchVehicles: () => Promise<void>;
  fetchBookings: () => Promise<void>;
  addVehicle: (vehicle: Vehicle) => Promise<void>;
  updateVehicle: (vehicle: Vehicle) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  addBooking: (booking: Booking) => Promise<string | undefined>;
  updateBookingStatus: (id: string, status: Booking['status']) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      vehicles: [],
      bookings: [],
      loading: false,

      setUser: (user) => set({ user }),
      setVehicles: (vehicles) => set({ vehicles }),
      setBookings: (bookings) => set({ bookings }),
      setLoading: (loading) => set({ loading }),

      getVehicleById: (id) => get().vehicles.find(v => v.id === id),
      getUserBookings: (userId) => get().bookings.filter(b => b.user_id === userId),

      fetchVehicles: async () => {
        set({ loading: true });
        try {
          const { data, error } = await supabase.from('vehicles').select('*');
          if (!error && data) set({ vehicles: data });
        } finally {
          set({ loading: false });
        }
      },

      fetchBookings: async () => {
        set({ loading: true });
        try {
          const { data, error } = await supabase.from('bookings').select('*, vehicle:vehicles(*)');
          if (!error && data) set({ bookings: data });
        } finally {
          set({ loading: false });
        }
      },

      addVehicle: async (vehicle) => {
        set({ loading: true });
        try {
          const { lat, lng, id, ...vehicleData } = vehicle;
          // Only pass UUID if it exists, otherwise omit id so DB auto-generates
          const payload = id ? { id, ...vehicleData } : vehicleData;
          const { error } = await supabase.from('vehicles').insert(payload);
          if (error) throw error;
          await get().fetchVehicles();
        } finally {
          set({ loading: false });
        }
      },

      updateVehicle: async (updatedVehicle) => {
        set({ loading: true });
        try {
          const { lat, lng, ...vehicleData } = updatedVehicle;
          const { error } = await supabase.from('vehicles').update(vehicleData).eq('id', updatedVehicle.id);
          if (error) {
            console.error('Update vehicle error:', error);
            throw error;
          }
          await get().fetchVehicles();
        } finally {
          set({ loading: false });
        }
      },

      deleteVehicle: async (id) => {
        set({ loading: true });
        try {
          const { error } = await supabase.from('vehicles').delete().eq('id', id);
          if (error) {
            console.error('Delete vehicle error:', error);
            throw error;
          }
          await get().fetchVehicles();
        } finally {
          set({ loading: false });
        }
      },

      addBooking: async (booking) => {
        set({ loading: true });
        const MAX_RETRIES = 3;
        let attempt = 0;

        const performInsert = async (): Promise<string> => {
           attempt++;
           const { id: _id, vehicle: _v, user: _u, ...cleanBooking } = booking as any;
           
           if (!cleanBooking.user_id) throw new Error('Sesi Anda berakhir. Silakan login ulang.');
           if (cleanBooking.total_price) {
             cleanBooking.total_price = Number(cleanBooking.total_price);
           }

           console.log(`[addBooking] Attempt ${attempt}: Ensuring user exists & inserting booking...`);

           // Pre-emptively sync user record
           await supabase.from('users').upsert({
             id: cleanBooking.user_id,
             email: get().user?.email || '',
             role: get().user?.role || 'customer'
           });

           // Small delay to allow DB propagation for very new users
           if (attempt === 1) await new Promise(r => setTimeout(r, 800));

           const { data, error } = await supabase.from('bookings').insert(cleanBooking).select();

           if (error) {
              // If it's a Foreign Key error, we retry if we have attempts left
              if ((error.code === '23503' || error.message?.includes('foreign key')) && attempt < MAX_RETRIES) {
                console.warn('[addBooking] FK Error detected, retrying after delay...');
                await new Promise(r => setTimeout(r, 1500)); // Wait longer for next retry
                return performInsert();
              }
              throw new Error(error.message);
           }

           // Update stock (non-blocking)
           const v = get().vehicles.find(v => v.id === booking.vehicle_id);
           if (v) {
             const currentStock = v.stock ?? v.total_stock ?? 1;
             const newStock = Math.max(0, currentStock - 1);
             supabase.from('vehicles').update({ stock: newStock }).eq('id', booking.vehicle_id).then();
           }

           get().fetchBookings().catch(() => {});
           get().fetchVehicles().catch(() => {});

           return data?.[0]?.id || 'SUCCESS';
        };

        try {
          return await performInsert();
        } catch (error: any) {
          console.error('[addBooking] Final Error after retries:', error);
          throw new Error('Gagal menyimpan pesanan setelah beberapa percobaan. Silakan coba 1 menit lagi atau hubungi admin. Detail: ' + error.message);
        } finally {
          set({ loading: false });
        }
      },

      deleteBooking: async (id) => {
        set({ loading: true });
        try {
          console.log('[deleteBooking] Start deletion for ID:', id);
          const booking = get().bookings.find(b => b.id === id);
          const { error } = await supabase.from('bookings').delete().eq('id', id);
          
          if (error) {
            console.error('[deleteBooking] Supabase Delete Error:', error);
            throw new Error(error.message || 'Gagal menghapus dari database');
          }

          console.log('[deleteBooking] Supabase Delete OK');

          if (booking) {
            // Restore stock if it was active
            if (['pending', 'approved', 'ongoing'].includes(booking.status)) {
              console.log('[deleteBooking] Restoring stock for vehicle:', booking.vehicle_id);
              const { data: vehicle } = await supabase
                .from('vehicles')
                .select('stock, total_stock')
                .eq('id', booking.vehicle_id)
                .single();

              if (vehicle) {
                const newStock = Math.min(vehicle.total_stock || 99, (vehicle.stock || 0) + 1);
                await supabase
                  .from('vehicles')
                  .update({ 
                    stock: newStock,
                    status: 'available'
                  })
                  .eq('id', booking.vehicle_id);
                console.log('[deleteBooking] Stock restored to:', newStock);
              }
            }
          }
          
          console.log('[deleteBooking] Refreshing state...');
          await Promise.all([get().fetchBookings(), get().fetchVehicles()]);
          console.log('[deleteBooking] All done');
          return;
        } catch (error: any) {
          console.error('[deleteBooking] Exception:', error);
          alert('Gagal menghapus pesanan: ' + error.message);
        } finally {
          set({ loading: false });
        }
      },

      updateBookingStatus: async (id, status) => {
        set({ loading: true });
        try {
          const oldBooking = get().bookings.find(b => b.id === id);
          const { error } = await supabase.from('bookings').update({ status }).eq('id', id);
          
          if (!error && oldBooking) {
            // If rejected or completed, return stock if it was reserved
            const isReturning = ['rejected', 'completed'].includes(status);
            const wasReserved = ['pending', 'approved', 'ongoing'].includes(oldBooking.status);

            if (isReturning && wasReserved) {
              const { data: vehicle } = await supabase
                .from('vehicles')
                .select('stock, total_stock')
                .eq('id', oldBooking.vehicle_id)
                .single();

              if (vehicle) {
                const newStock = Math.min(vehicle.total_stock || 99, (vehicle.stock || 0) + 1);
                await supabase
                  .from('vehicles')
                  .update({ 
                    stock: newStock,
                    status: 'available'
                  })
                  .eq('id', oldBooking.vehicle_id);
              }
            }
            
            await Promise.all([get().fetchBookings(), get().fetchVehicles()]);
          }
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'ridexpress-storage',
      version: 2, 
      partialize: (state) => ({ 
        user: state.user,
        vehicles: state.vehicles,
        bookings: state.bookings
      }),
      migrate: (persistedState: any, version: number) => {
        const state = persistedState as AppState;
        if (version < 2) {
          // Robust migration to ensure all vehicles have valid stock fields
          return {
            ...state,
            vehicles: state.vehicles.map(v => {
              const total = v.total_stock ?? 3;
              return {
                ...v,
                total_stock: total,
                stock: v.stock ?? total,
                status: (v.stock ?? total) > 0 ? 'available' : 'rented'
              };
            })
          };
        }
        return persistedState;
      }
    }
  )
);
