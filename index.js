const Automerge = require('automerge')

function automergeCodeMirror({
  codeMirror,
  getDocText,
  doc,
  updateDoc,
  registerHandler,
  unregisterHandler,
}) {
  let processingCodeMirrorChange = false

  function getText(doc) {
    if (!doc) {
      throw new Error(`No doc`)
    }
    const text = getDocText(doc)
    if (!text) {
      throw new Error(`No text`)
    }
    return text
  }

  const automergeHandler = newDoc => {
    if (processingCodeMirrorChange) {
      doc = newDoc
      return
    }

    const textObjectId = getText(doc)._objectId
    const diff = Automerge.diff(doc, newDoc)
    for (const d of diff) {
      if (d.obj !== textObjectId) continue
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
    doc = newDoc
  }

  function codeMirrorHandler(codeMirror, change) {
    if (change.origin === 'automerge') return

    processingCodeMirrorChange = true
    doc = Automerge.change(doc, mdoc => {
      const text = getText(mdoc)
      const startPos = codeMirror.indexFromPos(change.from)

      const removedLines = change.removed
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
    updateDoc(doc)
    processingCodeMirrorChange = false
  }

  codeMirror.setValue(getText(doc).join(''))
  // When CodeMirror is modified as the result of typing, apply changes to AutoMerge
  codeMirror.on('change', codeMirrorHandler)
  // When the doc is modified from the outside, apply the diff to CodeMirror
  registerHandler(automergeHandler)

  return () => {
    unregisterHandler(automergeHandler)
    codeMirror.off('change', codeMirrorHandler)
  }
}

module.exports = automergeCodeMirror
