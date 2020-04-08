'use strict'
var __values =
  (this && this.__values) ||
  function (o) {
    var s = typeof Symbol === 'function' && Symbol.iterator,
      m = s && o[s],
      i = 0
    if (m) return m.call(o)
    if (o && typeof o.length === 'number')
      return {
        next: function () {
          if (o && i >= o.length) o = void 0
          return { value: o && o[i++], done: !o }
        },
      }
    throw new TypeError(s ? 'Object is not iterable.' : 'Symbol.iterator is not defined.')
  }
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
var automerge_1 = __importDefault(require('automerge'))
/**
 * Applies the diff between two Automerge documents to CodeMirror instances
 *
 * @param oldDoc
 * @param newDoc
 * @param getCodeMirror
 * @param mutex
 */
function updateCodeMirrorDocs(oldDoc, newDoc, getCodeMirror, mutex) {
  var e_1, _a
  if (mutex.locked || !oldDoc) {
    return newDoc
  }
  var diffs = automerge_1.default.diff(oldDoc, newDoc)
  try {
    for (var diffs_1 = __values(diffs), diffs_1_1 = diffs_1.next(); !diffs_1_1.done; diffs_1_1 = diffs_1.next()) {
      var diff = diffs_1_1.value
      if (diff.type !== 'text') continue
      var codeMirror = getCodeMirror(diff.obj)
      if (!codeMirror) continue
      var codeMirrorDoc = codeMirror.getDoc()
      switch (diff.action) {
        case 'insert': {
          var fromPos = codeMirrorDoc.posFromIndex(diff.index)
          codeMirrorDoc.replaceRange(diff.value, fromPos, undefined, 'automerge')
          break
        }
        case 'remove': {
          var fromPos = codeMirrorDoc.posFromIndex(diff.index)
          var toPos = codeMirrorDoc.posFromIndex(diff.index + 1)
          codeMirrorDoc.replaceRange('', fromPos, toPos, 'automerge')
          break
        }
      }
    }
  } catch (e_1_1) {
    e_1 = { error: e_1_1 }
  } finally {
    try {
      if (diffs_1_1 && !diffs_1_1.done && (_a = diffs_1.return)) _a.call(diffs_1)
    } finally {
      if (e_1) throw e_1.error
    }
  }
  return newDoc
}
exports.default = updateCodeMirrorDocs
//# sourceMappingURL=updateCodeMirrorDocs.js.map
