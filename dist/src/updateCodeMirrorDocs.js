'use strict'
var __values =
  (this && this.__values) ||
  function(o) {
    var m = typeof Symbol === 'function' && o[Symbol.iterator],
      i = 0
    if (m) return m.call(o)
    return {
      next: function() {
        if (o && i >= o.length) o = void 0
        return { value: o && o[i++], done: !o }
      },
    }
  }
Object.defineProperty(exports, '__esModule', { value: true })
var automerge_1 = require('automerge')
/**
 * Applies the diff between two Automerge documents to CodeMirror instances
 *
 * @param oldDoc
 * @param newDoc
 * @param links
 * @param mutex
 */
function updateCodeMirrorDocs(oldDoc, newDoc, links, mutex) {
  var e_1, _a
  if (mutex.locked || !oldDoc) {
    return newDoc
  }
  var diffs = automerge_1.diff(oldDoc, newDoc)
  try {
    for (
      var diffs_1 = __values(diffs), diffs_1_1 = diffs_1.next();
      !diffs_1_1.done;
      diffs_1_1 = diffs_1.next()
    ) {
      var d = diffs_1_1.value
      if (d.type !== 'text') continue
      var link = findLink(newDoc, links, d)
      if (!link) continue
      var codeMirrorDoc = link.codeMirror.getDoc()
      switch (d.action) {
        case 'insert': {
          var fromPos = codeMirrorDoc.posFromIndex(d.index)
          codeMirrorDoc.replaceRange(d.value, fromPos, undefined, 'automerge')
          break
        }
        case 'remove': {
          var fromPos = codeMirrorDoc.posFromIndex(d.index)
          var toPos = codeMirrorDoc.posFromIndex(d.index + 1)
          codeMirrorDoc.replaceRange('', fromPos, toPos, 'automerge')
          break
        }
      }
    }
  } catch (e_1_1) {
    e_1 = { error: e_1_1 }
  } finally {
    try {
      if (diffs_1_1 && !diffs_1_1.done && (_a = diffs_1.return))
        _a.call(diffs_1)
    } finally {
      if (e_1) throw e_1.error
    }
  }
  return newDoc
}
exports.default = updateCodeMirrorDocs
function findLink(newDoc, links, op) {
  var e_2, _a
  try {
    for (
      var links_1 = __values(links), links_1_1 = links_1.next();
      !links_1_1.done;
      links_1_1 = links_1.next()
    ) {
      var link = links_1_1.value
      var text = link.getText(newDoc)
      var textObjectId = automerge_1.getObjectId(text)
      if (op.obj === textObjectId) {
        return link
      }
    }
  } catch (e_2_1) {
    e_2 = { error: e_2_1 }
  } finally {
    try {
      if (links_1_1 && !links_1_1.done && (_a = links_1.return))
        _a.call(links_1)
    } finally {
      if (e_2) throw e_2.error
    }
  }
  return null
}
//# sourceMappingURL=updateCodeMirrorDocs.js.map
