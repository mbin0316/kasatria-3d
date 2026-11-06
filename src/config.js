import { parseAllowList } from './auth/access.js'

const env = import.meta.env
const read = (key) => (env[key] ?? '').trim()

export const config = {
  clientId: read('VITE_GOOGLE_CLIENT_ID'),
  apiKey: read('VITE_SHEETS_API_KEY'),
  sheetId: read('VITE_SHEET_ID'),
  sheetRange: read('VITE_SHEET_RANGE') || 'Data!A1:F',
  /** Emails and/or "@domain" entries allowed to sign in; empty = any verified Google account. */
  allowedAccounts: parseAllowList(read('VITE_ALLOWED_ACCOUNTS')),
}

/** Local development only: lets the UI run before Google credentials exist. */
export const demoAuth = import.meta.env.DEV && !config.clientId
export const sampleData = import.meta.env.DEV && (!config.apiKey || !config.sheetId)

/** In a production build every value is required. */
export const missingConfig = import.meta.env.DEV
  ? []
  : [
      ['VITE_GOOGLE_CLIENT_ID', config.clientId],
      ['VITE_SHEETS_API_KEY', config.apiKey],
      ['VITE_SHEET_ID', config.sheetId],
    ]
      .filter(([, value]) => !value)
      .map(([key]) => key)
