import Automerge from 'automerge'
import * as CodeMirror from 'codemirror'

interface Link<T> {
  getText(doc: T): Automerge.Text
  codeMirrorDoc: CodeMirror.Doc
}

export { Link }
