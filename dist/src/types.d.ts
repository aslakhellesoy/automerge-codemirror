import { Text } from 'automerge'
import { Editor } from 'codemirror'
interface Link<T> {
  getText(doc: T): Text
  codeMirror: Editor
}
export { Link }
