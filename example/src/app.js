const Automerge = require('automerge')
const CodeMirror = require('codemirror')
const AutomergeCodeMirror = require('../../index')

const leftDoc = Automerge.change(
  Automerge.init(),
  doc => (doc.text = new Automerge.Text())
)
const leftWatchableDoc = new Automerge.WatchableDoc(leftDoc)

const leftCodeMirror = CodeMirror(document.getElementById('left'))
leftCodeMirror.on(
  'change',
  AutomergeCodeMirror.updateAutomergeHandler(leftWatchableDoc)
)

leftWatchableDoc.registerHandler(
  AutomergeCodeMirror.updateCodeMirrorHandler(leftCodeMirror)
)

const rightCodeMirror = CodeMirror(document.getElementById('right'))
rightCodeMirror.on(
  'change',
  AutomergeCodeMirror.updateAutomergeHandler(rightDoc)
)
rightDocSet.registerHandler(
  AutomergeCodeMirror.updateCodeMirrorHandler(rightCodeMirror)
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
