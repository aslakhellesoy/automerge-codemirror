const Automerge = require('automerge')

function applyCodeMirrorChangeToAutomerge(state, findList, change, cm) {
  let startPos = 0 // Get character position from # of chars in each line.
  let i = 0 // i goes through all lines.

  while (i < change.from.line) {
    startPos += cm.lineInfo(i).text.length + 1 // Add 1 for '\n'
    i++
  }

  startPos += change.from.ch

  if (change.to.line === change.from.line && change.to.ch === change.from.ch) {
    // nothing was removed.
  } else {
    // delete.removed contains an array of removed lines as strings, so this adds
    // all the lengths. Later change.removed.length - 1 is added for the \n-chars
    // (-1 because the linebreak on the last line won't get deleted)
    let delLen = 0
    for (let rm = 0; rm < change.removed.length; rm++) {
      delLen += change.removed[rm].length
    }
    delLen += change.removed.length - 1
    state = Automerge.changeset(state, 'Delete', doc => {
      findList(doc).splice(startPos, delLen)
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
