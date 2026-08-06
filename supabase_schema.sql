-- ============================================================
-- SKRIP DATABASE SUPABASE UNTUK TOTOOLS
-- ============================================================
-- Jalankan skrip ini di SQL Editor pada Dashboard Supabase Anda
-- (Project -> SQL Editor -> New Query -> Run)
-- ============================================================

-- 1. TABEL PROFIL PENGGUNA (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Mengaktifkan Row Level Security (RLS) untuk profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pengguna dapat membaca profil sendiri" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Pengguna dapat mengedit profil sendiri" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Pengguna dapat membuat profil sendiri" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Trigger Otomatis untuk membuat Profil saat User mendaftar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. TABEL RIWAYAT GENERASI TOOL (tool_history)
CREATE TABLE IF NOT EXISTS public.tool_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  tool_type TEXT NOT NULL, -- contoh: 'barcode', 'qrcode', 'translate', 'wordcounter', 'collage'
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Mengaktifkan Row Level Security (RLS) untuk tool_history
ALTER TABLE public.tool_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User hanya dapat melihat riwayat miliknya" 
  ON public.tool_history FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "User hanya dapat menyimpan riwayat untuk dirinya" 
  ON public.tool_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User hanya dapat menghapus riwayat miliknya" 
  ON public.tool_history FOR DELETE 
  USING (auth.uid() = user_id);


-- 3. TABEL PENGATURAN USER (user_settings)
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  theme TEXT DEFAULT 'light',
  wallpaper TEXT DEFAULT 'default',
  custom_wallpaper_url TEXT,
  settings_json JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Mengaktifkan Row Level Security (RLS) untuk user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User dapat membaca pengaturan sendiri" 
  ON public.user_settings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "User dapat menyimpan/memperbarui pengaturan sendiri" 
  ON public.user_settings FOR ALL 
  USING (auth.uid() = user_id);
