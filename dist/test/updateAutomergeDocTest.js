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
var updateAutomergeDoc_1 = __importDefault(require('../src/updateAutomergeDoc'))
var codemirror_1 = __importDefault(require('codemirror'))
var random_1 = require('./random')
var getText = function (doc) {
  return doc.text
}
describe('updateAutomergeDoc', function () {
  var div
  beforeEach(function () {
    div = document.createElement('div')
    document.body.appendChild(div)
  })
  it('adds new text', function () {
    var oldDoc = automerge_1.default.change(automerge_1.default.init(), function (draft) {
      return (draft.text = new automerge_1.default.Text())
    })
    var newDoc
    var codeMirror = codemirror_1.default(div)
    codeMirror.on('change', function (editor, change) {
      newDoc = updateAutomergeDoc_1.default(oldDoc, getText, editor.getDoc(), change)
    })
    codeMirror.getDoc().replaceRange('HELLO', { line: 0, ch: 0 })
    assert_1.default.deepStrictEqual('HELLO', newDoc.text.join(''))
  })
  for (var n = 0; n < 10; n++) {
    it('works with random edits (fuzz test ' + n + ')', function () {
      var doc = automerge_1.default.change(automerge_1.default.init(), function (draft) {
        draft.text = new automerge_1.default.Text()
      })
      var codeMirror = codemirror_1.default(div)
      codeMirror.on('change', function (editor, change) {
        doc = updateAutomergeDoc_1.default(doc, getText, editor.getDoc(), change)
      })
      for (var t = 0; t < 10; t++) {
        monkeyType(codeMirror.getDoc())
      }
      assert_1.default.deepStrictEqual(doc.text.join(''), codeMirror.getValue())
    })
  }
})
function monkeyType(codeMirrorDoc) {
  var textLength = codeMirrorDoc.getValue().length
  var index = Math.floor(Math.random() * textLength)
  var from = codeMirrorDoc.posFromIndex(index)
  var editLength = random_1.randomPositiveInt(10)
  if (Math.random() < 0.7) {
    // Add text
    var text = random_1.randomString(editLength)
    codeMirrorDoc.replaceRange(text, codeMirrorDoc.posFromIndex(index))
  } else {
    var endIndex = Math.max(index + editLength, textLength - index)
    var to = codeMirrorDoc.posFromIndex(endIndex)
    codeMirrorDoc.replaceRange('', from, to)
  }
}
//# sourceMappingURL=updateAutomergeDocTest.js.map
