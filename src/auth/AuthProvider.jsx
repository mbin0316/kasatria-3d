import { useCallback, useMemo, useState } from 'react'
import { googleLogout } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'
import { AuthContext } from './context.js'
import { demoAuth } from '../config.js'

const STORAGE_KEY = 'kasatria.credential'
const DEMO = 'demo'
const DEMO_USER = { id: 'demo', name: 'Demo User', email: 'demo@localhost', picture: '' }

/** Google ID token (JWT) → user, or null when it is malformed or expired. */
function userFromCredential(credential) {
  try {
    const claims = jwtDecode(credential)
    if (!claims.exp || claims.exp * 1000 <= Date.now()) return null
    return {
      id: claims.sub,
      name: claims.name || claims.email,
      email: claims.email,
      picture: claims.picture || '',
    }
  } catch {
    return null
  }
}

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
  return userFromCredential(saved)
}

// Note: this is a client-side gate for a static site. The ID token is decoded, not
// verified — that would need a backend. The Sheet data itself is link-viewable.
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(restoreUser)

  const signIn = useCallback((credential) => {
    const next = userFromCredential(credential)
    if (!next) throw new Error('Google returned an invalid or expired sign-in token.')
    storage.set(credential)
    setUser(next)
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
