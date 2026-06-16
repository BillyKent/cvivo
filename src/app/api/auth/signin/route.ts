import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { failCode, ok } from '@/lib/api';

const SigninSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = SigninSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return failCode('validation_error', 'Email and password are required');
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    return failCode('unauthorized', 'Invalid credentials');
  }

  return ok({ userId: data.user.id }, 200);
}
