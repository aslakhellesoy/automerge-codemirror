import Automerge from 'automerge'
import CodeMirror from 'codemirror'
import updateAutomergeDoc from './updateAutomergeDoc'
import Mutex from './Mutex'
import { GetDoc, GetText, SetDoc } from './types'

type CodeMirrorChangeHandler = (instance: CodeMirror.Editor, changeObj: CodeMirror.EditorChangeLinkedList) => void

export default function makeCodeMirrorChangeHandler<T>(
  getDoc: GetDoc<T>,
  setDoc: SetDoc<T>,
  getText: GetText<T>,
  mutex: Mutex
) {
  const text = getText(getDoc())
  if (!text) {
    throw new Error(`Cannot connect CodeMirror. Did not find text in ${JSON.stringify(getDoc())}`)
  }
  const textObjectId = Automerge.getObjectId(text)
  const codeMirrorChangeHandler: CodeMirrorChangeHandler = (
    editor: CodeMirror.Editor,
    change: CodeMirror.EditorChange
  ) => {
    if (change.origin !== 'automerge') {
      mutex.lock()
      const doc = updateAutomergeDoc(getDoc(), getText, editor.getDoc(), change)
      setDoc(doc)
      mutex.release()
    }
  }
  return { textObjectId, codeMirrorChangeHandler }
}
