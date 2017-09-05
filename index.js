const Automerge = require('automerge')
const DiffMatchPatch = require('diff-match-patch')
const dmp = new DiffMatchPatch()

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

function applyAutomergeDiffToCodeMirror(state, newState, findList, cm) {
  const before = findList(state).join('')
  const after = findList(newState).join('')
  const diff = dmp.diff_main(before, after)

  let index = 0
  for (const diffComp of diff) {
    const fromPos = cm.posFromIndex(index)
    switch (diffComp[0]) {
      case -1: {
        // DELETION
        const toPos = cm.posFromIndex(index + diffComp[1].length)
        cm.replaceRange('', fromPos, toPos)
        break
      }
      case 0: {
        // EQUALITY
        index += diffComp[1].length
        break
      }
      case 1: {
        // INSERTION
        cm.replaceRange(diffComp[1], fromPos)
        break
      }
    }
  }
}

module.exports = {
  applyCodeMirrorChangeToAutomerge,
  applyAutomergeDiffToCodeMirror,
}
