import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../auth/context.js'
import { demoAuth } from '../config.js'

export default function LoginCard() {
  const { signIn, signInDemo } = useAuth()
  const [error, setError] = useState('')

  const handleSuccess = ({ credential }) => {
    try {
      signIn(credential)
    } catch (err) {
      setError(err.message)
    }
  }

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
              onSuccess={handleSuccess}
              onError={() => setError('Google sign-in failed. Please try again.')}
              theme="filled_blue"
              shape="pill"
              size="large"
              text="signin_with"
              logo_alignment="left"
            />
          )}
        </div>

        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}
      </section>
    </main>
  )
}
