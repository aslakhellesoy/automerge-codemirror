import Automerge from 'automerge'
import CodeMirror from 'codemirror'
import { GetText } from './types'

/**
 * Applies CodeMirror changes to an Automerge.Text. This
 * function should be called inside an Automerge.change callback.
 *
 * @param proxy the proxy of the doc containing the text
 * @param getText a function that returns a Text object
 * @param codeMirrorDoc the editor doc
 * @param editorChange the change
 */
export default function updateAutomergeText<D>(
  proxy: Automerge.Proxy<D>,
  getText: GetText<D>,
  codeMirrorDoc: CodeMirror.Doc,
  editorChange: CodeMirror.EditorChange
): void {
  const text = getText(proxy)
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
}
