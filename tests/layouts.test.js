import { describe, expect, it } from 'vitest'
import { HELIX, LAYOUTS, doubleHelixTargets, gridTargets, sphereTargets, tableTargets } from '../src/three/layouts.js'

const N = 200
const round = (n) => Math.round(n * 1000) / 1000
const distinct = (targets, axis) => new Set(targets.map((t) => round(t.position[axis]))).size
const key = (t) => ['x', 'y', 'z'].map((a) => round(t.position[a])).join(',')

describe.each(Object.entries(LAYOUTS))('%s layout', (_, layout) => {
  it(`returns ${N} targets at unique positions`, () => {
    const targets = layout.targets(N)
    expect(targets).toHaveLength(N)
    expect(new Set(targets.map(key)).size).toBe(N)
  })
})

describe('table', () => {
  it('is 20 columns × 10 rows, centred on the origin', () => {
    const t = tableTargets(N)
    expect(distinct(t, 'x')).toBe(20)
    expect(distinct(t, 'y')).toBe(10)
    expect(distinct(t, 'z')).toBe(1)
    const xs = t.map((o) => o.position.x)
    expect(round(Math.min(...xs) + Math.max(...xs))).toBe(0)
  })

  it('fills rows left-to-right in Sheet order', () => {
    const t = tableTargets(N)
    expect(t[0].position.y).toBe(t[19].position.y)
    expect(t[20].position.y).toBeLessThan(t[19].position.y)
    expect(t[1].position.x).toBeGreaterThan(t[0].position.x)
  })
})

describe('grid', () => {
  it('is 5 (x) × 4 (y) × 10 (z)', () => {
    const t = gridTargets(N)
    expect(distinct(t, 'x')).toBe(5)
    expect(distinct(t, 'y')).toBe(4)
    expect(distinct(t, 'z')).toBe(10)
  })

  it('puts 20 tiles in each depth layer', () => {
    const counts = {}
    for (const o of gridTargets(N)) counts[round(o.position.z)] = (counts[round(o.position.z)] ?? 0) + 1
    expect(Object.values(counts)).toEqual(Array(10).fill(20))
  })
})

describe('double helix', () => {
  const t = doubleHelixTargets(N)

  it('has two strands of 100, each pair at the same height on opposite sides', () => {
    for (let i = 0; i < N; i += 2) {
      const a = t[i].position
      const b = t[i + 1].position
      expect(round(a.y)).toBe(round(b.y))
      expect(round(a.x)).toBe(round(-b.x))
      expect(round(a.z)).toBe(round(-b.z))
    }
  })

  it('keeps every tile on the helix radius', () => {
    for (const o of t) expect(round(Math.hypot(o.position.x, o.position.z))).toBe(HELIX.radius)
  })

  it('gives 100 distinct heights (one per pair)', () => {
    expect(distinct(t, 'y')).toBe(N / 2)
  })
})

describe('sphere', () => {
  it('keeps every tile on the sphere radius', () => {
    for (const o of sphereTargets(N)) expect(round(o.position.length())).toBe(800)
  })
})
