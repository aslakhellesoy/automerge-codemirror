const Automerge = require('automerge')

/**
 * Creates event handlers that can be used to link a CodeMirror instance to an Automerge.Text object.
 * The returned handlers should be registered within CodeMirror and the Automerge doc.
 *
 * @param codeMirror: CodeMirror - the editor
 * @param getDocText: (doc) => Automerge.Text - Function that returns the Text to link to
 * @param updateDoc: (doc) => void - callback that will be called whenever CodeMirror has modified the doc
 * @return {{automergeHandler: (doc) => void, codeMirrorHandler: (codeMirror, change)}}
 */
function automergeCodeMirror({ codeMirror, getDocText, updateDoc }) {
  let doc = null
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
    if (!doc) {
      doc = newDoc
      // We'll replace the entire editor value on the first automerge update
      const fromPos = codeMirror.posFromIndex(0)
      const toPos = codeMirror.posFromIndex(codeMirror.getValue().length)
      codeMirror.replaceRange(
        getText(newDoc).join(''),
        fromPos,
        toPos,
        'automerge'
      )
      return
    }

    // After the first automerge update we update the doc using a diff

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
    if (!doc) {
      throw new Error(`Editor can't be used before the document has a value`)
    }

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
    processingCodeMirrorChange = true
    updateDoc(doc)
    processingCodeMirrorChange = false
  }

  return { automergeHandler, codeMirrorHandler }
}

module.exports = automergeCodeMirror
