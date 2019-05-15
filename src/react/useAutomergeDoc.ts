import { WatchableDoc } from 'automerge'
import { useEffect, useState } from 'react'

/**
 * This hook updates a state variable when {@link watchableDoc} is updated.
 *
 * @param watchableDoc the doc to observe
 */
export default function useAutomergeDoc<T>(watchableDoc: WatchableDoc<T>): T {
  const [doc, setDoc] = useState(watchableDoc.get())

  useEffect(() => {
    watchableDoc.registerHandler(setDoc)
    return () => watchableDoc.unregisterHandler(setDoc)
  }, [])

  return doc
}
