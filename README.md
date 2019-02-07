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

const codeMirror = CodeMirror(document.getElementById('editor'))
// A function returning the Automerge.Text object within the Automerge document
const getDocText = doc => doc.text
// A function that gets called whenever the Automerge document is updated by editor changes
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
```

## Demo

Build it:

    yarn build-example

Open `example/index.html`
