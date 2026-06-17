import { NextResponse } from 'next/server';
import type { ApiError, ApiErrorCode } from '@/types/api';
import { createClient } from '@/lib/supabase/server';

/** JSON success response. */
export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/** JSON error response in the canonical `{ error, message }` shape (contracts/api.md). */
export function fail(error: ApiErrorCode, message: string, status: number): NextResponse {
  return NextResponse.json<ApiError>({ error, message }, { status });
}

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  validation_error: 422,
  conflict: 409,
  slug_taken: 409,
  slug_invalid_format: 422,
  slug_reserved_word: 422,
  pdf_generation_failed: 503,
};

/** Shorthand that derives the HTTP status from the error code. */
export function failCode(error: ApiErrorCode, message: string): NextResponse {
  return fail(error, message, STATUS_BY_CODE[error]);
}

/**
 * Resolve the authenticated user id, or null if unauthenticated. Uses getUser(), which
 * revalidates the session against Supabase Auth (do not trust getSession() on the server).
 */
export async function getAuthUserId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Thrown by route handlers to short-circuit with a canonical error response. */
export class ApiException extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
  ) {
    super(message);
  }

  toResponse(): NextResponse {
    return failCode(this.code, this.message);
  }
}

/**
 * Wrap an authenticated handler: resolves the user id (401 if absent) and converts any
 * thrown ApiException into its canonical response. Other errors propagate to Next.
 */
export async function withAuth(
  handler: (userId: string) => Promise<NextResponse>,
): Promise<NextResponse> {
  const userId = await getAuthUserId();
  if (!userId) return failCode('unauthorized', 'Sign in required');
  try {
    return await handler(userId);
  } catch (error) {
    if (error instanceof ApiException) return error.toResponse();
    throw error;
  }
}
