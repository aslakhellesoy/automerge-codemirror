const Automerge = require('automerge')

/**
 * Applies a CodeMirror change to an Automerge.Text instance.
 *
 * @param text the text to modify
 * @param change the change object from CodeMirror. See https://codeMirror.net/doc/manual.html#events
 * @param codeMirror the CodeMirror instance
 * @returns updated doc
 */
function applyCodeMirrorChangeToArray(text, change, codeMirror) {
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

  if (change.next) {
    applyCodeMirrorChangeToArray(text, change.next, codeMirror)
  }
}

/**
 * Applies an Automerge Diff to a CodeMirror instance.
 *
 * @param diff the Automerge diff
 * @param textObjectId the _objectId of the text property "linked" to the CodeMirror instance
 * @param codeMirror the CodeMirror instance
 */
function applyAutomergeDiffToCodeMirror(diff, textObjectId, codeMirror) {
  if (codeMirror.automergeBusy) return
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
}

function makeUpdateAutomergeHandler(watchableDoc, getDocText) {
  return (codeMirror, change) => {
    if (change.origin === 'automerge') return
    codeMirror.automergeBusy = true
    const oldDoc = watchableDoc.get()
    const newDoc = Automerge.change(oldDoc, mdoc => {
      const text = getDocText(mdoc)
      applyCodeMirrorChangeToArray(text, change, codeMirror)
    })
    watchableDoc.set(newDoc)
    codeMirror.automergeBusy = false
  }
}

class AutomergeCodeMirror {
  constructor(codeMirror, watchableDoc, getDocText) {
    this._codeMirror = codeMirror
    this._watchableDoc = watchableDoc
    this._oldDoc = watchableDoc.get()
    this._textObjectId = getDocText(this._oldDoc)._objectId

    this._updateCodeMirrorHandler = newDoc => {
      const diff = Automerge.diff(this._oldDoc, newDoc)
      applyAutomergeDiffToCodeMirror(diff, this._textObjectId, this._codeMirror)
      this._oldDoc = newDoc
    }

    this._updateAutomergeHandler = makeUpdateAutomergeHandler(
      watchableDoc,
      getDocText
    )
  }

  start() {
    // When CodeMirror is modified as the result of typing, apply changes to AutoMerge
    this._codeMirror.on('change', this._updateAutomergeHandler)
    // When the doc is modified from the outside, apply the diff to CodeMirror
    this._watchableDoc.registerHandler(this._updateCodeMirrorHandler)
  }

  stop() {
    this._watchableDoc.unregisterHandler(this._updateCodeMirrorHandler)
    this._codeMirror.off('change', this._updateAutomergeHandler)
  }
}

module.exports = {
  applyCodeMirrorChangeToArray,
  applyAutomergeDiffToCodeMirror,
  AutomergeCodeMirror,
}
