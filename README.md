# Automerge-CodeMirror

[![Build Status](https://travis-ci.org/aslakhellesoy/automerge-codemirror.svg?branch=master)](https://travis-ci.org/aslakhellesoy/automerge-codemirror)

Automerge-CodeMirror links a CodeMirror instance to an `Automerge.Text` object.

## Installation

    npm install automerge-codemirror

## Usage

```javascript
const automergeCodeMirror = require('automerge-codemirror')

const codeMirror = CodeMirror(document.getElementById('editor'))
const getDocText = doc => doc.text
const updateDoc = doc => docSet.setDoc(docId, doc)

const { automergeHandler, codeMirrorHandler } = new automergeCodeMirror({
  codeMirror, // The CodeMirror editor to sync with
  getDocText, // A function returning the Automerge.Text object within the Automerge document
  updateDoc, // A function that captures the updated Automerge document (whenever the editor changes)
})

codeMirror.on('change', codeMirrorHandler)
docSet.registerHandler(automergeHandler)
```

Automerge-CodeMirror is agnostic of how you choose to synchronize the Automerge document
with other peers. You can use `Automerge.DocSet` / `Automerge.Connection`, but you can also
use any other mechanism.

See the [Automerge](https://github.com/automerge/automerge) documentation for details.

## Demo

Build it:

    yarn build-example

Open `example/index.html`
