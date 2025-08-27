import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lpbfsrqnybukbgxcnjzk.supabase.co';
const { SUPABASE_SERVICE_ROLE_KEY } = process.env;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY env var. Set it before running.');
  console.error('Example (PowerShell): $env:SUPABASE_SERVICE_ROLE_KEY = "<your_service_role_key>"');
  process.exit(1);
}

const [,, email, password] = process.argv;

if (!email) {
  console.error('Usage: node scripts/promote-to-admin.mjs <email> [password_if_creating]');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

try {
  // Ensure user exists (by profile email), otherwise create a new auth user
  let userId;
  const { data: existingProfile, error: profileErr } = await supabase
    .from('user_profiles')
    .select('user_id, email')
    .eq('email', email)
    .maybeSingle();

  if (profileErr) throw profileErr;

  if (!existingProfile) {
    if (!password) {
      console.error('User does not exist. Provide a password to create the user.');
      console.error('Usage: node scripts/promote-to-admin.mjs <email> <password>');
      process.exit(1);
    }
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createErr) throw createErr;
    if (!created.user) throw new Error('Auth user creation returned no user');
    userId = created.user.id;
  } else {
    userId = existingProfile.user_id;
  }

  // Promote to admin
  const { data: updated, error: updateErr } = await supabase
    .from('user_profiles')
    .update({ role: 'admin', can_write: true, is_disabled: false })
    .eq('user_id', userId)
    .select('user_id, email, role')
    .single();
  if (updateErr) throw updateErr;

  // Best-effort legacy table insert
  const { error: adminUsersErr } = await supabase
    .from('admin_users')
    .insert({ user_id: userId, email, role: 'admin' });
  if (adminUsersErr) {
    console.warn('admin_users insert failed (non-fatal):', adminUsersErr.message);
  }

  console.log('Promoted to admin:', updated);
  console.log('You can now log in at /admin-login');
} catch (e) {
  console.error('Failed to promote/create admin:', e?.message || e);
  process.exit(1);
}


