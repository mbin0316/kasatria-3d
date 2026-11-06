import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import AuthProvider from './auth/AuthProvider.jsx'
import App from './App.jsx'
import { config } from './config.js'
import './styles/global.css'

const app = (
  <AuthProvider>
    <App />
  </AuthProvider>
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {config.clientId ? <GoogleOAuthProvider clientId={config.clientId}>{app}</GoogleOAuthProvider> : app}
  </StrictMode>,
)
