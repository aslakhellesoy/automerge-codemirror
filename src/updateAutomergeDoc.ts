import { change, Text } from 'automerge'
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
): T {
  return change(doc, draft => {
    const text = getText(draft)
    if (!text) return
    const startPos = codeMirrorDoc.indexFromPos(editorChange.from)

    const removedLines = editorChange.removed || []
    const addedLines = editorChange.text

    const removedLength =
      removedLines.reduce((sum, remove) => sum + remove.length + 1, 0) - 1
    if (removedLength > 0) {
      text.splice(startPos, removedLength)
    }

    const addedText = addedLines.join('\n')
    if (addedText.length > 0) {
      text.splice(startPos, 0, ...addedText.split(''))
    }
  })
}
