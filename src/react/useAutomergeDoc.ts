import Automerge from 'automerge'
import { useEffect, useState } from 'react'

export default function useAutomergeDoc<D>(watchableDoc: Automerge.WatchableDoc<D>): D {
  const [doc, setDoc] = useState(watchableDoc.get())

  useEffect(() => {
    const handler = () => setDoc(watchableDoc.get())

    // Because the useEffect hook is called asynchronously after render, there is
    // a possibility that the watchableDoc changed between the render and the hook being called.
    // We therefore call the handler once
    handler()

    watchableDoc.registerHandler(handler)
    return () => watchableDoc.unregisterHandler(handler)
  }, [])

  return doc
}
