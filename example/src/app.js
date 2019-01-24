const Automerge = require('automerge')
const CodeMirror = require('codemirror')
const automergeCodeMirror = require('../../index')

const docId = 'doc-id'

let leftConnection
let rightConnection

const leftDocSet = new Automerge.DocSet()
leftConnection = new Automerge.Connection(leftDocSet, msg =>
  rightConnection.receiveMsg(msg)
)
leftConnection.open()

const rightDocSet = new Automerge.DocSet()
rightConnection = new Automerge.Connection(rightDocSet, msg =>
  leftConnection.receiveMsg(msg)
)
rightConnection.open()

function createCodeMirror(docSet, domId) {
  const $e = document.getElementById(domId)
  const codeMirror = CodeMirror($e)
  const getDocText = doc => doc.text
  const updateDoc = doc => docSet.setDoc(docId, doc)
  const { automergeHandler, codeMirrorHandler } = automergeCodeMirror({
    codeMirror,
    getDocText,
    updateDoc,
  })
  codeMirror.on('change', codeMirrorHandler)
  docSet.registerHandler((updatedDocId, updatedDoc) => {
    if (updatedDocId === docId) {
      automergeHandler(updatedDoc)
    }
  })
}

createCodeMirror(rightDocSet, 'right')
createCodeMirror(leftDocSet, 'left')

rightDocSet.setDoc(
  docId,
  Automerge.change(Automerge.init(), doc => (doc.text = new Automerge.Text()))
)
