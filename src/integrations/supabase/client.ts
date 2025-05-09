import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ukxxofgjqncwwpjxmonq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVreHhvZmdqcW5jd3dwanhtb25xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NDUzNDEsImV4cCI6MjA2MjAyMTM0MX0.yURGb1OBpIgC8HxiSPo13MbYqEz63xlsaaMnkkkXEyo";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'civicsync-auth-storage'
  }
});

