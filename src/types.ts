export type UserRole = 'admin' | 'staff' | 'customer';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export type VehicleType = 'motor' | 'mobil';
export type VehicleStatus = 'available' | 'rented' | 'maintenance';

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  brand: string;
  price_per_day: number;
  status: VehicleStatus;
  image_url: string;
  description: string;
  stock: number;
  total_stock: number;
  lat?: number;
  lng?: number;
}

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'ongoing' | 'completed';

export interface Booking {
  id: string;
  user_id: string; // Keep for guest tracking or generic value
  full_name: string;
  whatsapp_number: string;
  address: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  duration_type: '12h' | '24h' | 'custom';
  delivery_method: 'pickup' | 'delivery';
  delivery_address?: string;
  total_price: number;
  status: BookingStatus;
  document_ktp: string;
  document_sim: string;
  transfer_proof: string;
  created_at: string;
  vehicle?: Vehicle;
  user?: User;
}

export interface Category {
  id: string;
  name: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  method: string;
  created_at: string;
}
