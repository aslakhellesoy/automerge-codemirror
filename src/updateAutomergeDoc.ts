import Automerge from 'automerge'
import CodeMirror from 'codemirror'
import { GetText } from './types'

/**
 * Applies CodeMirror changes and returns a new Automerge Doc
 *
 * @param doc the current doc
 * @param getText a function that returns a Text object
 * @param codeMirrorDoc the editor doc
 * @param editorChange the change
 */
export default function updateAutomergeDoc<D>(
  doc: D,
  getText: GetText<D>,
  codeMirrorDoc: CodeMirror.Doc,
  editorChange: CodeMirror.EditorChange
): D {
  return Automerge.change(doc, (draft) => {
    const text = getText(draft)
    if (!text) return
    const startPos = codeMirrorDoc.indexFromPos(editorChange.from)

    const removedLines = editorChange.removed || []
    const addedLines = editorChange.text

    const removedLength = removedLines.reduce((sum, remove) => sum + remove.length + 1, 0) - 1
    if (removedLength > 0) {
      text.deleteAt!(startPos, removedLength)
    }

    const addedText = addedLines.join('\n')
    if (addedText.length > 0) {
      text.insertAt!(startPos, ...addedText.split(''))
    }
  })
}
