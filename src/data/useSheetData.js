import { useCallback, useEffect, useState } from 'react'
import { config, sampleData } from '../config.js'
import { fetchSheetValues } from './sheets.js'
import { rowsToPeople } from './parse.js'

async function loadValues(signal) {
  // `import.meta.env.DEV` is inlined by Vite, so this branch (and the sample file)
  // is removed from production builds — production always reads the Google Sheet.
  if (import.meta.env.DEV && sampleData) {
    const sample = await import('../dev/sample-values.json')
    return sample.default
  }
  return fetchSheetValues({
    sheetId: config.sheetId,
    range: config.sheetRange,
    apiKey: config.apiKey,
    signal,
  })
}

const NO_PEOPLE = []

/** Loads people from the Google Sheet once `enabled` (i.e. after sign-in). */
export function useSheetData(enabled) {
  const [attempt, setAttempt] = useState(0)
  // Result of the most recent finished request, tagged with the attempt it belongs to.
  const [result, setResult] = useState({ attempt: -1 })

  useEffect(() => {
    if (!enabled) return undefined
    const controller = new AbortController()

    loadValues(controller.signal)
      .then((values) => {
        const people = rowsToPeople(values)
        if (!people.length) throw new Error('The Sheet has no rows to show.')
        setResult({ attempt, status: 'ready', people, error: null, loadedAt: new Date() })
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        setResult({ attempt, status: 'error', people: NO_PEOPLE, error: err.message || String(err) })
      })

    return () => controller.abort()
  }, [enabled, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  const settled = result.attempt === attempt

  return {
    status: !enabled ? 'idle' : settled ? result.status : 'loading',
    people: settled ? result.people : NO_PEOPLE,
    error: settled ? result.error : null,
    loadedAt: settled ? result.loadedAt : null,
    retry,
    source: import.meta.env.DEV && sampleData ? 'sample' : 'sheet',
  }
}
