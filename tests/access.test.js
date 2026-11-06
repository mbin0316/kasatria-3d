import { describe, expect, it } from 'vitest'
import { AccessDeniedError, checkAccess, parseAllowList } from '../src/auth/access.js'

const user = (email, extra = {}) => ({ email, email_verified: true, ...extra })

describe('parseAllowList', () => {
  it('splits on commas/spaces/semicolons, lowercases and drops blanks', () => {
    expect(parseAllowList(' Lisa@Kasatria.com, @KASATRIA.com;me@gmail.com  ,, ')).toEqual([
      'lisa@kasatria.com',
      '@kasatria.com',
      'me@gmail.com',
    ])
  })

  it('returns an empty list for empty or missing input', () => {
    expect(parseAllowList('')).toEqual([])
    expect(parseAllowList()).toEqual([])
  })
})

describe('checkAccess', () => {
  it('allows any verified account when the list is empty', () => {
    expect(checkAccess(user('anyone@example.com'), [])).toEqual({ ok: true })
  })

  it('rejects accounts without a verified email', () => {
    expect(checkAccess(user('a@b.com', { email_verified: false }), [])).toEqual({ ok: false, reason: 'unverified' })
    expect(checkAccess({}, [])).toEqual({ ok: false, reason: 'unverified' })
  })

  it('matches exact emails case-insensitively', () => {
    const list = parseAllowList('lisa@kasatria.com')
    expect(checkAccess(user('LISA@kasatria.com'), list).ok).toBe(true)
    expect(checkAccess(user('bob@kasatria.com'), list)).toEqual({ ok: false, reason: 'not-allowed' })
  })

  it('matches whole domains with @domain entries, not look-alike domains', () => {
    const list = parseAllowList('@kasatria.com')
    expect(checkAccess(user('bob@kasatria.com'), list).ok).toBe(true)
    expect(checkAccess(user('bob@notkasatria.com'), list).ok).toBe(false)
    expect(checkAccess(user('bob@kasatria.com.evil.io'), list).ok).toBe(false)
  })
})

describe('AccessDeniedError', () => {
  it('names the rejected account', () => {
    const err = new AccessDeniedError('not-allowed', 'me@gmail.com')
    expect(err.message).toBe("me@gmail.com doesn't have access to this table.")
    expect(err.reason).toBe('not-allowed')
  })
})
