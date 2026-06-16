import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { prisma } from '@/lib/db';
import { failCode, ok } from '@/lib/api';

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const parsed = SignupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return failCode('validation_error', 'A valid email and an 8+ character password are required');
  }
  const { email, password } = parsed.data;

  // Create a confirmed auth user (v1 uses email/password without a separate confirmation step).
  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    const message = createError?.message ?? 'Could not create account';
    if (/already|registered|exists/i.test(message)) {
      return failCode('conflict', 'Email already in use');
    }
    return failCode('validation_error', message);
  }

  // Mirror the auth user into the application User table (id === auth.uid()).
  await prisma.user.upsert({
    where: { id: created.user.id },
    update: { email },
    create: { id: created.user.id, email },
  });

  // Establish a session cookie for the new user.
  const supabase = createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    return failCode('unauthorized', 'Account created but sign-in failed; please sign in');
  }

  return ok({ userId: created.user.id, email }, 201);
}
