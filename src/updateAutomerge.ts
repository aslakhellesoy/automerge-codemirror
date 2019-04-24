import * as Automerge from 'automerge'
import * as CodeMirror from 'codemirror'

export default function<T>(
  doc: T,
  getText: (doc: T) => Automerge.Text,
  codeMirror: CodeMirror.Doc,
  change: CodeMirror.EditorChange
): T {
  return Automerge.change(doc, mdoc => {
    const text = getText(mdoc)
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
