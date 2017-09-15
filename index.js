const Automerge = require('automerge')
const debug = require('debug')('automerge')

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
  debug('cm.indexFromPos')
  const startPos = cm.indexFromPos(change.from)

  const removedLines = change.removed
  const addedLines = change.text

  const removedLength =
    removedLines.reduce((sum, remove) => sum + remove.length + 1, 0) - 1
  if (removedLength > 0) {
    debug('Automerge.changeset (Delete)')
    state = Automerge.changeset(state, 'Delete', doc => {
      findList(doc).splice(startPos, removedLength)
    })
  }

  const addedText = addedLines.join('\n')
  if (addedText.length > 0) {
    debug('Automerge.changeset (Insert)')
    state = Automerge.changeset(state, 'Insert', doc => {
      findList(doc).splice(startPos, 0, ...addedText.split(''))
    })
  }

  if (change.next) {
    state = applyCodeMirrorChangeToAutomerge(state, change.next, cm)
  }
  return state
}

function applyAutomergeDiffToCodeMirror(oldState, newState, getCodeMirror) {
  const diff = Automerge.diff(oldState, newState)
  for (const d of diff) {
    const codeMirror = getCodeMirror(d.objectId)
    if (codeMirror) {
      switch (d.action) {
        case 'insert': {
          const fromPos = codeMirror.posFromIndex(d.index)
          codeMirror.replaceRange(d.value, fromPos, null, 'automerge')
          break
        }
        case 'remove': {
          const fromPos = codeMirror.posFromIndex(d.index)
          const toPos = codeMirror.posFromIndex(d.index + 1)
          codeMirror.replaceRange('', fromPos, toPos, 'automerge')
          break
        }
      }
    }
  }
}

function docSetHandler(docSet, findText, getCodeMirror) {
  const docs = new Map()

  return (docId, doc) => {
    const codemirror = getCodeMirror(docId)
    if (!codemirror) return

    if (!docs.has(docId)) {
      docs.set(docId, doc)
      const text = findText(doc).join('')
      codemirror.setValue(text)
      codemirror.on('change', (cm, change) => {
        if (change.origin === 'automerge') return

        const oldDoc = docs.get(docId)
        const newDoc = applyCodeMirrorChangeToAutomerge(
          oldDoc,
          findText,
          change,
          cm
        )
        docs.set(docId, newDoc)
        docSet.setDoc(docId, newDoc)
      })
    } else {
      const lastDoc = docs.get(docId)
      docs.set(docId, doc)
      applyAutomergeDiffToCodeMirror(lastDoc, doc, getCodeMirror)
    }
  }
}

module.exports = {
  applyCodeMirrorChangeToAutomerge,
  applyAutomergeDiffToCodeMirror,
  docSetHandler,
}
