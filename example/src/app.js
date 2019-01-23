const Automerge = require('automerge')
const CodeMirror = require('codemirror')
const automergeCodeMirror = require('../../index')

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
  const getDocText = doc => doc.text

  let called = false

  function handler(updatedDocId, updatedDoc) {
    if (updatedDocId !== docId) {
      return
    }
    if (!getDocText(updatedDoc)) {
      return
    }
    docSet.unregisterHandler(handler)
    if (called) return
    called = true
    const $e = document.getElementById(domId)
    const codeMirror = CodeMirror($e)

    const docSetHandlers = new Map()

    function getDocSetHandler(handler) {
      let docSetHandler = docSetHandlers.get(handler)
      if (!docSetHandler) {
        docSetHandler = (updatedDocId, updatedDoc) => {
          if (updatedDocId === docId) {
            handler(updatedDoc)
          }
        }
        console.log(`New docSetHandler for ${handler}`)
        docSetHandlers.set(handler, docSetHandler())
      }
      if (!docSetHandler) {
        console.log(`Handlers: ${docSetHandlers.size}`)
        throw new Error(`No docSetHandler for ${handler}`)
      }
      console.log('found one')
      return docSetHandler
    }

    automergeCodeMirror({
      codeMirror,
      getDocText,
      doc: docSet.getDoc(docId),
      updateDoc: doc => docSet.setDoc(docId, doc),
      registerHandler: handler =>
        docSet.registerHandler(getDocSetHandler(handler)),
      unregisterHandler: handler =>
        docSet.unregisterHandler(getDocSetHandler(handler)),
    })
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
