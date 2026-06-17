import { validateSlug, RESERVED_SLUGS } from '@/lib/slug';

describe('validateSlug', () => {
  it('accepts well-formed slugs', () => {
    for (const slug of ['jane-doe', 'ab3', 'a-b-c', 'john2024', 'x'.repeat(50)]) {
      expect(validateSlug(slug).ok).toBe(true);
    }
  });

  it('rejects slugs that are too short or too long', () => {
    expect(validateSlug('ab')).toMatchObject({ ok: false, code: 'slug_invalid_format' });
    expect(validateSlug('x'.repeat(51))).toMatchObject({ ok: false, code: 'slug_invalid_format' });
  });

  it('rejects leading/trailing hyphens', () => {
    expect(validateSlug('-jane')).toMatchObject({ ok: false, code: 'slug_invalid_format' });
    expect(validateSlug('jane-')).toMatchObject({ ok: false, code: 'slug_invalid_format' });
  });

  it('rejects uppercase, spaces, and disallowed characters', () => {
    for (const slug of ['Jane', 'jane doe', 'jane_doe', 'jané', 'jane.doe']) {
      expect(validateSlug(slug)).toMatchObject({ ok: false, code: 'slug_invalid_format' });
    }
  });

  it('rejects reserved platform words', () => {
    // Words that are format-valid but reserved (3+ chars, no underscore).
    for (const slug of ['admin', 'api', 'dashboard', 'signin', 'account']) {
      expect(validateSlug(slug)).toMatchObject({ ok: false, code: 'slug_reserved_word' });
    }
    // Every reserved word is itself format-valid, so it must be caught by the blocklist.
    for (const slug of RESERVED_SLUGS) {
      expect(validateSlug(slug).ok).toBe(false);
    }
  });
});
