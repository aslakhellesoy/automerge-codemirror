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
var codemirror_1 = __importDefault(require('codemirror'))
var updateCodeMirrorDocs_1 = __importDefault(require('../src/updateCodeMirrorDocs'))
var makeCodeMirrorChangeHandler_1 = __importDefault(require('../src/makeCodeMirrorChangeHandler'))
var Mutex_1 = __importDefault(require('../src/Mutex'))
var getText = function (doc) {
  return doc.text
}
describe('concurrent editing', function () {
  var leftElement
  var rightElement
  beforeEach(function () {
    leftElement = document.body.appendChild(document.createElement('div'))
    rightElement = document.body.appendChild(document.createElement('div'))
  })
  it('syncs', function () {
    /*
        TODO: Externalise the Doc<->Doc synchronisation
        It should be agnostic of mechanism (DocSet, Connection, Roomservice, Automerge.merge etc)
    
        What does this API look like??? Make a functional API with inspiration from:
    
        - My own drawings
        - RoomService
        - Automerge.merge
        - DocSet/Connection
    
    
         */
    function leftSync(newDoc) {
      var newRight = automerge_1.default.merge(right, newDoc)
      right = updateCodeMirrorDocs_1.default(right, newRight, rightGetCodeMirror, rightMutex)
    }
    function rightSync(newDoc) {
      var newLeft = automerge_1.default.merge(left, newDoc)
      left = updateCodeMirrorDocs_1.default(left, newLeft, leftGetCodeMirror, leftMutex)
    }
    var left = automerge_1.default.change(automerge_1.default.init(), function (doc) {
      doc.text = new automerge_1.default.Text()
    })
    var leftCodeMirror = codemirror_1.default(leftElement)
    var leftMutex = new Mutex_1.default()
    function leftSetDoc(newDoc) {
      left = updateCodeMirrorDocs_1.default(left, newDoc, leftGetCodeMirror, leftMutex)
      leftSync(newDoc)
    }
    var leftCodeMirrorMap = new Map()
    function leftGetCodeMirror(textObjectId) {
      return leftCodeMirrorMap.get(textObjectId)
    }
    var _a = makeCodeMirrorChangeHandler_1.default(
        function () {
          return left
        },
        leftSetDoc,
        getText,
        leftMutex
      ),
      leftTextObjectId = _a.textObjectId,
      leftCodeMirrorChangeHandler = _a.codeMirrorChangeHandler
    leftCodeMirrorMap.set(leftTextObjectId, leftCodeMirror)
    leftCodeMirror.on('change', leftCodeMirrorChangeHandler)
    var right = automerge_1.default.init()
    function rightSetDoc(newDoc) {
      right = updateCodeMirrorDocs_1.default(right, newDoc, rightGetCodeMirror, rightMutex)
      rightSync(newDoc)
    }
    right = automerge_1.default.merge(right, left)
    var rightCodeMirror = codemirror_1.default(rightElement)
    var rightMutex = new Mutex_1.default()
    var rightCodeMirrorMap = new Map()
    function rightGetCodeMirror(textObjectId) {
      return rightCodeMirrorMap.get(textObjectId)
    }
    var _b = makeCodeMirrorChangeHandler_1.default(
        function () {
          return right
        },
        rightSetDoc,
        getText,
        rightMutex
      ),
      rightTextObjectId = _b.textObjectId,
      rightCodeMirrorChangeHandler = _b.codeMirrorChangeHandler
    rightCodeMirrorMap.set(rightTextObjectId, rightCodeMirror)
    rightCodeMirror.on('change', rightCodeMirrorChangeHandler)
    // Type in editors
    leftCodeMirror.getDoc().replaceRange('-leftCodeMirror', { line: 0, ch: 0 })
    assertAllContain('-leftCodeMirror')
    rightCodeMirror.getDoc().replaceRange('-rightCodeMirror', { line: 0, ch: 0 })
    assertAllContain('-rightCodeMirror-leftCodeMirror')
    rightSetDoc(
      automerge_1.default.change(right, function (draft) {
        return draft.text.insertAt(0, '-rightAutoMerge')
      })
    )
    assertAllContain('-rightAutoMerge-rightCodeMirror-leftCodeMirror')
    leftSetDoc(
      automerge_1.default.change(left, function (draft) {
        return draft.text.insertAt(0, '-leftAutoMerge')
      })
    )
    assertAllContain('-leftAutoMerge-rightAutoMerge-rightCodeMirror-leftCodeMirror')
    function assertAllContain(text) {
      assert_1.default.strictEqual(leftCodeMirror.getValue(), text)
      assert_1.default.strictEqual(rightCodeMirror.getValue(), text)
      assert_1.default.strictEqual(left.text.toString(), text)
      assert_1.default.strictEqual(right.text.toString(), text)
    }
  })
})
//# sourceMappingURL=concurrentEditingTest.js.map
