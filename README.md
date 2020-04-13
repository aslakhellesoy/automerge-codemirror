# Automerge-CodeMirror

![Node.js CI](https://github.com/aslakhellesoy/automerge-codemirror/workflows/Node.js%20CI/badge.svg)

Automerge-CodeMirror brings collaborative editing to CodeMirror by linking it to
an `Automerge.Text` object.

You can have as many `Automerge.Text` objects as you want inside a single Automerge document, and link each of them to
a separate CodeMirror instance. This is useful for applications that render many editable text areas (such as a
Trello-like application with multiple cards).

It ships with a React component, but can also be used without React.

## Installation

    npm install automerge-codemirror

## Live Demo

[Check it out here](https://aslakhellesoy.github.io/automerge-codemirror)

To run it locally:

    yarn storybook

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
