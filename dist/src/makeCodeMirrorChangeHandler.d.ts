import { WatchableDoc, Text } from 'automerge'
import { Editor, EditorChange } from 'codemirror'
import Mutex from './Mutex'
export default function makeCodeMirrorChangeHandler<T>(
  watchableDoc: WatchableDoc<T>,
  getText: (doc: T) => Text,
  mutex: Mutex
): (editor: Editor, change: EditorChange) => void
