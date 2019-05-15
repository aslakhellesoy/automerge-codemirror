import { WatchableDoc } from 'automerge'
import { useEffect, useState } from 'react'

export default function useAutomergeDoc<T>(watchableDoc: WatchableDoc<T>): T {
  const [doc, setDoc] = useState(watchableDoc.get())

  useEffect(() => {
    watchableDoc.registerHandler(setDoc)
    return () => watchableDoc.unregisterHandler(setDoc)
  }, [])

  return doc
}
