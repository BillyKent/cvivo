// Vanity slug rules (FR-008a, Clarifications 2026-06-16): lowercase letters, digits, and
// hyphens; 3–50 characters; no leading or trailing hyphen; not a reserved platform word.

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/;

/** Reserved words that collide with platform routes — never claimable as a slug. */
export const RESERVED_SLUGS = [
  'admin',
  'api',
  'login',
  'signup',
  'signin',
  'signout',
  'dashboard',
  'cv',
  'cvs',
  'account',
  'export',
  'public',
  'static',
  'assets',
  '_next',
  'favicon',
] as const;

const RESERVED = new Set<string>(RESERVED_SLUGS);

export type SlugErrorCode = 'slug_invalid_format' | 'slug_reserved_word';

export type SlugCheck =
  | { ok: true }
  | { ok: false; code: SlugErrorCode; message: string };

export function validateSlug(slug: string): SlugCheck {
  if (!SLUG_RE.test(slug)) {
    return {
      ok: false,
      code: 'slug_invalid_format',
      message:
        'Use 3–50 lowercase letters, numbers, and hyphens — no spaces, and no hyphen at the start or end.',
    };
  }
  if (RESERVED.has(slug)) {
    return {
      ok: false,
      code: 'slug_reserved_word',
      message: 'That word is reserved. Please choose another.',
    };
  }
  return { ok: true };
}
