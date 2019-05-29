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
    // Because the useEffect hook is called asynchronously after render, there is
    // a possibility that the watchableDoc changed between the render and the hook being called.
    // We therefore call setDoc directly - the handler will not be notified about the change.
    const currentDoc = watchableDoc.get()
    if (currentDoc) {
      setDoc(currentDoc)
    }
    watchableDoc.registerHandler(setDoc)
    return () => watchableDoc.unregisterHandler(setDoc)
  }, [])

  return doc
}
