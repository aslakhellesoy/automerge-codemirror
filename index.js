const Automerge = require('automerge')

/**
 * Applies a CodeMirror change to AutoMerge
 *
 * @param state the Automerge state before the change is applied
 * @param findList a function that will return the single-character string Array with the text
 * @param change the change object from CodeMirror. See https://codemirror.net/doc/manual.html#events
 * @param cm the CodeMirror instance
 * @returns {*}
 */
function applyCodeMirrorChangeToAutomerge(state, findList, change, cm) {
  const startPos = cm.indexFromPos(change.from)

  const removedLines = change.removed
  const addedLines = change.text

  const removedLength =
    removedLines.reduce((sum, remove) => sum + remove.length + 1, 0) - 1
  if (removedLength > 0)
    state = Automerge.changeset(state, 'Delete', doc => {
      findList(doc).splice(startPos, removedLength)
    })

  const addedText = addedLines.join('\n')
  if (addedText.length > 0)
    state = Automerge.changeset(state, 'Insert', doc => {
      findList(doc).splice(startPos, 0, ...addedText.split(''))
    })

  if (change.next) {
    state = applyCodeMirrorChangeToAutomerge(state, change.next, cm)
  }
  return state
}

module.exports = {
  applyCodeMirrorChangeToAutomerge,
}
