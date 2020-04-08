'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
var updateCodeMirrorDocs_1 = __importDefault(require('./updateCodeMirrorDocs'))
var makeCodeMirrorChangeHandler_1 = __importDefault(require('./makeCodeMirrorChangeHandler'))
var Mutex_1 = __importDefault(require('./Mutex'))
function automergeCodeMirror(doc) {
  var mutex = new Mutex_1.default()
  var codeMirrorMap = new Map()
  function getCodeMirror(textObjectId) {
    return codeMirrorMap.get(textObjectId)
  }
  function connectCodeMirror(codeMirror, getDoc, setDoc, getText) {
    var _a = makeCodeMirrorChangeHandler_1.default(getDoc, setDoc, getText, mutex),
      textObjectId = _a.textObjectId,
      codeMirrorChangeHandler = _a.codeMirrorChangeHandler
    codeMirror.on('change', codeMirrorChangeHandler)
    codeMirrorMap.set(textObjectId, codeMirror)
    function disconnectCodeMirror() {
      codeMirror.off('change', codeMirrorChangeHandler)
      codeMirrorMap.delete(textObjectId)
    }
    return disconnectCodeMirror
  }
  function updateCodeMirrors(newDoc) {
    doc = updateCodeMirrorDocs_1.default(doc, newDoc, getCodeMirror, mutex)
  }
  return { connectCodeMirror: connectCodeMirror, updateCodeMirrors: updateCodeMirrors }
}
exports.default = automergeCodeMirror
//# sourceMappingURL=automergeCodeMirror.js.map
