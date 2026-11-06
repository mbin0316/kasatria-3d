import { useAuth } from './auth/context.js'
import { missingConfig } from './config.js'
import LoginCard from './components/LoginCard.jsx'
import Viewer from './components/Viewer.jsx'

export default function App() {
  const { user } = useAuth()

  if (missingConfig.length) {
    return (
      <main className="login-page">
        <section className="login-card" role="alert">
          <h1>Site not configured</h1>
          <p className="login-sub">
            This build is missing: <code>{missingConfig.join(', ')}</code>. Set them as GitHub Actions
            variables and redeploy.
          </p>
        </section>
      </main>
    )
  }

  return user ? <Viewer /> : <LoginCard />
}
