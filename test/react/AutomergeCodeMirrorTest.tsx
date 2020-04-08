import '../codeMirrorEnv'
import { render, unmountComponentAtNode } from 'react-dom'
import CodeMirror from 'codemirror'
import Automerge from 'automerge'
import AutomergeCodeMirror from '../../src/react/AutomergeCodeMirror'
import React from 'react'
import assert from 'assert'
import automergeCodeMirror from '../../src/automergeCodeMirror'

interface TestDoc {
  text: Automerge.Text
}

describe('<AutomergeCodeMirror>', () => {
  let doc: TestDoc
  const getCurrentDoc = () => doc
  const setDoc = (newDoc: TestDoc) => (doc = newDoc)
  const getText = (doc: TestDoc) => doc.text
  let host: HTMLElement

  beforeEach(() => {
    doc = Automerge.from({ text: new Automerge.Text() })
    host = document.body.appendChild(document.createElement('div'))
  })

  afterEach(() => {
    unmountComponentAtNode(host)
    host.remove()
  })

  it('updates Automerge doc when CodeMirror doc changes', async () => {
    const { connectCodeMirror } = automergeCodeMirror(getCurrentDoc)

    let codeMirror: CodeMirror.Editor
    function makeCodeMirror(host: HTMLElement) {
      codeMirror = CodeMirror(host)
      return codeMirror
    }

    render(
      <AutomergeCodeMirror
        makeCodeMirror={makeCodeMirror}
        connectCodeMirror={connectCodeMirror}
        getCurrentDoc={getCurrentDoc}
        setDoc={setDoc}
        getText={getText}
      />,
      host
    )

    await new Promise((resolve) => setTimeout(resolve, 10))

    codeMirror!.setValue('hello')
    assert.strictEqual(doc.text.toString(), 'hello')
  })

  it('updates CodeMirror doc when Automerge doc changes', async () => {
    const { updateCodeMirrors, connectCodeMirror } = automergeCodeMirror<TestDoc>(getCurrentDoc)

    let codeMirror: CodeMirror.Editor
    function makeCodeMirror(host: HTMLElement) {
      codeMirror = CodeMirror(host)
      return codeMirror
    }

    render(
      <AutomergeCodeMirror
        makeCodeMirror={makeCodeMirror}
        connectCodeMirror={connectCodeMirror}
        getCurrentDoc={getCurrentDoc}
        setDoc={setDoc}
        getText={getText}
      />,
      host
    )

    await new Promise((resolve) => setTimeout(resolve, 10))

    setDoc(updateCodeMirrors(Automerge.change(doc, (draft) => draft.text.insertAt!(0, 'hello'))))
    assert.strictEqual(codeMirror!.getValue(), 'hello')
  })
})
