import Automerge from 'automerge'
import { Editor, EditorChange } from 'codemirror'
import Mutex from './Mutex'
export default function makeCodeMirrorChangeHandler<T>(
  getAutomergeDoc: () => T,
  getText: (doc: T) => Automerge.Text,
  setAutomergeDoc: (doc: T) => void,
  mutex: Mutex
): (editor: Editor, change: EditorChange) => void
