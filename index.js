const Automerge = require('automerge')

/**
 * Applies a CodeMirror change to an AutoMerge Doc instance.
 *
 * @param doc the Automerge state before the change is applied
 * @param change the change object from CodeMirror. See https://codeMirror.net/doc/manual.html#events
 * @param codeMirror the CodeMirror instance
 * @returns updated doc
 */
function applyCodeMirrorChangeToAutomerge(doc, change, codeMirror) {
  const startPos = codeMirror.indexFromPos(change.from)

  const removedLines = change.removed
  const addedLines = change.text

  const removedLength =
    removedLines.reduce((sum, remove) => sum + remove.length + 1, 0) - 1
  if (removedLength > 0) {
    doc = Automerge.change(doc, 'Delete', mdoc => {
      if (!mdoc.text) mdoc.text = new Automerge.Text()
      mdoc.text.splice(startPos, removedLength)
    })
  }

  const addedText = addedLines.join('\n')
  if (addedText.length > 0) {
    doc = Automerge.change(doc, 'Insert', mdoc => {
      if (!mdoc.text) mdoc.text = new Automerge.Text()
      mdoc.text.splice(startPos, 0, ...addedText.split(''))
    })
  }

  if (change.next) {
    doc = applyCodeMirrorChangeToAutomerge(doc, change.next, codeMirror)
  }
  return doc
}

/**
 * Applies an Automerge Diff to a CodeMirror instance.
 *
 * @param diff the Automerge diff
 * @param codeMirror the CodeMirror instance
 */
function applyAutomergeDiffToCodeMirror(diff, codeMirror) {
  if (codeMirror.automergeBusy) return
  for (const d of diff) {
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

function updateAutomergeHandler(watchableDoc) {
  return (codeMirror, change) => {
    if (change.origin === 'automerge') return
    codeMirror.automergeBusy = true
    const oldDoc = watchableDoc.get()
    const newDoc = applyCodeMirrorChangeToAutomerge(oldDoc, change, codeMirror)
    watchableDoc.set(newDoc)
    codeMirror.automergeBusy = false
  }
}

class AutomergeCodeMirror {
  constructor(codeMirror, watchableDoc) {
    this._codeMirror = codeMirror
    this._watchableDoc = watchableDoc
    this._oldDoc = watchableDoc.get()
  }

  connect() {
    this._codeMirror.on('change', updateAutomergeHandler(this._watchableDoc))
    // Get notified when the doc is modified from the outside
    this._watchableDoc.registerHandler(newDoc => {
      const diff = Automerge.diff(this._oldDoc, newDoc)
      applyAutomergeDiffToCodeMirror(diff, this._codeMirror)
      this._oldDoc = newDoc
    })
  }

  disconnect() {}
}

module.exports = {
  applyCodeMirrorChangeToAutomerge,
  applyAutomergeDiffToCodeMirror,
  updateAutomergeHandler,
  AutomergeCodeMirror,
}
