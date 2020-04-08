'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
var assert_1 = __importDefault(require('assert'))
require('./codeMirrorEnv')
var automerge_1 = __importDefault(require('automerge'))
var automergeCodeMirror_1 = __importDefault(require('../src/automergeCodeMirror'))
var codemirror_1 = __importDefault(require('codemirror'))
describe('automergeCodeMirror', function () {
  var doc
  var getDoc = function () {
    return doc
  }
  var setDoc = function (newDoc) {
    return (doc = newDoc)
  }
  var getText = function (doc) {
    return doc.text
  }
  var host
  var codeMirror
  beforeEach(function () {
    doc = automerge_1.default.from({ text: new automerge_1.default.Text() })
    host = document.body.appendChild(document.createElement('div'))
    codeMirror = codemirror_1.default(host)
  })
  afterEach(function () {
    host.remove()
  })
  describe('Automerge => CodeMirror', function () {
    it('handles 2 consecutive Automerge changes', function () {
      var _a = automergeCodeMirror_1.default(doc),
        updateCodeMirrors = _a.updateCodeMirrors,
        connectCodeMirror = _a.connectCodeMirror
      var disconnectCodeMirror = connectCodeMirror(codeMirror, getDoc, setDoc, getText)
      doc = automerge_1.default.change(doc, function (draft) {
        return draft.text.insertAt(0, 'hello')
      })
      updateCodeMirrors(doc)
      assert_1.default.strictEqual(codeMirror.getValue(), 'hello')
      doc = automerge_1.default.change(doc, function (draft) {
        return draft.text.insertAt(0, 'world')
      })
      updateCodeMirrors(doc)
      assert_1.default.strictEqual(codeMirror.getValue(), 'worldhello')
      disconnectCodeMirror()
    })
    it('ignores Automerge changes after disconnection', function () {
      var _a = automergeCodeMirror_1.default(doc),
        updateCodeMirrors = _a.updateCodeMirrors,
        connectCodeMirror = _a.connectCodeMirror
      var disconnectCodeMirror = connectCodeMirror(codeMirror, getDoc, setDoc, getText)
      doc = automerge_1.default.change(doc, function (draft) {
        return draft.text.insertAt(0, 'hello')
      })
      updateCodeMirrors(doc)
      assert_1.default.strictEqual(codeMirror.getValue(), 'hello')
      disconnectCodeMirror()
      doc = automerge_1.default.change(doc, function (draft) {
        return draft.text.insertAt(0, 'world')
      })
      updateCodeMirrors(doc)
      assert_1.default.strictEqual(codeMirror.getValue(), 'hello')
    })
  })
  describe('CodeMirror => Automerge', function () {
    it('handles 2 consecutive CodeMirror changes', function () {
      var connectCodeMirror = automergeCodeMirror_1.default(doc).connectCodeMirror
      var disconnectCodeMirror = connectCodeMirror(codeMirror, getDoc, setDoc, getText)
      // doc = Automerge.change(doc, draft => draft.text.insertAt!(0, 'hello'))
      codeMirror.replaceRange('hello', codeMirror.posFromIndex(0))
      assert_1.default.strictEqual(codeMirror.getValue(), 'hello')
      assert_1.default.strictEqual(doc.text.toString(), 'hello')
      codeMirror.replaceRange('world', codeMirror.posFromIndex(0))
      assert_1.default.strictEqual(codeMirror.getValue(), 'worldhello')
      assert_1.default.strictEqual(doc.text.toString(), 'worldhello')
      disconnectCodeMirror()
    })
  })
})
//# sourceMappingURL=automergeCodeMirrorTest.js.map
