import Automerge from 'automerge'
import Mutex from './Mutex'

/**
 * Applies the diff between two Automerge documents to CodeMirror instances
 */
export default function updateCodeMirrorDocs<D>(
  oldDoc: D,
  newDoc: D,
  getCodeMirror: (textObjectId: Automerge.UUID) => CodeMirror.Editor | undefined,
  mutex: Mutex
): D {
  if (mutex.locked || !oldDoc) {
    return newDoc
  }
  const diffs = Automerge.diff(oldDoc, newDoc)

  for (const diff of diffs) {
    if (diff.type !== 'text') continue
    const codeMirror = getCodeMirror(diff.obj)
    if (!codeMirror) continue
    const codeMirrorDoc = codeMirror.getDoc()

    switch (diff.action) {
      case 'insert': {
        const fromPos = codeMirrorDoc.posFromIndex(diff.index!)
        codeMirrorDoc.replaceRange(diff.value, fromPos, undefined, 'automerge')
        break
      }
      case 'remove': {
        const fromPos = codeMirrorDoc.posFromIndex(diff.index!)
        const toPos = codeMirrorDoc.posFromIndex(diff.index! + 1)
        codeMirrorDoc.replaceRange('', fromPos, toPos, 'automerge')
        break
      }
    }
  }
  return newDoc
}
