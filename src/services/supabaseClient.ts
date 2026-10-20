import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qdlserqmaseoyuzmltmp.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkbHNlcnFtYXNlb3l1em1sdG1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0NjY3ODUsImV4cCI6MjEwODA0Mjc4NX0.QLLk8uuUf2pMxJOO-oHlrMY4bRMPqzM3b9Ck3sNAyDU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
