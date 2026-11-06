// Which Google accounts may open the viewer.
//
// VITE_ALLOWED_ACCOUNTS is a comma-separated list of exact emails and/or
// "@domain" entries, e.g. "lisa@kasatria.com, @kasatria.com, me@gmail.com".
// Empty → any Google account with a verified email may sign in.

/** "a@x.com, @Kasatria.com" → ['a@x.com', '@kasatria.com'] */
export function parseAllowList(value = '') {
  return value
    .split(/[\s,;]+/)
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
}

/** Raised when Google sign-in succeeds but the account may not use the app. */
export class AccessDeniedError extends Error {
  constructor(reason, email) {
    super(
      reason === 'unverified'
        ? 'This Google account has no verified email address.'
        : `${email} doesn't have access to this table.`,
    )
    this.name = 'AccessDeniedError'
    this.reason = reason
    this.email = email
  }
}

/**
 * Checks decoded Google ID-token claims against the allow list.
 * @returns {{ ok: true } | { ok: false, reason: 'unverified' | 'not-allowed' }}
 */
export function checkAccess(claims, allowList = []) {
  const email = String(claims?.email ?? '').toLowerCase()
  if (!email || claims?.email_verified === false) return { ok: false, reason: 'unverified' }
  if (allowList.length === 0) return { ok: true }

  const domain = email.slice(email.lastIndexOf('@'))
  const allowed = allowList.some((entry) => (entry.startsWith('@') ? entry === domain : entry === email))
  return allowed ? { ok: true } : { ok: false, reason: 'not-allowed' }
}
