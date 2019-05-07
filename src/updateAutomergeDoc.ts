import * as Automerge from 'automerge'
import * as CodeMirror from 'codemirror'

/**
 * Applies CodeMirror changes and returns a new Automerge Doc
 *
 * @param doc the current doc
 * @param getText a function that returns a Text object
 * @param codeMirror the editor
 * @param change the change
 */
export default function updateAutomergeDoc<T>(
  doc: T,
  getText: (doc: T) => Automerge.Text | undefined,
  codeMirror: CodeMirror.Doc,
  change: CodeMirror.EditorChange
): T {
  return Automerge.change(doc, mdoc => {
    const text = getText(mdoc)
    if (!text) return
    const startPos = codeMirror.indexFromPos(change.from)

    const removedLines = change.removed || []
    const addedLines = change.text

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
