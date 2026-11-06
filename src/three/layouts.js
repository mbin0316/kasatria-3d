// Target positions/rotations for each arrangement. Pure functions → unit-testable.
// Each returns `count` THREE.Object3D targets plus a camera "view" for framing.

import { Object3D, Vector3 } from 'three'

export const TILE = { width: 120, height: 160 }

/** Table: 20 columns × 10 rows (row-major, in Sheet order). */
export const TABLE = { cols: 20, rows: 10, spacingX: 140, spacingY: 180 }

export function tableTargets(count) {
  const { cols, spacingX, spacingY } = TABLE
  const rows = Math.ceil(count / cols)
  return Array.from({ length: count }, (_, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const o = new Object3D()
    o.position.set((col - (cols - 1) / 2) * spacingX, ((rows - 1) / 2 - row) * spacingY, 0)
    return o
  })
}

/** Sphere: the three.js demo's even distribution on a sphere, tiles facing outwards. */
export const SPHERE = { radius: 800 }

export function sphereTargets(count) {
  const v = new Vector3()
  return Array.from({ length: count }, (_, i) => {
    const phi = Math.acos(-1 + (2 * i) / count)
    const theta = Math.sqrt(count * Math.PI) * phi
    const o = new Object3D()
    o.position.setFromSphericalCoords(SPHERE.radius, phi, theta)
    v.copy(o.position).multiplyScalar(2)
    o.lookAt(v)
    return o
  })
}

/**
 * Double helix: tiles alternate between two strands (even → A, odd → B).
 * Strand B is offset by π, so each pair sits on opposite sides at the same height.
 */
// ~2.5 turns per strand; the pitch leaves a clear gap between the interleaved strands.
export const HELIX = { radius: 900, angleStep: 0.16, riseStep: 20 }

export function doubleHelixTargets(count) {
  const { radius, angleStep, riseStep } = HELIX
  const pairs = Math.ceil(count / 2)
  const v = new Vector3()
  return Array.from({ length: count }, (_, i) => {
    const k = Math.floor(i / 2)
    const strand = i % 2
    const theta = k * angleStep + Math.PI + strand * Math.PI
    const y = ((pairs - 1) / 2 - k) * riseStep
    const o = new Object3D()
    o.position.setFromCylindricalCoords(radius, theta, y)
    v.set(o.position.x * 2, o.position.y, o.position.z * 2)
    o.lookAt(v)
    return o
  })
}

/** Grid: 5 (x) × 4 (y) × 10 (z layers), as in Image C. */
export const GRID = { x: 5, y: 4, z: 10, spacingX: 300, spacingY: 300, spacingZ: 320 }

export function gridTargets(count) {
  const { x: nx, y: ny, z: nz, spacingX, spacingY, spacingZ } = GRID
  return Array.from({ length: count }, (_, i) => {
    const ix = i % nx
    const iy = Math.floor(i / nx) % ny
    const iz = Math.floor(i / (nx * ny))
    const o = new Object3D()
    o.position.set(
      (ix - (nx - 1) / 2) * spacingX,
      ((ny - 1) / 2 - iy) * spacingY,
      ((nz - 1) / 2 - iz) * spacingZ,
    )
    return o
  })
}

const gridExtent = [
  (GRID.x - 1) * GRID.spacingX + TILE.width,
  (GRID.y - 1) * GRID.spacingY + TILE.height,
  (GRID.z - 1) * GRID.spacingZ,
]

/**
 * Camera framing per layout. `dir` is where the camera sits relative to the origin.
 * Flat layouts give `size` (world width × height that must fit on screen); 3D layouts
 * viewed at an angle give `radius` (a bounding sphere that must fit).
 */
export const LAYOUTS = {
  table: {
    label: 'Table',
    targets: tableTargets,
    view: { dir: [0, 0, 1], size: [TABLE.cols * TABLE.spacingX + 160, TABLE.rows * TABLE.spacingY + 300] },
  },
  sphere: {
    label: 'Sphere',
    targets: sphereTargets,
    view: { dir: [0, 0, 1], size: [2 * SPHERE.radius + 300, 2 * SPHERE.radius + 300] },
  },
  helix: {
    label: 'Helix',
    targets: doubleHelixTargets,
    view: { dir: [0, 0.15, 1], size: [2 * HELIX.radius + 400, 100 * HELIX.riseStep + 1150] },
  },
  grid: {
    label: 'Grid',
    targets: gridTargets,
    // Three-quarter view from the front-left so all three axes (5 × 4 × 10) read clearly.
    // `target` re-centres the perspective-skewed projection on screen.
    view: { dir: [-0.8, 0.35, 1], radius: 0.36 * Math.hypot(...gridExtent), target: [240, -380, 150] },
  },
}

export const LAYOUT_KEYS = Object.keys(LAYOUTS)
