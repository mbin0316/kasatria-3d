import { LAYOUTS, LAYOUT_KEYS } from '../three/layouts.js'

export default function LayoutControls({ value, onChange, disabled }) {
  return (
    <nav className="layout-controls" aria-label="Arrangement">
      {LAYOUT_KEYS.map((key, i) => (
        <button
          key={key}
          type="button"
          className="layout-btn"
          aria-pressed={value === key}
          aria-keyshortcuts={String(i + 1)}
          title={`${LAYOUTS[key].label} (${i + 1})`}
          disabled={disabled}
          onClick={() => onChange(key)}
        >
          {LAYOUTS[key].label}
        </button>
      ))}
    </nav>
  )
}
