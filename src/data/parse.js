// Turns raw Google Sheets rows (header row + data rows) into typed people records.

export const LOW_MAX = 100_000 // below this → red
export const MID_MAX = 200_000 // below this → orange, at or above → green

/** "$251,260.80" | 251260.8 → 251260.8 ; anything unparseable → NaN */
export function parseNetWorth(value) {
  if (typeof value === 'number') return value
  if (value == null) return NaN
  const cleaned = String(value).replace(/[$,\s ]/g, '')
  if (cleaned === '') return NaN
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : NaN
}

/** 'low' (< $100K, red) | 'mid' ($100K–$200K, orange) | 'high' (≥ $200K, green) */
export function wealthBand(netWorth) {
  if (netWorth < LOW_MAX) return 'low'
  if (netWorth < MID_MAX) return 'mid'
  return 'high'
}

const normalise = (h) => String(h ?? '').replace(/ /g, ' ').trim().toLowerCase().replace(/\s+/g, ' ')

const COLUMNS = {
  name: 'name',
  photo: 'photo',
  age: 'age',
  country: 'country',
  interest: 'interest',
  netWorth: 'net worth',
}

/**
 * @param {Array<Array<string|number>>} values  rows from the Sheets API (first row = header)
 * @returns {Array<{id:number,name:string,photo:string,age:number,country:string,interest:string,netWorth:number,band:string}>}
 */
export function rowsToPeople(values) {
  if (!Array.isArray(values) || values.length < 2) return []

  const header = values[0].map(normalise)
  const index = {}
  for (const [key, label] of Object.entries(COLUMNS)) {
    const i = header.indexOf(label)
    if (i === -1) throw new Error(`Sheet is missing the "${label}" column`)
    index[key] = i
  }

  const text = (row, key) => String(row[index[key]] ?? '').replace(/ /g, ' ').trim()
  const people = []

  values.slice(1).forEach((row, r) => {
    const name = text(row, 'name')
    if (!name) return
    const netWorth = parseNetWorth(row[index.netWorth])
    if (Number.isNaN(netWorth)) {
      console.warn(`Row ${r + 2}: invalid net worth for "${name}", skipped`)
      return
    }
    people.push({
      id: people.length,
      name,
      photo: text(row, 'photo'),
      age: Number(text(row, 'age')) || null,
      country: text(row, 'country'),
      interest: text(row, 'interest'),
      netWorth,
      band: wealthBand(netWorth),
    })
  })

  return people
}

export const formatMoney = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
