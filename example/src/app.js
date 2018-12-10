const Automerge = require('automerge')
const CodeMirror = require('codemirror')
const AutomergeCodeMirror = require('../../index')

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

// CREATE CODEMIRROR WHEN TEXT FIRST UPDATES
function createCodeMirrorOnDocChange(docSet, docId, domId) {
  let called = false
  function handler() {
    docSet.unregisterHandler(handler)
    if (called) return
    called = true
    const $e = document.getElementById(domId)
    const codeMirror = CodeMirror($e)
    const acm = new AutomergeCodeMirror(
      codeMirror,
      docSet,
      docId,
      doc => doc.text
    )
    acm.start()
  }
  docSet.registerHandler(handler)
}

const docId = 'doc-id'

createCodeMirrorOnDocChange(rightDocSet, docId, 'right')
createCodeMirrorOnDocChange(leftDocSet, docId, 'left')

// INJECT TEXT
rightDocSet.setDoc(
  docId,
  Automerge.change(Automerge.init(), doc => (doc.text = new Automerge.Text()))
)
