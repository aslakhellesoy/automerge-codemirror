import { Text } from 'automerge'
import { Editor } from 'codemirror'
export default interface Link<T> {
  getText(doc: T): Text
  codeMirror: Editor
}
