import { useEffect } from 'react'
import { Mutex, updateCodeMirrorDocs } from '../../index'
import Link from '../Link'
import { WatchableDoc } from 'automerge'

export default function useCodeMirrorUpdater<T>(
  watchableDoc: WatchableDoc<T>,
  mutex: Mutex,
  links: Set<Link<T>>
): void {
  useEffect(() => {
    let doc = watchableDoc.get()
    const handler = (newDoc: T) => {
      doc = updateCodeMirrorDocs(doc, newDoc, links, mutex)
    }
    watchableDoc.registerHandler(handler)

    return () => watchableDoc.unregisterHandler(handler)
  }, [watchableDoc, mutex, links])
}
