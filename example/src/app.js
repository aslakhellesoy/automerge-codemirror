const Automerge = require('automerge')
const CodeMirror = require('codemirror')
const AutomergeCodeMirror = require('../../index')

const leftWatchableDoc = new Automerge.WatchableDoc(Automerge.init())
const rightWatchableDoc = new Automerge.WatchableDoc(Automerge.init())

// SIMULATE NETWORK

let oldLeftDoc = leftWatchableDoc.get()
leftWatchableDoc.registerHandler(newLeftDoc => {
  const changes = Automerge.getChanges(oldLeftDoc, newLeftDoc)
  oldLeftDoc = newLeftDoc
  if (changes.length === 0) return
  rightWatchableDoc.applyChanges(changes)
})

let oldRightDoc = rightWatchableDoc.get()
rightWatchableDoc.registerHandler(newRightDoc => {
  const changes = Automerge.getChanges(oldRightDoc, newRightDoc)
  oldRightDoc = newRightDoc
  if (changes.length === 0) return
  leftWatchableDoc.applyChanges(changes)
})

// CREATE CODEMIRROR WHEN TEXT FIRST UPDATES
function createCodeMirrorOnDocChange(watchableDoc, domId) {
  let called = false
  function handler() {
    watchableDoc.unregisterHandler(handler)
    if (called) return
    called = true
    const $e = document.getElementById(domId)
    const codeMirror = CodeMirror($e)
    const acm = new AutomergeCodeMirror(
      codeMirror,
      leftWatchableDoc,
      doc => doc.text
    )
    acm.start()
  }
  watchableDoc.registerHandler(handler)
}

createCodeMirrorOnDocChange(rightWatchableDoc, 'right')
createCodeMirrorOnDocChange(leftWatchableDoc, 'left')

// INJECT TEXT
rightWatchableDoc.set(
  Automerge.change(
    rightWatchableDoc.get(),
    doc => (doc.text = new Automerge.Text())
  )
)
