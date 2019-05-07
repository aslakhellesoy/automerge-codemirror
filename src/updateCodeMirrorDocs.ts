import Automerge, { Diff } from 'automerge'
import { Link } from './types'

/**
 * Applies the diff between two Automerge documents to CodeMirror instances
 *
 * @param oldDoc
 * @param newDoc
 * @param links
 */
export default function updateCodeMirrorDocs<T>(
  oldDoc: T,
  newDoc: T,
  links: Set<Link<T>>
): T {
  const diff = Automerge.diff(oldDoc, newDoc)

  for (const op of diff) {
    const codeMirror = findCodeMirrorDoc(newDoc, links, op)
    if (!codeMirror) continue

    switch (op.action) {
      case 'insert': {
        const fromPos = codeMirror.posFromIndex(op.index!)
        codeMirror.replaceRange(op.value, fromPos, undefined, 'automerge')
        break
      }
      case 'remove': {
        const fromPos = codeMirror.posFromIndex(op.index!)
        const toPos = codeMirror.posFromIndex(op.index! + 1)
        codeMirror.replaceRange('', fromPos, toPos, 'automerge')
        break
      }
    }
  }

  return newDoc
}

function findCodeMirrorDoc<T>(
  newDoc: T,
  links: Set<Link<T>>,
  op: Diff
): CodeMirror.Doc | undefined {
  let codeMirrorDoc
  for (const link of links) {
    const text = link.getText(newDoc)
    const textObjectId = Automerge.getObjectId(text)
    if (op.obj === textObjectId) {
      codeMirrorDoc = link.codeMirror.getDoc()
      break
    }
  }
  return codeMirrorDoc
}
