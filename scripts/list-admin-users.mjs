import { createClient } from '@supabase/supabase-js';

// Using the same URL and anon key as the app client
const SUPABASE_URL = "https://lpbfsrqnybukbgxcnjzk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYmZzcnFueWJ1a2JneGNuanprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTgzMTgsImV4cCI6MjA2OTg5NDMxOH0.8yUY4Ews4-yWrSrHJL8xdj-uKySz1rCaT255BKMzL8c";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

try {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admin_users:', error.message);
    process.exit(1);
  }

  console.log(JSON.stringify(data || [], null, 2));
} catch (err) {
  console.error('Unexpected error:', err);
  process.exit(1);
}


