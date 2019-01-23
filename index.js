const Automerge = require('automerge')

class AutomergeCodeMirror {
  constructor({
    codeMirror,
    getDocText,
    doc,
    updateDoc,
    registerHandler,
    unregisterHandler,
  }) {
    this._codeMirror = codeMirror
    this._getDocText = getDocText
    this._doc = doc
    this._updateDoc = updateDoc
    this._registerHandler = registerHandler
    this._unregisterHandler = unregisterHandler
    let processingCodeMirrorChange = false

    this._automergeHandler = newDoc => {
      if (processingCodeMirrorChange) {
        this._doc = newDoc
        return
      }

      const textObjectId = getDocText(this._doc)._objectId
      const diff = Automerge.diff(this._doc, newDoc)
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
      this._doc = newDoc
    }

    this._codeMirrorHandler = (codeMirror, change) => {
      if (change.origin === 'automerge') return

      processingCodeMirrorChange = true
      const doc = Automerge.change(this._doc, mdoc => {
        const text = getDocText(mdoc)
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
      this._updateDoc(doc)
      processingCodeMirrorChange = false
    }
  }

  start() {
    this._codeMirror.setValue(this._getDocText(this._doc).join(''))
    // When CodeMirror is modified as the result of typing, apply changes to AutoMerge
    this._codeMirror.on('change', this._codeMirrorHandler)
    // When the doc is modified from the outside, apply the diff to CodeMirror
    this._registerHandler(this._automergeHandler)
  }

  stop() {
    this._unregisterHandler(this._automergeHandler)
    this._codeMirror.off('change', this._codeMirrorHandler)
  }
}

module.exports = AutomergeCodeMirror
