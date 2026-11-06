import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../auth/context.js'
import { AccessDeniedError } from '../auth/access.js'
import { demoAuth } from '../config.js'

/** Turns a sign-in failure into what the login card shows. */
function describeError(err) {
  if (err instanceof AccessDeniedError) {
    return {
      title: err.reason === 'unverified' ? 'Account not verified' : 'Wrong account',
      message: err.message,
      hint: 'Click "Sign in with Google" and choose a different account.',
    }
  }
  return { title: 'Sign-in failed', message: err?.message || 'Something went wrong. Please try again.' }
}

export default function LoginCard() {
  const { signIn, signInDemo } = useAuth()
  const [error, setError] = useState(null)
  // Remounting the Google button after a rejection drops its "Continue as <rejected account>" state.
  const [buttonKey, setButtonKey] = useState(0)

  const handleSuccess = ({ credential }) => {
    try {
      signIn(credential)
    } catch (err) {
      setError(describeError(err))
      setButtonKey((k) => k + 1)
    }
  }

  const handleGoogleError = () =>
    setError({
      title: 'Sign-in failed',
      message: 'Google sign-in was cancelled or could not complete.',
      hint: 'Allow pop-ups for this site and try again.',
    })

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <h1 id="login-title">Welcome Back</h1>
        <p className="login-sub">Sign in with your Google account to explore the 3D people table.</p>

        <div className="login-action">
          {demoAuth ? (
            <button type="button" className="demo-signin" onClick={signInDemo}>
              Continue as demo user
              <small>dev only · no Google Client ID set</small>
            </button>
          ) : (
            <GoogleLogin
              key={buttonKey}
              onSuccess={handleSuccess}
              onError={handleGoogleError}
              click_listener={() => setError(null)}
              theme="filled_blue"
              shape="pill"
              size="large"
              text="signin_with"
              logo_alignment="left"
            />
          )}
        </div>

        {error && (
          <div className="login-error" role="alert">
            <strong>{error.title}</strong>
            <p>{error.message}</p>
            {error.hint && <p className="login-error-hint">{error.hint}</p>}
          </div>
        )}
      </section>
    </main>
  )
}
