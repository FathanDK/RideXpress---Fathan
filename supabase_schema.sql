-- ==============================================================================
-- JALANKAN SEMUA KODE DI BAWAH INI SECARA BERSAMAAN DI SQL EDITOR SUPABASE ANDA
-- WAJIB DIJALANKAN AGAR APLIKASI BISA DIGUNAKAN!
-- ==============================================================================

-- 1. Buat helper function yang dijamin TIDAK recursion (menggunakan security definer)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  -- Menggunakan 'users' table tapi tanpa terpengaruh RLS karena security definer
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'staff')
  );
$$;

-- 2. HAPUS SEMUA POLICIES YANG ADA (bersihkan kebijakan lama yang bentrok)
DO $$ 
DECLARE 
    pol record;
BEGIN 
    FOR pol IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('users', 'vehicles', 'bookings', 'profiles') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- 3. PERBAIKI FOREIGN KEY (Solusi untuk error: bookings_user_id_fkey)
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_user_id_fkey;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- (Opsional) Jika ada profiles table yang nyangkut
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
        ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. BUAT ULANG POLICIES MENGGUNAKAN PUBLIC.IS_ADMIN() YANG AMAN DARI RECURSION

-- Users Policies (HINDARI MEMANGGIL is_admin DI SINI AGAR TIDAK INFINITE RECURSION)
CREATE POLICY "Anyone can view users" ON public.users
  FOR SELECT USING (true);
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can insert users" ON public.users
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own data" ON public.users
  FOR DELETE USING (auth.uid() = id);

-- Vehicles Policies
CREATE POLICY "Anyone can view vehicles" ON public.vehicles
  FOR SELECT USING (true);
CREATE POLICY "Admins can modify vehicles" ON public.vehicles
  FOR ALL USING (public.is_admin());

-- Bookings Policies
CREATE POLICY "Users can view own bookings or admins" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Anyone can insert bookings" ON public.bookings
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own bookings or admins" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Admins can delete bookings" ON public.bookings
  FOR DELETE USING (public.is_admin());

-- 5. Tambahkan kolom yang dibutuhkan
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS stock integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS total_stock integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS lat numeric,
ADD COLUMN IF NOT EXISTS lng numeric;

ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS whatsapp_number text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS duration_type text,
ADD COLUMN IF NOT EXISTS delivery_method text,
ADD COLUMN IF NOT EXISTS delivery_address text,
ADD COLUMN IF NOT EXISTS document_ktp text,
ADD COLUMN IF NOT EXISTS document_sim text,
ADD COLUMN IF NOT EXISTS transfer_proof text;

-- 6. Helper untuk sync user baru otomatis 
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role, created_at)
  VALUES (new.id, new.email, 'customer', new.created_at)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 7. Reload Schema
NOTIFY pgrst, 'reload schema';
