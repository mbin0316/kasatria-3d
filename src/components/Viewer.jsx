import { useEffect, useState } from 'react'
import { useAuth } from '../auth/context.js'
import { useSheetData } from '../data/useSheetData.js'
import { LAYOUT_KEYS } from '../three/layouts.js'
import Header from './Header.jsx'
import LayoutControls from './LayoutControls.jsx'
import Legend from './Legend.jsx'
import PeriodicTable3D from './PeriodicTable3D.jsx'
import StatusOverlay from './StatusOverlay.jsx'

export default function Viewer() {
  const { user } = useAuth()
  const { status, people, error, loadedAt, retry, source } = useSheetData(Boolean(user))
  const [layout, setLayout] = useState('table')

  // Keyboard shortcuts 1–4 switch layouts.
  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.target.closest?.('input, textarea')) return
      const key = LAYOUT_KEYS[Number(e.key) - 1]
      if (key) setLayout(key)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="viewer">
      <Header />
      {status === 'ready' && <PeriodicTable3D people={people} layout={layout} />}
      <StatusOverlay status={status} error={error} onRetry={retry} />
      <div className="viewer-footer">
        <LayoutControls value={layout} onChange={setLayout} disabled={status !== 'ready'} />
        <Legend />
      </div>
      {status === 'ready' && (
        <p className="data-note">
          {people.length} people · {source === 'sample' ? 'local sample data (dev)' : 'live from Google Sheets'} ·
          loaded {loadedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  )
}
