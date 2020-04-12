import Automerge from 'automerge'
import CodeMirror from 'codemirror'
import updateAutomergeDoc from './updateAutomergeDoc'
import Mutex from './Mutex'
import { GetText } from './types'

type CodeMirrorChangeHandler = (instance: CodeMirror.Editor, changeObj: CodeMirror.EditorChangeLinkedList) => void

export default function makeCodeMirrorChangeHandler<D>(
  watchableDoc: Automerge.WatchableDoc<D>,
  getText: GetText<D>,
  mutex: Mutex
) {
  const text = getText(watchableDoc.get())
  if (!text) {
    throw new Error(`Cannot connect CodeMirror. Did not find text in ${JSON.stringify(watchableDoc.get())}`)
  }
  const textObjectId = Automerge.getObjectId(text)
  const codeMirrorChangeHandler: CodeMirrorChangeHandler = (
    editor: CodeMirror.Editor,
    change: CodeMirror.EditorChange
  ) => {
    if (change.origin !== 'automerge') {
      mutex.lock()
      const newDoc = updateAutomergeDoc(watchableDoc.get(), getText, editor.getDoc(), change)
      watchableDoc.set(newDoc)
      mutex.release()
    }
  }
  return { textObjectId, codeMirrorChangeHandler }
}
