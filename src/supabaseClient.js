import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fbmsbbifkqyqmsdqyian.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZibXNiYmlma3F5cW1zZHF5aWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzNjAwMzksImV4cCI6MjEwNzkzNjAzOX0.GUISbwfyekCdloT3_UN9C0VlCUvWKCANchgcqx0jJmc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
