# Automerge-CodeMirror

[![Build Status](https://travis-ci.org/aslakhellesoy/automerge-codemirror.svg?branch=master)](https://travis-ci.org/aslakhellesoy/automerge-codemirror)

Automerge-CodeMirror brings collaborative editing to CodeMirror by linking it to
an `Automerge.Text` object.

You can have as many `Automerge.Text` objects as you want inside a single Automerge document, and link each of them to
a separate CodeMirror instance. This is useful for applications that render many editable text areas (such as a
Trello-like application with multiple cards).

It ships with a React component, but can also be used without React.

## Installation

    npm install automerge-codemirror

## Demo

    yarn storybook

![example](./example.gif)

What you see above is 3 Automerge documents synchronised without a network, but it works equally
well over a network.

## General Usage

```typescript
import { automergeCodeMirror } from 'automerge-codemirror'

// Create a connect function linked to an Automerge document
const connectCodeMirror = automergeCodeMirror(watchableDoc)

// Connect a CodeMirror instance
const getText = (doc) => doc.text
const disconnectCodeMirror = connectCodeMirror(codeMirror, getText)

// Disconnect the CodeMirror instance
disconnectCodeMirror()
```

## React Usage

```typescript jsx
import { automergeCodeMirror } from 'automerge-codemirror'

// Create a connect function linked to an Automerge document
const connectCodeMirror = automergeCodeMirror(watchableDoc)

// Connect a CodeMirror instance
const getText = (doc) => doc.text
const acm = (
  <AutomergeCodeMirror
    makeCodeMirror={(element) => CodeMirror(element)}
    connectCodeMirror={connectCodeMirror}
    getText={getText}
  />
)
```

## Synchronisation with other peers

Automerge-CodeMirror is agnostic of how you choose to synchronize the linked Automerge document
with other peers. Just register a handler with the `WatchableDoc` that does the synchronization.
