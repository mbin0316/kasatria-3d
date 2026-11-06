import { useCallback, useMemo, useState } from 'react'
import { googleLogout } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { AuthContext } from './context.js'
import { config, demoAuth } from '../config.js'
import { AccessDeniedError, checkAccess } from './access.js'

const STORAGE_KEY = 'kasatria.credential'
const DEMO = 'demo'
const DEMO_USER = { id: 'demo', name: 'Demo User', email: 'demo@localhost', picture: '' }

/** Google ID token (JWT) → claims, or null when it is malformed or expired. */
function decodeCredential(credential) {
  try {
    const claims = jwtDecode(credential)
    if (!claims.exp || claims.exp * 1000 <= Date.now()) return null
    return claims
  } catch {
    return null
  }
}

const toUser = (claims) => ({
  id: claims.sub,
  name: claims.name || claims.email,
  email: claims.email,
  picture: claims.picture || '',
})

const storage = {
  get() {
    try {
      return sessionStorage.getItem(STORAGE_KEY)
    } catch {
      return null
    }
  },
  set(value) {
    try {
      sessionStorage.setItem(STORAGE_KEY, value)
    } catch {
      /* private mode etc. — session simply won't survive a refresh */
    }
  },
  clear() {
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  },
}

function restoreUser() {
  const saved = storage.get()
  if (!saved) return null
  if (saved === DEMO) return demoAuth ? DEMO_USER : null
  const claims = decodeCredential(saved)
  // Drop a saved session that has expired or is no longer on the allow list.
  if (!claims || !checkAccess(claims, config.allowedAccounts).ok) {
    storage.clear()
    return null
  }
  return toUser(claims)
}

// Note: this is a client-side gate for a static site. The ID token is decoded, not
// verified — that would need a backend. The Sheet data itself is link-viewable.
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(restoreUser)

  const signIn = useCallback((credential) => {
    const claims = decodeCredential(credential)
    if (!claims) throw new Error('Google returned an invalid or expired sign-in token. Please try again.')

    const access = checkAccess(claims, config.allowedAccounts)
    if (!access.ok) {
      // Forget the rejected account so Google doesn't silently pick it again.
      googleLogout()
      storage.clear()
      throw new AccessDeniedError(access.reason, claims.email)
    }

    storage.set(credential)
    setUser(toUser(claims))
  }, [])

  const signInDemo = useCallback(() => {
    if (!demoAuth) return
    storage.set(DEMO)
    setUser(DEMO_USER)
  }, [])

  const signOut = useCallback(() => {
    if (!demoAuth) googleLogout()
    storage.clear()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, signIn, signInDemo, signOut }), [user, signIn, signInDemo, signOut])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
