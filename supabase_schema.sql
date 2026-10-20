-- ==============================================================================
-- সাভার সার্ভিস হাব (Savar Service Hub) - Supabase সম্পূর্ণ ডাটাবেজ স্কিমা
-- Project ID: qdlserqmaseoyuzmltmp
-- এটি আপনার Supabase ড্যাশবোর্ডের SQL Editor-এ পেস্ট করে 'Run' বাটনে ক্লিক করুন:
-- https://supabase.com/dashboard/project/qdlserqmaseoyuzmltmp/sql
-- ==============================================================================

-- ১. UUID এক্সটেনশন সক্রিয়করণ
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- ২. নাগরিক ও ব্যবহারকারী টেবিল (Citizens Table - মোবাইল নম্বর ভিত্তিক রেজিস্ট্রেশন ও লগইন)
-- ==============================================================================
create table if not exists public.citizens (
  id text primary key,
  mobile text unique not null,
  name text not null,
  area text,
  ward text,
  role text not null default 'citizen',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- ৩. অভিযোগ টেবিল (Complaints Table)
-- ==============================================================================
create table if not exists public.complaints (
  id text primary key,
  tracking_code text,
  title text not null,
  description text not null,
  category text not null,
  area text not null,
  ward text not null,
  exact_location text not null,
  urgency text not null,
  status text not null default 'pending',
  reporter_id text,
  reporter_name text,
  reporter_mobile text,
  image_url text,
  solved_image_url text,
  solution_details text,
  department text,
  assigned_officer text,
  admin_note text,
  rejection_reason text,
  upvotes integer default 0,
  upvoted_by_user_ids text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  approved_at timestamp with time zone,
  solved_at timestamp with time zone,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- ৪. মন্তব্য টেবিল (Comments Table)
-- ==============================================================================
create table if not exists public.comments (
  id text primary key,
  complaint_id text references public.complaints(id) on delete cascade,
  user_name text not null,
  user_area text,
  user_role text not null default 'citizen',
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- ৫. পৌরসভা ওয়ার্ড টেবিল (Wards Table)
-- ==============================================================================
create table if not exists public.wards (
  ward_number text primary key,
  area_name text not null,
  bangla_name text not null,
  zone text,
  description text,
  councilor_name text,
  contact_number text
);

-- ==============================================================================
-- ৬. হিরো স্লাইডার ছবি ও ব্যানার টেবিল (Hero Slides Table)
-- ==============================================================================
create table if not exists public.hero_slides (
  id text primary key,
  title_bn text not null,
  title_en text not null,
  subtitle_bn text,
  subtitle_en text,
  image_url text not null,
  link_url text,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- ৭. রো লেভেল সিকিউরিটি (RLS) ও অনুমতি প্রদান (পাবলিক অ্যাক্সেস পলিসি)
-- ==============================================================================
alter table public.citizens enable row level security;
alter table public.complaints enable row level security;
alter table public.comments enable row level security;
alter table public.wards enable row level security;
alter table public.hero_slides enable row level security;

drop policy if exists "Enable all for citizens" on public.citizens;
create policy "Enable all for citizens" on public.citizens for all using (true) with check (true);

drop policy if exists "Enable all for complaints" on public.complaints;
create policy "Enable all for complaints" on public.complaints for all using (true) with check (true);

drop policy if exists "Enable all for comments" on public.comments;
create policy "Enable all for comments" on public.comments for all using (true) with check (true);

drop policy if exists "Enable all for wards" on public.wards;
create policy "Enable all for wards" on public.wards for all using (true) with check (true);

drop policy if exists "Enable all for hero_slides" on public.hero_slides;
create policy "Enable all for hero_slides" on public.hero_slides for all using (true) with check (true);

-- ==============================================================================
-- ৮. প্রাথমিক ডেমো ডেটা (Initial Seed Data)
-- ==============================================================================

insert into public.citizens (id, mobile, name, area, ward, role)
values 
  ('admin-savar-auth-1', '01938041064', 'সাভার পৌরসভা ও আশুলিয়া জোন (প্রধান অ্যাডমিন)', 'Savar Municipality Core', 'All Wards', 'admin'),
  ('citizen-01712458921', '01712458921', 'তানভীর আহমেদ', 'Genda & Arapara', 'Ward 5', 'citizen')
on conflict (mobile) do update set 
  name = excluded.name, 
  role = excluded.role,
  updated_at = now();

-- হিরো স্লাইডার প্রাথমিক ডেটা
insert into public.hero_slides (id, title_bn, title_en, subtitle_bn, subtitle_en, image_url, display_order, is_active)
values 
  ('slide-1', 'সাভার, বাইপাইল ও আশুলিয়ার নাগরিক সমস্যা সরাসরি পৌরসভাকে জানান', 'Direct Civic Grievance & Rapid Resolution for Savar', 'ভাঙা রাস্তা, ড্রেনেজ বা জলাবদ্ধতার ছবি তুলে সহজে অভিযোগ দাখিল করুন।', 'Report road potholes, clogged drains or waste with photo verification.', 'https://images.unsplash.com/photo-1541888946425-d0fbb18f1f33?auto=format&fit=crop&q=80&w=1200', 1, true),
  ('slide-2', 'ডিজিটাল সাভার গড়ার প্রত্যয়ে স্মার্ট নাগরিক সেবা', 'Smart Civic Service for Digital Savar', 'আপনার এলাকার যেকোনো সমস্যা এখন এক ক্লিকেই পৌর কর্তৃপক্ষের কাছে পৌঁছে যাবে।', 'Submit civic issues instantly and track resolution progress in real time.', 'https://images.unsplash.com/photo-1577495508048-b63587983cef?auto=format&fit=crop&q=80&w=1200', 2, true),
  ('slide-3', 'স্বচ্ছতা ও দ্রুত সমাধান: বিফোর-আফটার আপডেট', 'Transparency & Quick Resolution: Before & After', 'পৌর কর্তৃপক্ষ কর্তৃক কাজ সম্পন্ন হওয়ার পর লাইভ ছবি ও সমাধান প্রতিবেদন দেখুন।', 'Inspect verified completion proofs and work updates from municipal officers.', 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&q=80&w=1200', 3, true)
on conflict (id) do nothing;
