const Automerge = require('automerge')

function applyCodeMirrorChangeToAutomerge(state, findList, change, cm) {
  const startPos = cm.indexFromPos(change.from)

  if (change.to.line === change.from.line && change.to.ch === change.from.ch) {
    // nothing was removed.
  } else {
    // delete.removed contains an array of removed lines as strings (without the trailing \n).
    // Finally remove 1 because the last \n won't be deleted
    const removedLength =
      change.removed.reduce((sum, remove) => sum + remove.length + 1, 0) - 1

    state = Automerge.changeset(state, 'Delete', doc => {
      findList(doc).splice(startPos, removedLength)
    })
  }
  if (change.text) {
    state = Automerge.changeset(state, 'Insert', doc => {
      findList(doc).splice(startPos, 0, ...change.text.join('\n').split(''))
    })
  }
  if (change.next) {
    state = applyCodeMirrorChangeToAutomerge(state, change.next, cm)
  }
  return state
}

module.exports = {
  applyCodeMirrorChangeToAutomerge,
}
