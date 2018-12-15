# Automerge-CodeMirror

[![Build Status](https://travis-ci.org/aslakhellesoy/automerge-codemirror.svg?branch=master)](https://travis-ci.org/aslakhellesoy/automerge-codemirror)

Automerge-CodeMirror links a CodeMirror instance to an `Automerge.Text` object.

## Installation

    npm install automerge-codemirror

## Usage

```javascript
const AutomergeCodeMirror = require('automerge-codemirror')

const codeMirror = CodeMirror(document.getElementById('editor'))
const acm = new AutomergeCodeMirror(
  codeMirror, // The CodeMirror editor to sync with
  docSet, // An Automerge.DocSet instance
  docId, // A string, identifying the document in the docSet
  doc => doc.text // A function returning the Automerge.Text object within the Automerge document
)
acm.start() // Start bidirectional syncronisation
```

Automerge-CodeMirror is designed to be used with `Automerge.Connection` to synchronise changes with
other peers. See the [Automerge](https://github.com/automerge/automerge) documentation for details.

## Demo

Build it:

    yarn build-example

Open `example/index.html`
