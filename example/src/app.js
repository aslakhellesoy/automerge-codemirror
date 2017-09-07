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

document
  .querySelector('#left-connected')
  .addEventListener(
    'change',
    e => (e.target.checked ? leftConnection.open() : leftConnection.close())
  )

document
  .querySelector('#right-connected')
  .addEventListener(
    'change',
    e => (e.target.checked ? rightConnection.open() : rightConnection.close())
  )

const leftDoc = Automerge.changeset(
  Automerge.init(),
  doc => (doc.text = 'hello'.split(''))
)

leftDocSet.setDoc('DOC', leftDoc)
