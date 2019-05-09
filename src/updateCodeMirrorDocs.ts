import { Diff, diff, getObjectId } from 'automerge'
import { Link } from './types'
import Mutex from './Mutex'

/**
 * Applies the diff between two Automerge documents to CodeMirror instances
 *
 * @param oldDoc
 * @param newDoc
 * @param links
 * @param mutex
 */
export default function updateCodeMirrorDocs<T>(
  oldDoc: T,
  newDoc: T,
  links: Set<Link<T>>,
  mutex: Mutex
): T {
  if (mutex.locked) {
    return newDoc
  }
  const diffs = diff(oldDoc, newDoc)

  for (const d of diffs) {
    const link = findLink(newDoc, links, d)
    if (!link) continue
    const codeMirrorDoc = link.codeMirror.getDoc()

    switch (d.action) {
      case 'insert': {
        const fromPos = codeMirrorDoc.posFromIndex(d.index!)
        codeMirrorDoc.replaceRange(d.value, fromPos, undefined, 'automerge')
        break
      }
      case 'remove': {
        const fromPos = codeMirrorDoc.posFromIndex(d.index!)
        const toPos = codeMirrorDoc.posFromIndex(d.index! + 1)
        codeMirrorDoc.replaceRange('', fromPos, toPos, 'automerge')
        break
      }
    }
  }

  return newDoc
}

function findLink<T>(newDoc: T, links: Set<Link<T>>, op: Diff): Link<T> | null {
  for (const link of links) {
    const text = link.getText(newDoc)
    const textObjectId = getObjectId(text)
    if (op.obj === textObjectId) {
      return link
    }
  }
  return null
}
