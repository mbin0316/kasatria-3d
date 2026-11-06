import { useState } from 'react'
import { useAuth } from '../auth/context.js'

function Avatar({ user }) {
  const [failed, setFailed] = useState(false)
  if (!user.picture || failed) {
    return (
      <span className="avatar avatar-fallback" aria-hidden="true">
        {user.name.slice(0, 1).toUpperCase()}
      </span>
    )
  }
  return (
    <img
      className="avatar"
      src={user.picture}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  )
}

export default function Header() {
  const { user, signOut } = useAuth()
  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true" />
        <span>
          Kasatria <strong>3D People Table</strong>
        </span>
      </div>
      <div className="account">
        <Avatar user={user} />
        <span className="account-name" title={user.email}>
          {user.name}
        </span>
        <button type="button" className="ghost-btn" onClick={signOut}>
          Sign out
        </button>
      </div>
    </header>
  )
}
