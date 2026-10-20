-- Supabase Database Schema for Savar Smart City (Savar Service Hub)
-- Project ID: qdlserqmaseoyuzmltmp
-- Run this SQL in your Supabase Dashboard SQL Editor: https://supabase.com/dashboard/project/qdlserqmaseoyuzmltmp/sql

-- 1. Enable UUID extension if not enabled
create extension if not exists "uuid-ossp";

-- 2. Complaints Table
create table if not exists public.complaints (
  id text primary key,
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
  upvotes integer default 0,
  upvoted_by_user_ids text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Comments Table
create table if not exists public.comments (
  id text primary key,
  complaint_id text references public.complaints(id) on delete cascade,
  user_name text not null,
  user_role text not null default 'citizen',
  text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS) and grant access to anon / authenticated roles
alter table public.complaints enable row level security;
alter table public.comments enable row level security;

create policy "Enable read access for all users on complaints" on public.complaints for select using (true);
create policy "Enable insert access for all users on complaints" on public.complaints for insert with check (true);
create policy "Enable update access for all users on complaints" on public.complaints for update using (true);
create policy "Enable delete access for all users on complaints" on public.complaints for delete using (true);

create policy "Enable read access for all users on comments" on public.comments for select using (true);
create policy "Enable insert access for all users on comments" on public.comments for insert with check (true);
create policy "Enable update access for all users on comments" on public.comments for update using (true);
create policy "Enable delete access for all users on comments" on public.comments for delete using (true);

-- 5. Optional: Insert initial sample data into complaints table
insert into public.complaints (id, title, description, category, area, ward, exact_location, urgency, status, reporter_name, reporter_mobile, upvotes, created_at)
values 
  ('comp-init-1', 'সাভার বাজার রোড বড় গর্ত ও জলাবদ্ধতা', 'সাভার বাজার রোডের সোনালী ব্যাংকের সামনে বড় বড় গর্তের সৃষ্টি হয়েছে এবং সামান্য বৃষ্টিতেই জলাবদ্ধতা তৈরি হয়।', 'road', 'Savar Bazar', 'Ward 3', 'Sonali Bank Lane, Savar Bazar', 'high', 'in_progress', 'মো: রফিকুল ইসলাম', '01711-223344', 42, now() - interval '2 days'),
  ('comp-init-2', 'বাইপাইল মোড় এলাকায় ময়লার স্তূপ', 'বাইপাইল মোড়ে ফ্লাইওভারের নিচে দীর্ঘদিন ধরে ময়লা-আবর্জনা জমে দুর্গন্ধ ছড়াচ্ছে। দ্রুত অপসারণ প্রয়োজন।', 'garbage', 'Baipail', 'Ward 1', 'Baipail Flyover Underpass', 'urgent', 'approved', 'নাজমুল হাসান', '01822-556677', 28, now() - interval '1 day')
on conflict (id) do nothing;
