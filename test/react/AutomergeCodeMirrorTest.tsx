import '../codeMirrorEnv'
import { render, unmountComponentAtNode } from 'react-dom'
import CodeMirror from 'codemirror'
import Automerge from 'automerge'
import AutomergeCodeMirror from '../../src/react/AutomergeCodeMirror'
import { Mutex, updateCodeMirrorDocs } from '../../src'
import React from 'react'
import assert from 'assert'

interface TestDoc {
  text: Automerge.Text
}

describe('<AutomergeCodeMirror>', () => {
  let div: HTMLElement
  beforeEach(() => {
    div = document.createElement('div')
    document.body.appendChild(div)
  })

  afterEach(() => {
    unmountComponentAtNode(div)
    div.remove()
  })

  it('updates Automerge doc when CodeMirror doc changes', async () => {
    let codeMirror: CodeMirror.Editor

    function makeCodeMirror(host: HTMLElement) {
      codeMirror = CodeMirror(host)
      return codeMirror
    }

    let doc = Automerge.change(
      Automerge.init<TestDoc>(),
      (draft) => (draft.text = new Automerge.Text())
    )

    function getDoc() {
      return doc
    }

    function setDoc(newDoc: TestDoc) {
      doc = newDoc
    }

    function getText(draft: Automerge.Proxy<TestDoc>) {
      return draft.text
    }

    const mutex = new Mutex()

    render(
      <AutomergeCodeMirror
        makeCodeMirror={makeCodeMirror}
        getDoc={getDoc}
        setDoc={setDoc}
        getText={getText}
        mutex={mutex}
      />,
      div
    )

    await new Promise((resolve) => setTimeout(resolve, 10))

    codeMirror!.setValue('hello')
    assert.strictEqual(doc.text.toString(), 'hello')
  })

  it('updates CodeMirror doc when Automerge doc changes', async () => {
    let codeMirror: CodeMirror.Editor

    const mutex = new Mutex()

    function makeCodeMirror(host: HTMLElement) {
      codeMirror = CodeMirror(host)
      return codeMirror
    }

    let doc = Automerge.change(
      Automerge.init<TestDoc>(),
      (draft) => (draft.text = new Automerge.Text())
    )

    function getDoc() {
      return doc
    }

    function getCodeMirror(textObjectId: Automerge.UUID) {
      return codeMirror
    }

    function setDoc(newDoc: TestDoc) {
      doc = updateCodeMirrorDocs(doc, newDoc, getCodeMirror, mutex)
    }

    function getText(draft: Automerge.Proxy<TestDoc>) {
      return draft.text
    }

    render(
      <AutomergeCodeMirror
        makeCodeMirror={makeCodeMirror}
        getDoc={getDoc}
        setDoc={setDoc}
        getText={getText}
        mutex={mutex}
      />,
      div
    )

    await new Promise((resolve) => setTimeout(resolve, 10))

    setDoc(Automerge.change(doc, (draft) => draft.text.insertAt!(0, 'hello')))
    assert.strictEqual(codeMirror!.getValue(), 'hello')
  })
})
