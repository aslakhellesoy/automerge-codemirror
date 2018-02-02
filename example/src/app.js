const Automerge = require('automerge')
const CodeMirror = require('codemirror')
const AutomergeCodeMirror = require('../../index')

/// LEFT
const leftCodeMirror = CodeMirror(document.getElementById('left'))
const leftWatchableDoc = new Automerge.WatchableDoc(Automerge.init())
const left = new AutomergeCodeMirror.AutomergeCodeMirror(
  leftCodeMirror,
  leftWatchableDoc
)
left.connect()

/// RIGHT

const rightCodeMirror = CodeMirror(document.getElementById('right'))
const rightWatchableDoc = new Automerge.WatchableDoc(Automerge.init())
const right = new AutomergeCodeMirror.AutomergeCodeMirror(
  rightCodeMirror,
  rightWatchableDoc
)
right.connect()

// NETWORK

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

// document
//   .querySelector('#left-connected')
//   .addEventListener(
//     'change',
//     e => (e.target.checked ? leftConnection.open() : leftConnection.close())
//   )
//
// document
//   .querySelector('#right-connected')
//   .addEventListener(
//     'change',
//     e => (e.target.checked ? rightConnection.open() : rightConnection.close())
//   )
