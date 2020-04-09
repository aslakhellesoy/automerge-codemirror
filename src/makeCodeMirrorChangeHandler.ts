import Automerge from 'automerge'
import CodeMirror from 'codemirror'
import updateAutomergeDoc from './updateAutomergeDoc'
import Mutex from './Mutex'
import { GetCurrentDoc, GetText, SetReactState } from './types'

type CodeMirrorChangeHandler = (instance: CodeMirror.Editor, changeObj: CodeMirror.EditorChangeLinkedList) => void

export default function makeCodeMirrorChangeHandler<D>(
  getCurrentDoc: GetCurrentDoc<D>,
  setDoc: SetReactState<D>,
  getText: GetText<D>,
  mutex: Mutex
) {
  const text = getText(getCurrentDoc())
  if (!text) {
    throw new Error(`Cannot connect CodeMirror. Did not find text in ${JSON.stringify(getCurrentDoc())}`)
  }
  const textObjectId = Automerge.getObjectId(text)
  const codeMirrorChangeHandler: CodeMirrorChangeHandler = (
    editor: CodeMirror.Editor,
    change: CodeMirror.EditorChange
  ) => {
    if (change.origin !== 'automerge') {
      mutex.lock()
      const newDoc = updateAutomergeDoc(getCurrentDoc(), getText, editor.getDoc(), change)
      setDoc(newDoc)
      mutex.release()
    }
  }
  return { textObjectId, codeMirrorChangeHandler }
}
