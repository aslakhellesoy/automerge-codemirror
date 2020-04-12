import Automerge from 'automerge'
import { useEffect, useState } from 'react'
import { ConnectCodeMirror } from '../types'
import automergeCodeMirror from '../automergeCodeMirror'

export default function useAutomergeCodeMirror<D>(watchableDoc: Automerge.WatchableDoc<D>): [D, ConnectCodeMirror<D>] {
  // @ts-ignore
  const [doc, setDoc] = useState(watchableDoc.get())
  const { connectCodeMirror } = automergeCodeMirror(watchableDoc)

  useEffect(() => {
    const handler = () => {
      setDoc(watchableDoc.get())
    }
    watchableDoc.registerHandler(handler)
    return () => watchableDoc.unregisterHandler(handler)
  })

  return [doc, connectCodeMirror]
}
