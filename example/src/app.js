const Automerge = require('automerge')
const CodeMirror = require('codemirror')
const AutomergeCodeMirror = require('../../index')

const leftDocSet = new Automerge.DocSet()
const rightDocSet = new Automerge.DocSet()

let leftConnection, rightConnection
leftConnection = new Automerge.Connection(leftDocSet, message =>
  rightConnection.receiveMsg(message)
)
rightConnection = new Automerge.Connection(rightDocSet, message =>
  leftConnection.receiveMsg(message)
)
leftConnection.open()
rightConnection.open()

const findText = doc => doc.text

const leftCodeMirror = CodeMirror(document.getElementById('left'))
leftDocSet.registerHandler(
  AutomergeCodeMirror.docSetHandler(
    leftDocSet,
    findText,
    (/* docId */) => leftCodeMirror,
    'left'
  )
)

const rightCodeMirror = CodeMirror(document.getElementById('right'))
rightDocSet.registerHandler(
  AutomergeCodeMirror.docSetHandler(
    rightDocSet,
    findText,
    (/* docId */) => rightCodeMirror,
    'right'
  )
)

const leftDoc = Automerge.changeset(
  Automerge.init(),
  doc => (doc.text = 'hello'.split(''))
)

leftDocSet.setDoc('DOC', leftDoc)
