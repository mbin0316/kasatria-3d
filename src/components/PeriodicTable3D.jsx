import { useEffect, useRef } from 'react'
import { createScene } from '../three/scene.js'

/** React ↔ three.js bridge: builds the scene for `people`, morphs it on `layout` changes. */
export default function PeriodicTable3D({ people, layout }) {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const layoutRef = useRef(layout)

  // Declared first so it runs before the scene effect on mount.
  useEffect(() => {
    layoutRef.current = layout
    sceneRef.current?.transform(layout)
  }, [layout])

  useEffect(() => {
    const scene = createScene(containerRef.current, people)
    sceneRef.current = scene
    scene.transform(layoutRef.current)
    return () => {
      scene.dispose()
      sceneRef.current = null
    }
  }, [people])

  return <div ref={containerRef} className="scene" role="img" aria-label={`3D ${layout} of ${people.length} people`} />
}
