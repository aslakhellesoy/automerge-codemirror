'use strict'
var __read =
  (this && this.__read) ||
  function (o, n) {
    var m = typeof Symbol === 'function' && o[Symbol.iterator]
    if (!m) return o
    var i = m.call(o),
      r,
      ar = [],
      e
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value)
    } catch (error) {
      e = { error: error }
    } finally {
      try {
        if (r && !r.done && (m = i['return'])) m.call(i)
      } finally {
        if (e) throw e.error
      }
    }
    return ar
  }
var __spread =
  (this && this.__spread) ||
  function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]))
    return ar
  }
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
var automerge_1 = __importDefault(require('automerge'))
/**
 * Applies CodeMirror changes and returns a new Automerge Doc
 *
 * @param doc the current doc
 * @param getText a function that returns a Text object
 * @param codeMirrorDoc the editor doc
 * @param editorChange the change
 */
function updateAutomergeDoc(doc, getText, codeMirrorDoc, editorChange) {
  return automerge_1.default.change(doc, function (draft) {
    var text = getText(draft)
    if (!text) return
    var startPos = codeMirrorDoc.indexFromPos(editorChange.from)
    var removedLines = editorChange.removed || []
    var addedLines = editorChange.text
    var removedLength =
      removedLines.reduce(function (sum, remove) {
        return sum + remove.length + 1
      }, 0) - 1
    if (removedLength > 0) {
      text.deleteAt(startPos, removedLength)
    }
    var addedText = addedLines.join('\n')
    if (addedText.length > 0) {
      text.insertAt.apply(text, __spread([startPos], addedText.split('')))
    }
  })
}
exports.default = updateAutomergeDoc
//# sourceMappingURL=updateAutomergeDoc.js.map
