import Automerge from 'automerge'
import { Editor, EditorChange } from 'codemirror'
import updateAutomergeDoc from './updateAutomergeDoc'
import Mutex from './Mutex'

export default function makeCodeMirrorChangeHandler<T>(
  getAutomergeDoc: () => T,
  getText: (doc: T) => Automerge.Text,
  setAutomergeDoc: (doc: T) => void,
  mutex: Mutex
) {
  return (editor: Editor, change: EditorChange) => {
    if (change.origin !== 'automerge') {
      mutex.lock()
      const doc = updateAutomergeDoc(
        getAutomergeDoc(),
        getText,
        editor.getDoc(),
        change
      )
      setAutomergeDoc(doc)
      mutex.release()
    }
  }
}
