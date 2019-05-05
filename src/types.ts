import { Text } from 'automerge'
import { Editor } from 'codemirror'

interface Link<T> {
  getText(doc: T): Text | undefined
  codeMirror: Editor
}

export { Link }
