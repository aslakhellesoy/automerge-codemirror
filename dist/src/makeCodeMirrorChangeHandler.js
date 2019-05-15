'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
var updateAutomergeDoc_1 = __importDefault(require('./updateAutomergeDoc'))
function makeCodeMirrorChangeHandler(
  getAutomergeDoc,
  getText,
  setAutomergeDoc,
  mutex
) {
  return function(editor, change) {
    if (change.origin !== 'automerge') {
      mutex.lock()
      var doc = updateAutomergeDoc_1.default(
        getAutomergeDoc(),
        getText,
        editor.getDoc(),
        change
      )
      setAutomergeDoc(doc)
      mutex.release()
    }
  }
}
exports.default = makeCodeMirrorChangeHandler
//# sourceMappingURL=makeCodeMirrorChangeHandler.js.map
