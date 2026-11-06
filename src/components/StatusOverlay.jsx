export default function StatusOverlay({ status, error, onRetry }) {
  if (status === 'loading' || status === 'idle') {
    return (
      <div className="status-overlay" role="status">
        <span className="spinner" aria-hidden="true" />
        Loading data from Google Sheets…
      </div>
    )
  }
  if (status === 'error') {
    return (
      <div className="status-overlay status-error" role="alert">
        <strong>Couldn’t load the data</strong>
        <p>{error}</p>
        <button type="button" className="ghost-btn" onClick={onRetry}>
          Retry
        </button>
      </div>
    )
  }
  return null
}
