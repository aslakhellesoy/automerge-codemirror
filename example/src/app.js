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

const leftDoc = Automerge.changeset(Automerge.init(), doc => (doc.text = []))

const docId = 'DOC'
leftDocSet.setDoc(docId, leftDoc)
const findText = doc => doc.text
const textObjectId = findText(leftDoc)._objectId

const leftCodeMirror = CodeMirror(document.getElementById('left'))
leftCodeMirror.on(
  'change',
  AutomergeCodeMirror.updateAutomergeHandler(leftDocSet, docId, findText)
)
leftDocSet.registerHandler(
  AutomergeCodeMirror.updateCodeMirrorHandler(
    objectId => (objectId === textObjectId ? leftCodeMirror : null)
  )
)

const rightCodeMirror = CodeMirror(document.getElementById('right'))
rightCodeMirror.on(
  'change',
  AutomergeCodeMirror.updateAutomergeHandler(rightDocSet, docId, findText)
)
rightDocSet.registerHandler(
  AutomergeCodeMirror.updateCodeMirrorHandler(
    objectId => (objectId === textObjectId ? rightCodeMirror : null)
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
