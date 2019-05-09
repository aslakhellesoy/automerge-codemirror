# Automerge-CodeMirror

[![Build Status](https://travis-ci.org/aslakhellesoy/automerge-codemirror.svg?branch=master)](https://travis-ci.org/aslakhellesoy/automerge-codemirror)

Automerge-CodeMirror brings collaborative editing to CodeMirror by linking it to
an `Automerge.Text` object.

## Installation

    npm install automerge-codemirror

## Usage

Automerge-CodeMirror is agnostic of how you choose to synchronize the linked Automerge document
with other peers. You can use `Automerge.DocSet` / `Automerge.Connection` (as the example below),
but you can also use any other mechanism supported by
[Automerge](https://github.com/automerge/automerge).

```javascript
const automergeCodeMirror = require('automerge-codemirror')

const docId = 'some-id'

const codeMirrorDoc = CodeMirror(document.getElementById('editor'))
// A function returning the Automerge.Text object within the Automerge document
const getDocText = doc => doc.text
// A function that gets called whenever the Automerge document is updated by editor changes
const setAutomergeDoc = doc => docSet.setDoc(docId, doc)

const { automergeHandler, codeMirrorHandler } = automergeCodeMirror({
  codeMirrorDoc,
  getDocText,
  setAutomergeDoc,
})

codeMirrorDoc.on('change', codeMirrorHandler)

docSet.registerHandler((updatedDocId, updatedDoc) => {
  if (updatedDocId === docId) {
    automergeHandler(updatedDoc)
  }
})
```

## Demo

Build it:

    yarn build-example

Open `example/index.html`

## TODO

If a document has multiple `Text` nodes, the implementation is inefficient because the
`diff` between an old and a new doc is calculated and processed for each `Text` node.

A more efficient implementation would only compute and process the diff once, and then
apply it to each CodeMirror instance.

```javascript
// Initialise an instance without any doc or editors
let automergeHandler = makeCodeMirrorAutomergeHandler(setAutomergeDoc)
acm = addCodeMirror(getDocText, codeMirrorDoc)
```

There is also a bug with concurrent editing - the diff is calculated against diverged
states. Not sure how to handle this yet.

So we need to rethink the design:

- Single traversal of diffs
