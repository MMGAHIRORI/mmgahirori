import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lpbfsrqnybukbgxcnjzk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwYmZzcnFueWJ1a2JneGNuanprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMTgzMTgsImV4cCI6MjA2OTg5NDMxOH0.8yUY4Ews4-yWrSrHJL8xdj-uKySz1rCaT255BKMzL8c';

const [,, email, password] = process.argv;

if (!email || !password) {
  console.error('Usage: node scripts/create-admin-user.mjs <email> <password>');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

try {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${process.env.PUBLIC_URL || ''}/admin-login` }
  });
  if (error) throw error;
  if (!data.user) throw new Error('Sign up did not return a user');

  // Ensure user_profiles role is set to admin
  const { error: roleError } = await supabase
    .from('user_profiles')
    .update({ role: 'admin', can_read: true, can_write: true, is_disabled: false })
    .eq('user_id', data.user.id);
  if (roleError) throw roleError;

  // Legacy table backfill (best-effort)
  const { error: adminError } = await supabase
    .from('admin_users')
    .insert({ user_id: data.user.id, email, role: 'admin' });
  if (adminError) {
    // Non-fatal
    console.warn('admin_users insert failed:', adminError.message);
  }

  console.log('Admin user created:', { user_id: data.user.id, email });
  console.log('If email confirmation is enabled, verify the email before logging in.');
} catch (e) {
  console.error('Failed to create admin user:', e.message || e);
  process.exit(1);
}


