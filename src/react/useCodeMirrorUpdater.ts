import { WatchableDoc } from 'automerge'
import { useEffect } from 'react'
import Link from '../Link'
import Mutex from '../Mutex'
import updateCodeMirrorDocs from '../updateCodeMirrorDocs'

/**
 * This hook updates CodeMirror instances when {@link watchableDoc} changes.
 *
 * @param watchableDoc the doc to observe
 * @param mutex
 * @param links
 */
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
