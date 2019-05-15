import { Text } from 'automerge'
import { Doc, EditorChange } from 'codemirror'
/**
 * Applies CodeMirror changes and returns a new Automerge Doc
 *
 * @param doc the current doc
 * @param getText a function that returns a Text object
 * @param codeMirrorDoc the editor doc
 * @param editorChange the change
 */
export default function updateAutomergeDoc<T>(
  doc: T,
  getText: (doc: T) => Text,
  codeMirrorDoc: Doc,
  editorChange: EditorChange
): T
