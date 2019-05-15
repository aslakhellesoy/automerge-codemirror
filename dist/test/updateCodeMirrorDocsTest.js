'use strict'
var __read =
  (this && this.__read) ||
  function(o, n) {
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
  function() {
    for (var ar = [], i = 0; i < arguments.length; i++)
      ar = ar.concat(__read(arguments[i]))
    return ar
  }
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
var assert_1 = __importDefault(require('assert'))
require('./codeMirrorEnv')
var automerge_1 = __importDefault(require('automerge'))
var updateCodeMirrorDocs_1 = __importDefault(
  require('../src/updateCodeMirrorDocs')
)
var codemirror_1 = __importDefault(require('codemirror'))
var random_1 = require('./random')
var Mutex_1 = __importDefault(require('../src/Mutex'))
var getText = function(doc) {
  return doc.text
}
describe('updateCodeMirrorDocs', function() {
  var div
  beforeEach(function() {
    div = document.createElement('div')
    document.body.appendChild(div)
  })
  it('adds new text', function() {
    var doc1 = automerge_1.default.init()
    var doc2 = automerge_1.default.change(doc1, function(editableDoc) {
      var _a
      editableDoc.text = new automerge_1.default.Text()
      ;(_a = editableDoc.text).insertAt.apply(
        _a,
        __spread([0], 'HELLO'.split(''))
      )
    })
    var doc3 = automerge_1.default.change(doc2, function(editableDoc) {
      var _a
      ;(_a = editableDoc.text).insertAt.apply(
        _a,
        __spread([5], 'WORLD'.split(''))
      )
    })
    var codeMirror = codemirror_1.default(div)
    var links = new Set([
      {
        codeMirror: codeMirror,
        getText: getText,
        processingEditorChange: false,
      },
    ])
    var mutex = new Mutex_1.default()
    updateCodeMirrorDocs_1.default(doc1, doc2, links, mutex)
    assert_1.default.deepStrictEqual(codeMirror.getValue(), doc2.text.join(''))
    updateCodeMirrorDocs_1.default(doc2, doc3, links, mutex)
    assert_1.default.deepStrictEqual(codeMirror.getValue(), doc3.text.join(''))
  })
  for (var n = 0; n < 10; n++) {
    it('works with random edits (fuzz test ' + n + ')', function() {
      var doc = automerge_1.default.change(automerge_1.default.init(), function(
        doc
      ) {
        doc.text = new automerge_1.default.Text()
      })
      var codeMirror = codemirror_1.default(div)
      var links = new Set([
        {
          codeMirror: codeMirror,
          getText: getText,
          processingEditorChange: false,
        },
      ])
      var mutex = new Mutex_1.default()
      for (var t = 0; t < 10; t++) {
        var newDoc = monkeyModify(doc)
        updateCodeMirrorDocs_1.default(doc, newDoc, links, mutex)
        doc = newDoc
      }
      assert_1.default.deepStrictEqual(doc.text.join(''), codeMirror.getValue())
    })
  }
})
function monkeyModify(doc) {
  var textLength = doc.text.length
  var index = Math.floor(Math.random() * textLength)
  // const from = cm.posFromIndex(index)
  var editLength = random_1.randomPositiveInt(10)
  if (Math.random() < 0.7) {
    // Add text
    doc = automerge_1.default.change(doc, function(editableDoc) {
      var _a
      ;(_a = editableDoc.text).splice.apply(
        _a,
        __spread([index, 0], random_1.randomString(editLength).split(''))
      )
    })
  } else {
    var endIndex_1 = Math.min(index + editLength, textLength - index)
    doc = automerge_1.default.change(doc, function(editableDoc) {
      editableDoc.text.splice(index, endIndex_1)
    })
  }
  return doc
}
//# sourceMappingURL=updateCodeMirrorDocsTest.js.map
