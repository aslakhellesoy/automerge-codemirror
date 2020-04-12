import Automerge from 'automerge'
import { useEffect, useState } from 'react'

export default function useAutomergeDoc<D>(watchableDoc: Automerge.WatchableDoc<D>): D {
  const [doc, setDoc] = useState(watchableDoc.get())

  useEffect(() => {
    const handler = () => {
      setDoc(watchableDoc.get())
    }
    watchableDoc.registerHandler(handler)
    return () => watchableDoc.unregisterHandler(handler)
  })

  return doc
}
