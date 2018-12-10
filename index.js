const Automerge = require('automerge')

class AutomergeCodeMirror {
  constructor(codeMirror, watchableDoc, getDocText) {
    this._codeMirror = codeMirror
    this._watchableDoc = watchableDoc

    let oldDoc = watchableDoc.get()
    let processingCodeMirrorChange = false

    this._automergeHandler = newDoc => {
      if (processingCodeMirrorChange) return

      const textObjectId = getDocText(oldDoc)._objectId
      const diff = Automerge.diff(oldDoc, newDoc)
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
      oldDoc = newDoc
    }

    this._codeMirrorHandler = (codeMirror, change) => {
      if (change.origin === 'automerge') return

      processingCodeMirrorChange = true
      const oldDoc = watchableDoc.get()
      const newDoc = Automerge.change(oldDoc, mdoc => {
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
      watchableDoc.set(newDoc)
      processingCodeMirrorChange = false
    }
  }

  start() {
    // When CodeMirror is modified as the result of typing, apply changes to AutoMerge
    this._codeMirror.on('change', this._codeMirrorHandler)
    // When the doc is modified from the outside, apply the diff to CodeMirror
    this._watchableDoc.registerHandler(this._automergeHandler)
  }

  stop() {
    this._watchableDoc.unregisterHandler(this._automergeHandler)
    this._codeMirror.off('change', this._codeMirrorHandler)
  }
}

module.exports = AutomergeCodeMirror
