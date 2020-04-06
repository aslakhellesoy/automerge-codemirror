import { Text, Proxy } from 'automerge'
import { Editor, EditorChange } from 'codemirror'
import updateAutomergeDoc from './updateAutomergeDoc'
import Mutex from './Mutex'

export default function makeCodeMirrorChangeHandler<T>(
  getDoc: () => T,
  setDoc: (doc: T) => void,
  getText: (doc: Proxy<T>) => Text,
  mutex: Mutex
) {
  return (editor: Editor, change: EditorChange) => {
    if (change.origin !== 'automerge') {
      mutex.lock()
      const doc = updateAutomergeDoc(getDoc(), getText, editor.getDoc(), change)
      setDoc(doc)
      mutex.release()
    }
  }
}
