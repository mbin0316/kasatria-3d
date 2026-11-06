// three.js CSS3D scene, adapted from the official css3d_periodictable example.
// Owns the renderer, camera, controls, tiles and tweens; React only calls
// transform() and dispose().

import { MathUtils, PerspectiveCamera, Scene, Vector3 } from 'three'
import { CSS3DObject, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js'
import { TrackballControls } from 'three/addons/controls/TrackballControls.js'
import { Easing, Group, Tween } from '@tweenjs/tween.js'
import { LAYOUTS } from './layouts.js'
import { createTile } from './tile.js'

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export function createScene(container, people) {
  const size = () => [container.clientWidth || 1, container.clientHeight || 1]
  let [width, height] = size()

  const camera = new PerspectiveCamera(40, width / height, 1, 20000)
  camera.position.set(0, 0, 3000)

  const scene = new Scene()
  const renderer = new CSS3DRenderer()
  renderer.setSize(width, height)
  renderer.domElement.className = 'scene-canvas'
  container.appendChild(renderer.domElement)

  // Tiles start scattered, like the demo, then fly into the first layout.
  const objects = people.map((person) => {
    const object = new CSS3DObject(createTile(person))
    object.position.set(Math.random() * 4000 - 2000, Math.random() * 4000 - 2000, Math.random() * 4000 - 2000)
    scene.add(object)
    return object
  })

  const targets = Object.fromEntries(
    Object.entries(LAYOUTS).map(([key, layout]) => [key, layout.targets(objects.length)]),
  )

  const controls = new TrackballControls(camera, renderer.domElement)
  controls.minDistance = 500
  controls.maxDistance = 15000
  controls.rotateSpeed = 2

  const tweens = new Group()
  let current = null

  /** Camera position that fits the layout's view box in the current viewport. */
  function cameraFor(layoutKey) {
    const { dir, size, radius, target = [0, 0, 0] } = LAYOUTS[layoutKey].view
    const tanV = Math.tan(MathUtils.degToRad(camera.fov / 2))
    let distance
    if (radius) {
      const halfFov = Math.min(Math.atan(tanV), Math.atan(tanV * camera.aspect))
      distance = radius / Math.sin(halfFov)
    } else {
      const [w, h] = size
      distance = Math.max(h / (2 * tanV), w / (2 * tanV * camera.aspect))
    }
    const lookAt = new Vector3(...target)
    const position = new Vector3(...dir)
      .normalize()
      .multiplyScalar(Math.min(distance, controls.maxDistance))
      .add(lookAt)
    return { position, lookAt }
  }

  function transform(layoutKey, duration = 2000) {
    const layoutTargets = targets[layoutKey]
    if (!layoutTargets) return
    current = layoutKey
    tweens.removeAll()
    if (reducedMotion()) duration = 0

    objects.forEach((object, i) => {
      const target = layoutTargets[i]
      const time = duration ? Math.random() * duration + duration : 0
      new Tween(object.position, tweens)
        .to({ x: target.position.x, y: target.position.y, z: target.position.z }, time)
        .easing(Easing.Exponential.InOut)
        .start()
      new Tween(object.rotation, tweens)
        .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, time)
        .easing(Easing.Exponential.InOut)
        .start()
    })

    // Re-frame the camera for the new arrangement (also undoes any user rotation).
    const { position, lookAt } = cameraFor(layoutKey)
    const camTime = duration ? duration * 1.5 : 0
    new Tween(camera.position, tweens)
      .to({ x: position.x, y: position.y, z: position.z }, camTime)
      .easing(Easing.Cubic.InOut)
      .start()
    new Tween(camera.up, tweens).to({ x: 0, y: 1, z: 0 }, camTime).start()
    new Tween(controls.target, tweens)
      .to({ x: lookAt.x, y: lookAt.y, z: lookAt.z }, camTime)
      .easing(Easing.Cubic.InOut)
      .start()
  }

  let frame = 0
  const loop = (time) => {
    frame = requestAnimationFrame(loop)
    tweens.update(time, false) // false → drop finished tweens (tween.js 25 keeps them by default)
    controls.update()
    renderer.render(scene, camera)
  }
  frame = requestAnimationFrame(loop)

  const resizeObserver = new ResizeObserver(() => {
    ;[width, height] = size()
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    controls.handleResize()
  })
  resizeObserver.observe(container)

  // Dev-only debugging handle (stripped from production builds).
  if (import.meta.env.DEV) {
    window.__kasatria = { camera, controls, tweens, objects, render: () => renderer.render(scene, camera) }
  }

  function dispose() {
    cancelAnimationFrame(frame)
    resizeObserver.disconnect()
    tweens.removeAll()
    controls.dispose()
    renderer.domElement.remove()
  }

  return { transform, dispose, get layout() { return current } }
}
