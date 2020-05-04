import Automerge from 'automerge'
import CodeMirror from 'codemirror'
import Mutex from './Mutex'

/**
 * Applies the diff between two Automerge documents to CodeMirror instances
 *
 * @param oldDoc
 * @param newDoc
 * @param getCodeMirror
 * @param mutex
 */
export default function updateCodeMirrorDocs<D>(
  oldDoc: D,
  newDoc: D,
  getCodeMirror: (textObjectId: Automerge.UUID) => CodeMirror.Editor | undefined,
  mutex: Mutex
): void {
  if (mutex.locked || !oldDoc) {
    return
  }
  const now = Date.now()
  const diffs = Automerge.diff(oldDoc, newDoc)
  const duration = Date.now() - now
  console.log(`Diff duration ${duration}`)

  for (const diff of diffs) {
    if (diff.type !== 'text') continue
    const codeMirror = getCodeMirror(diff.obj)
    if (!codeMirror) continue
    const codeMirrorDoc = codeMirror.getDoc()

    switch (diff.action) {
      case 'insert': {
        const fromPos = codeMirrorDoc.posFromIndex(diff.index!)
        let now = Date.now()
        codeMirrorDoc.replaceRange(diff.value, fromPos, undefined, 'automerge')
        let duration = Date.now() - now
        console.log(`replaceRange duration add ${duration}`)
        break
      }
      case 'remove': {
        const fromPos = codeMirrorDoc.posFromIndex(diff.index!)
        const toPos = codeMirrorDoc.posFromIndex(diff.index! + 1)
        let now = Date.now()
        codeMirrorDoc.replaceRange('', fromPos, toPos, 'automerge')
        let duration = Date.now() - now
        console.log(`replaceRange duration delete ${duration}`)
        break
        break
      }
    }
  }
}
