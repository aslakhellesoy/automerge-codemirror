const Automerge = require('automerge')

/**
 * Applies a CodeMirror change to AutoMerge
 *
 * @param doc the Automerge state before the change is applied
 * @param findText a function that will return the single-character string Array with the text
 * @param change the change object from CodeMirror. See https://codeMirror.net/doc/manual.html#events
 * @param codeMirror the CodeMirror instance
 * @returns {*}
 */
function applyCodeMirrorChangeToAutomerge(doc, findText, change, codeMirror) {
  const startPos = codeMirror.indexFromPos(change.from)

  const removedLines = change.removed
  const addedLines = change.text

  const removedLength =
    removedLines.reduce((sum, remove) => sum + remove.length + 1, 0) - 1
  if (removedLength > 0) {
    doc = Automerge.changeset(doc, 'Delete', mdoc => {
      findText(mdoc).splice(startPos, removedLength)
    })
  }

  const addedText = addedLines.join('\n')
  if (addedText.length > 0) {
    doc = Automerge.changeset(doc, 'Insert', doc => {
      const text = findText(doc)
      text.splice(startPos, 0, ...addedText.split(''))
    })
  }

  if (change.next) {
    doc = applyCodeMirrorChangeToAutomerge(doc, change.next, codeMirror)
  }
  return doc
}

const busyCodeMirrors = new Set()

function applyAutomergeDiffToCodeMirror(oldDoc, newDoc, getCodeMirror) {
  const diff = Automerge.diff(oldDoc, newDoc)
  for (const d of diff) {
    const codeMirror = getCodeMirror(d.objectId)
    if (codeMirror && !busyCodeMirrors.has(codeMirror)) {
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

function updateCodeMirrorHandler(getCodeMirror) {
  const docs = new Map()

  return (docId, doc) => {
    const lastDoc = docs.get(docId) || Automerge.init()
    docs.set(docId, doc)
    applyAutomergeDiffToCodeMirror(lastDoc, doc, getCodeMirror)
  }
}

function updateAutomergeHandler(docSet, docId, findText) {
  return (codeMirror, change) => {
    if (change.origin === 'automerge') return
    busyCodeMirrors.add(codeMirror)

    const oldDoc = docSet.getDoc(docId)
    if (!oldDoc) throw new Error(`docSet doesn't have a doc with id ${docId}`)
    const newDoc = applyCodeMirrorChangeToAutomerge(
      oldDoc,
      findText,
      change,
      codeMirror
    )
    docSet.setDoc(docId, newDoc)
    busyCodeMirrors.delete(codeMirror)
  }
}

module.exports = {
  applyCodeMirrorChangeToAutomerge,
  applyAutomergeDiffToCodeMirror,
  updateCodeMirrorHandler,
  updateAutomergeHandler,
}
