import { describe, expect, it, vi } from 'vitest'
import { parseNetWorth, rowsToPeople, wealthBand } from '../src/data/parse.js'

describe('parseNetWorth', () => {
  it('parses currency strings from the Sheet', () => {
    expect(parseNetWorth('$251,260.80')).toBe(251260.8)
    expect(parseNetWorth(' $60,393.60 ')).toBe(60393.6)
    expect(parseNetWorth('100000')).toBe(100000)
  })
  it('passes numbers through (UNFORMATTED_VALUE responses)', () => {
    expect(parseNetWorth(212140.8)).toBe(212140.8)
  })
  it('returns NaN for unparseable values', () => {
    expect(parseNetWorth('')).toBeNaN()
    expect(parseNetWorth(undefined)).toBeNaN()
    expect(parseNetWorth('n/a')).toBeNaN()
  })
})

describe('wealthBand', () => {
  it.each([
    [0, 'low'],
    [99_999.99, 'low'],
    [100_000, 'mid'],
    [199_999.99, 'mid'],
    [200_000, 'high'],
    [369_652.8, 'high'],
  ])('%d → %s', (value, band) => {
    expect(wealthBand(value)).toBe(band)
  })
})

describe('rowsToPeople', () => {
  const header = ['Name', 'Photo', 'Age', 'Country', 'Interest', ' Net Worth ']

  it('maps columns by header name, trimming spaces', () => {
    const people = rowsToPeople([
      header,
      ['Lee Siew Suan', 'https://x/019.jpg', '25', 'CN', 'Writing', '$251,260.80'],
    ])
    expect(people).toEqual([
      {
        id: 0,
        name: 'Lee Siew Suan',
        photo: 'https://x/019.jpg',
        age: 25,
        country: 'CN',
        interest: 'Writing',
        netWorth: 251260.8,
        band: 'high',
      },
    ])
  })

  it('does not depend on column order', () => {
    const [p] = rowsToPeople([
      ['Net Worth', 'Country', 'Name', 'Interest', 'Age', 'Photo'],
      ['$60,393.60', 'CN', 'New Yee Chian', 'Cooking', '23', 'u'],
    ])
    expect(p).toMatchObject({ name: 'New Yee Chian', netWorth: 60393.6, band: 'low', age: 23 })
  })

  it('strips non-breaking spaces from names', () => {
    const [p] = rowsToPeople([header, ['Mohd Hanafi Azhar ', 'u', '62', 'MY', 'Gardening', '$332,568.00']])
    expect(p.name).toBe('Mohd Hanafi Azhar')
  })

  it('skips empty and invalid rows', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const people = rowsToPeople([header, [], ['', 'u', '1', 'MY', 'x', '$1'], ['Bad', 'u', '1', 'MY', 'x', 'oops']])
    expect(people).toEqual([])
    expect(warn).toHaveBeenCalledOnce()
    warn.mockRestore()
  })

  it('throws a clear error when a column is missing', () => {
    expect(() => rowsToPeople([['Name', 'Photo'], ['a', 'b']])).toThrow(/age/)
  })

  it('parses the full provided dataset: 200 people', async () => {
    const { default: values } = await import('../src/dev/sample-values.json')
    const people = rowsToPeople(values)
    expect(people).toHaveLength(200)
    expect(people.every((p) => Number.isFinite(p.netWorth) && p.photo.startsWith('https://'))).toBe(true)
  })
})
