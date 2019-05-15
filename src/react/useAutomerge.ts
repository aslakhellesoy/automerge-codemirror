import { useEffect, useState } from 'react'
import { WatchableDoc } from 'automerge'

export default function useAutomerge<T>(watchableDoc: WatchableDoc<T>): T {
  const [doc, setDoc] = useState(watchableDoc.get())

  useEffect(() => {
    watchableDoc.registerHandler(setDoc)
    return () => watchableDoc.unregisterHandler(setDoc)
  }, [])

  return doc
}
