import { createClient } from '@supabase/supabase-js';

/**
 * Privileged Supabase client using the service-role key. Bypasses RLS — use ONLY in
 * trusted server code for operations the user cannot perform themselves (e.g. deleting
 * the Supabase Auth user during account deletion). Never import into client code.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
