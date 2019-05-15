'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
var assert_1 = __importDefault(require('assert'))
require('./codeMirrorEnv')
var automerge_1 = require('automerge')
var codemirror_1 = __importDefault(require('codemirror'))
var updateCodeMirrorDocs_1 = __importDefault(
  require('../src/updateCodeMirrorDocs')
)
var makeCodeMirrorChangeHandler_1 = __importDefault(
  require('../src/makeCodeMirrorChangeHandler')
)
var Mutex_1 = __importDefault(require('../src/Mutex'))
var DocSetWatchableDoc_1 = __importDefault(require('../src/DocSetWatchableDoc'))
var getText = function(doc) {
  return doc.text
}
describe('concurrent editing', function() {
  var leftDiv
  var rightDiv
  beforeEach(function() {
    leftDiv = document.createElement('div')
    document.body.appendChild(leftDiv)
    rightDiv = document.createElement('div')
    document.body.appendChild(rightDiv)
  })
  it('syncs', function() {
    var leftConnection
    var rightConnection
    var leftDocSet = new automerge_1.DocSet()
    leftConnection = new automerge_1.Connection(leftDocSet, function(msg) {
      rightConnection.receiveMsg(msg)
    })
    var rightDocSet = new automerge_1.DocSet()
    rightConnection = new automerge_1.Connection(rightDocSet, function(msg) {
      leftConnection.receiveMsg(msg)
    })
    leftConnection.open()
    rightConnection.open()
    var left = automerge_1.change(automerge_1.init(), function(doc) {
      doc.text = new automerge_1.Text()
    })
    leftDocSet.setDoc('id', left)
    var right = rightDocSet.getDoc('id')
    assert_1.default.strictEqual(right.text.join(''), left.text.join(''))
    var leftCodeMirror = codemirror_1.default(leftDiv)
    var leftLink = {
      codeMirror: leftCodeMirror,
      getText: getText,
    }
    var leftWatchableDoc = new DocSetWatchableDoc_1.default(leftDocSet, 'id')
    var leftMutex = new Mutex_1.default()
    var leftCodeMirrorChangeHandler = makeCodeMirrorChangeHandler_1.default(
      leftWatchableDoc,
      getText,
      leftMutex
    )
    leftCodeMirror.on('change', leftCodeMirrorChangeHandler)
    var leftLinks = new Set([leftLink])
    leftWatchableDoc.registerHandler(function(newDoc) {
      left = updateCodeMirrorDocs_1.default(left, newDoc, leftLinks, leftMutex)
    })
    var rightCodeMirror = codemirror_1.default(rightDiv)
    var rightLink = {
      codeMirror: rightCodeMirror,
      getText: getText,
    }
    var rightWatchableDoc = new DocSetWatchableDoc_1.default(rightDocSet, 'id')
    var rightMutex = new Mutex_1.default()
    var rightCodeMirrorChangeHandler = makeCodeMirrorChangeHandler_1.default(
      rightWatchableDoc,
      getText,
      rightMutex
    )
    rightCodeMirror.on('change', rightCodeMirrorChangeHandler)
    var rightLinks = new Set([rightLink])
    rightDocSet.registerHandler(function(_, newDoc) {
      right = updateCodeMirrorDocs_1.default(
        right,
        newDoc,
        rightLinks,
        rightMutex
      )
    })
    leftConnection.close()
    rightConnection.close()
    leftCodeMirror.getDoc().replaceRange('LEFT', { line: 0, ch: 0 })
    rightCodeMirror.getDoc().replaceRange('RIGHT', { line: 0, ch: 0 })
    leftConnection.open()
    rightConnection.open()
    assertEqualsOneOf(leftCodeMirror.getValue(), 'LEFTRIGHT', 'RIGHTLEFT')
    assertEqualsOneOf(rightCodeMirror.getValue(), 'LEFTRIGHT', 'RIGHTLEFT')
    assertEqualsOneOf(getText(left).join(''), 'LEFTRIGHT', 'RIGHTLEFT')
    assertEqualsOneOf(getText(right).join(''), 'LEFTRIGHT', 'RIGHTLEFT')
  })
})
function assertEqualsOneOf(actual) {
  var expected = []
  for (var _i = 1; _i < arguments.length; _i++) {
    expected[_i - 1] = arguments[_i]
  }
  assert_1.default.strictEqual(expected.length > 0, true)
  for (var i = 0; i < expected.length; i++) {
    try {
      assert_1.default.strictEqual(actual, expected[i])
      return // if we get here without an exception, that means success
    } catch (e) {
      if (!e.name.match(/^AssertionError/) || i === expected.length - 1) throw e
    }
  }
}
//# sourceMappingURL=concurrentEditingTest.js.map
