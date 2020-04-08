'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
var automerge_1 = __importDefault(require('automerge'))
var updateAutomergeDoc_1 = __importDefault(require('./updateAutomergeDoc'))
function makeCodeMirrorChangeHandler(getDoc, setDoc, getText, mutex) {
  var text = getText(getDoc())
  if (!text) {
    throw new Error('Cannot connect CodeMirror. Did not find text in ' + JSON.stringify(getDoc()))
  }
  var textObjectId = automerge_1.default.getObjectId(text)
  var codeMirrorChangeHandler = function (editor, change) {
    if (change.origin !== 'automerge') {
      mutex.lock()
      var doc = updateAutomergeDoc_1.default(getDoc(), getText, editor.getDoc(), change)
      setDoc(doc)
      mutex.release()
    }
  }
  return { textObjectId: textObjectId, codeMirrorChangeHandler: codeMirrorChangeHandler }
}
exports.default = makeCodeMirrorChangeHandler
//# sourceMappingURL=makeCodeMirrorChangeHandler.js.map
