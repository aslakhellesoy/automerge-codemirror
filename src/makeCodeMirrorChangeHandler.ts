import Automerge from 'automerge'
import CodeMirror from 'codemirror'
import updateAutomergeDoc from './updateAutomergeDoc'
import Mutex from './Mutex'

type CodeMirrorChangeHandler = (
  instance: CodeMirror.Editor,
  changeObj: CodeMirror.EditorChangeLinkedList
) => void

export default function makeCodeMirrorChangeHandler<T>(
  getDoc: () => T,
  setDoc: (doc: T) => void,
  getText: (doc: T | Automerge.Proxy<T>) => Automerge.Text,
  mutex: Mutex
) {
  const text = getText(getDoc())
  if (!text) {
    throw new Error(
      `Cannot connect CodeMirror. Did not find text in ${JSON.stringify(
        getDoc()
      )}`
    )
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
