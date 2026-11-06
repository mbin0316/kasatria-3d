// Reads a range from a Google Sheet via the Sheets API v4 using an API key.
// The Sheet must be shared as "Anyone with the link → Viewer".

function explain(status, detail) {
  switch (status) {
    case 400:
      return `The Sheet range is invalid — check the tab name in VITE_SHEET_RANGE. ${detail}`
    case 403:
      return `Access denied. Make sure the Sheet is shared as "Anyone with the link", the Sheets API is enabled, and the API key allows this website. ${detail}`
    case 404:
      return `Sheet not found — check VITE_SHEET_ID. ${detail}`
    case 429:
      return 'Too many requests to Google Sheets. Wait a moment and retry.'
    default:
      return `Google Sheets request failed (${status}). ${detail}`
  }
}

/** @returns {Promise<Array<Array<string>>>} rows including the header row */
export async function fetchSheetValues({ sheetId, range, apiKey, signal }) {
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}` +
    `/values/${encodeURIComponent(range)}?key=${encodeURIComponent(apiKey)}`

  let res
  try {
    // Send the full page URL as Referer (browsers default to origin-only for
    // cross-origin requests), so a path-specific API key website restriction
    // such as https://<user>.github.io/<repo>/* also matches.
    res = await fetch(url, { signal, referrerPolicy: 'no-referrer-when-downgrade' })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new Error('Could not reach Google Sheets. Check your internet connection.')
  }

  if (!res.ok) {
    let detail = ''
    try {
      detail = (await res.json())?.error?.message ?? ''
    } catch {
      /* non-JSON error body */
    }
    throw new Error(explain(res.status, detail).trim())
  }

  const body = await res.json()
  return body.values ?? []
}
