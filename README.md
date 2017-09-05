# Automerge-CodeMirror

[![Build Status](https://travis-ci.org/aslakhellesoy/automerge-codemirror.svg?branch=master)](https://travis-ci.org/aslakhellesoy/automerge-codemirror)

Automerge-CodeMirror links a CodeMirror instance to an `Array` of single-character strings in an Automerge document.

When the CodeMirror text is changed, the linked `Array` in the Automerge document is updated via the `Automerge#changeset`
method.

When the `Array` in the Automerge document is changed, CodeMirror's value is updated via the `CodeMirror#replaceRange`
method.

## TODO

* Implement Automerge->CodeMirror sync (only CodeMirror->Automerge is currently implemented)
* Set up a demo
