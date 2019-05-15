'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
var updateAutomergeDoc_1 = __importDefault(require('./updateAutomergeDoc'))
function makeCodeMirrorChangeHandler(watchableDoc, getText, mutex) {
  return function(editor, change) {
    if (change.origin !== 'automerge') {
      mutex.lock()
      var doc = updateAutomergeDoc_1.default(
        watchableDoc.get(),
        getText,
        editor.getDoc(),
        change
      )
      watchableDoc.set(doc)
      mutex.release()
    }
  }
}
exports.default = makeCodeMirrorChangeHandler
//# sourceMappingURL=makeCodeMirrorChangeHandler.js.map
