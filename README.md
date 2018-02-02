# Automerge-CodeMirror

[![Build Status](https://travis-ci.org/aslakhellesoy/automerge-codemirror.svg?branch=master)](https://travis-ci.org/aslakhellesoy/automerge-codemirror)

Automerge-CodeMirror links a CodeMirror instance to a `Automerge.Text` object. Simply create an `Automerge.Doc` and
Automerge-CodeMirror will link to the doc's `text` property.

When the CodeMirror text is changed, the linked `Automerge.Text` in the Automerge document is updated via the `Automerge#change`
method.

When the `Automerge.Text` in the Automerge document is changed (by syncing with external documents), CodeMirror's value is updated via the `CodeMirror#replaceRange`
method.

## Demo

Build it:

    yarn build-example

Open `example/index.html`
