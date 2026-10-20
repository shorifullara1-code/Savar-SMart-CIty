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
-- ৬. রো লেভেল সিকিউরিটি (RLS) ও অনুমতি প্রদান (পাবলিক অ্যাক্সেস পলিসি)
-- ==============================================================================
alter table public.citizens enable row level security;
alter table public.complaints enable row level security;
alter table public.comments enable row level security;
alter table public.wards enable row level security;

-- Citizens Policies (নাগরিক প্রোফাইল রিড, ইনসার্ট ও আপডেট)
drop policy if exists "Enable all for citizens" on public.citizens;
create policy "Enable all for citizens" on public.citizens for all using (true) with check (true);

-- Complaints Policies (অভিযোগ দেখা, জমা দেওয়া, আপডেট ও মুছে ফেলা)
drop policy if exists "Enable all for complaints" on public.complaints;
create policy "Enable all for complaints" on public.complaints for all using (true) with check (true);

-- Comments Policies (মন্তব্য দেখা ও পোস্ট করা)
drop policy if exists "Enable all for comments" on public.comments;
create policy "Enable all for comments" on public.comments for all using (true) with check (true);

-- Wards Policies (ওয়ার্ডের তথ্য দেখা ও আপডেট)
drop policy if exists "Enable all for wards" on public.wards;
create policy "Enable all for wards" on public.wards for all using (true) with check (true);

-- ==============================================================================
-- ৭. প্রাথমিক ডেমো ডেটা (Initial Seed Data)
-- ==============================================================================

-- প্রাথমিক পৌরসভা অ্যাডমিন ও নাগরিক
insert into public.citizens (id, mobile, name, area, ward, role)
values 
  ('admin-savar-auth-1', '01938041064', 'সাভার পৌরসভা ও আশুলিয়া জোন (প্রধান অ্যাডমিন)', 'Savar Municipality Core', 'All Wards', 'admin'),
  ('citizen-01712458921', '01712458921', 'তানভীর আহমেদ', 'Genda & Arapara', 'Ward 5', 'citizen'),
  ('citizen-01819332110', '01819332110', 'মো: সাজ্জাদ হোসেন', 'Thana Road & Namabazar', 'Ward 2', 'citizen')
on conflict (mobile) do update set 
  name = excluded.name, 
  role = excluded.role,
  updated_at = now();

-- সাভারের ৯টি ওয়ার্ডের তথ্য
insert into public.wards (ward_number, area_name, bangla_name, zone, description, councilor_name, contact_number)
values
  ('Ward 1', 'Baipail & DEPZ Core', 'ওয়ার্ড ১ (বাইপাইল ও ডিইপিজেড এলাকা)', 'উত্তর জোন', 'শিল্পাঞ্চল ও প্রধান হাইওয়ে সংযোগস্থল', 'আলহাজ্ব মো: কবির হোসেন', '01711-300101'),
  ('Ward 2', 'Thana Road & Namabazar', 'ওয়ার্ড ২ (থানা রোড ও নামাবাজার)', 'কেন্দ্রীয় জোন', 'পুরাতন ঐতিহ্যবাহী বাজার ও প্রশাসনিক এলাকা', 'মো: নজরুল ইসলাম মানিক', '01711-300102'),
  ('Ward 3', 'Savar Bazar & Bazar Road', 'ওয়ার্ড ৩ (সাভার বাজার বাসস্ট্যান্ড ও বাজার রোড)', 'কেন্দ্রীয় জোন', 'প্রধান বাণিজ্যিক কেন্দ্র ও ট্রাফিক হাব', 'খন্দকার শাহিন আহমেদ', '01711-300103'),
  ('Ward 4', 'Radio Colony & Majidpur', 'ওয়ার্ড ৪ (রেডিও কলোনি ও মজিদপুর)', 'দক্ষিণ জোন', 'আবাসিক এলাকা ও শিক্ষাপ্রতিষ্ঠান বেষ্টিত', 'মো: আব্দুল বাতেন', '01711-300104'),
  ('Ward 5', 'Genda & Arapara', 'ওয়ার্ড ৫ (গেন্ডা ও আড়াপাড়া)', 'পূর্ব জোন', 'আবাসিক এলাকা ও হাইওয়ে সংলগ্ন রোড', 'মো: মনিরুজ্জামান মনির', '01711-300105'),
  ('Ward 6', 'Bank Colony & Anandapur', 'ওয়ার্ড ৬ (ব্যাংক কলোনি ও আনন্দপুর)', 'দক্ষিণ-পশ্চিম জোন', 'পরিকল্পিত আবাসিক এলাকা ও ড্রেনেজ সংযোগ', 'মো: হাসান মাহমুদ', '01711-300106'),
  ('Ward 7', 'Ashulia Stand & Beribadh', 'ওয়ার্ড ৭ (আশুলিয়া বাসস্ট্যান্ড ও বেড়িবাঁধ)', 'উত্তর-পূর্ব জোন', 'তুরাগ নদী সংলগ্ন ও লেক ড্রেনেজ বেসিন', 'মো: সেলিম রেজা', '01711-300107'),
  ('Ward 8', 'Kagojipara & Shimultala', 'ওয়ার্ড ৮ (কাগজিপাড়া ও শিমুলতলা)', 'পশ্চিম জোন', 'আবাসিক ও ছোট ব্যবসা প্রতিষ্ঠান এলাকা', 'মো: সোহেল রানা', '01711-300108'),
  ('Ward 9', 'Dendabor & Polli Bidyut', 'ওয়ার্ড ৯ (দেন্ডাবর ও পল্লী বিদ্যুৎ)', 'উত্তর-পশ্চিম জোন', 'উচ্চ ঘনবসতিপূর্ণ ও ইপিজেড সংলগ্ন এলাকা', 'মো: আব্দুর রশিদ', '01711-300109')
on conflict (ward_number) do nothing;

-- প্রাথমিক অভিযোগ ডেটা
insert into public.complaints (
  id, tracking_code, title, description, category, area, ward, exact_location, urgency, status, reporter_name, reporter_mobile, upvotes, created_at
)
values 
  ('comp-init-1', 'SAV-8421', 'সাভার বাজার রোড বড় গর্ত ও জলাবদ্ধতা', 'roads', 'Savar Bazar & Bazar Road', 'Ward 3', 'সোনালী ব্যাংক মোড়, বাজার রোড', 'high', 'in_progress', 'তানভীর আহমেদ', '01712458921', 42, now() - interval '2 days'),
  ('comp-init-2', 'SAV-3190', 'বাইপাইল মোড় এলাকায় ময়লার স্তূপ ও ড্রেন বন্ধ', 'waste', 'Baipail & DEPZ Core', 'Ward 1', 'বাইপাইল ফ্লাইওভারের পশ্চিম কোণ', 'emergency', 'approved', 'মো: সাজ্জাদ হোসেন', '01819332110', 28, now() - interval '1 day'),
  ('comp-init-3', 'SAV-7652', 'রেডিও কলোনি মেইন রোডের বাতি অকেজো', 'streetlights', 'Radio Colony & Majidpur', 'Ward 4', 'রেডিও কলোনি রোড ৩, ট্রান্সফরমার সংলগ্ন', 'medium', 'solved', 'তানভীর আহমেদ', '01712458921', 19, now() - interval '4 days')
on conflict (id) do nothing;
