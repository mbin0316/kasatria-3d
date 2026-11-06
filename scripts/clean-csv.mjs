// Converts the provided "Data Template.csv" (Windows-1252) into a clean UTF-8 CSV
// that can be imported into Google Sheets, and prints a quick validation report.
//
// Usage: node scripts/clean-csv.mjs "<path to Data Template.csv>" [output path]

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { parseCsv, toCsv } from './csv.mjs'
import { rowsToPeople, wealthBand } from '../src/data/parse.js'

const [input, output = 'data/people-clean.csv'] = process.argv.slice(2)
if (!input) {
  console.error('Usage: node scripts/clean-csv.mjs "<input.csv>" [output.csv]')
  process.exit(1)
}

// Windows-1252 and Latin-1 agree on every byte present in this file (only 0xA0).
const text = readFileSync(input).toString('latin1')

const rows = parseCsv(text)
  .map((row) => row.map((cell) => cell.replace(/ /g, ' ').trim()))
  .filter((row) => row.some((cell) => cell !== ''))

mkdirSync(dirname(output), { recursive: true })
writeFileSync(output, toCsv(rows), { encoding: 'utf8' })

const people = rowsToPeople(rows)
const bands = { low: 0, mid: 0, high: 0 }
for (const p of people) bands[wealthBand(p.netWorth)]++

console.log(`Header: ${rows[0].join(' | ')}`)
console.log(`Data rows: ${rows.length - 1}, valid people: ${people.length}`)
console.log(`Bands: red <100K = ${bands.low}, orange 100K-200K = ${bands.mid}, green >=200K = ${bands.high}`)
console.log(`Wrote ${output}`)

// Same rows as the Sheets API would return them — used only by `npm run dev`
// when no Sheet ID / API key is configured yet. Never used in production builds.
const sampleOut = 'src/dev/sample-values.json'
mkdirSync(dirname(sampleOut), { recursive: true })
writeFileSync(sampleOut, JSON.stringify(rows), { encoding: 'utf8' })
console.log(`Wrote ${sampleOut}`)
