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
  let watchableDoc: Automerge.WatchableDoc<TestDoc>
  const getText = (doc: TestDoc) => doc.text
  let host: HTMLElement

  beforeEach(() => {
    watchableDoc = new Automerge.WatchableDoc(Automerge.from({ text: new Automerge.Text() }))
    host = document.body.appendChild(document.createElement('div'))
  })

  afterEach(() => {
    unmountComponentAtNode(host)
    host.remove()
  })

  it('updates Automerge doc when CodeMirror doc changes', async () => {
    const { connectCodeMirror } = automergeCodeMirror(watchableDoc)

    let codeMirror: CodeMirror.Editor
    function makeCodeMirror(host: HTMLElement) {
      codeMirror = CodeMirror(host)
      return codeMirror
    }

    render(
      <AutomergeCodeMirror
        makeCodeMirror={makeCodeMirror}
        connectCodeMirror={connectCodeMirror}
        watchableDoc={watchableDoc}
        getText={getText}
      />,
      host
    )

    await new Promise((resolve) => setTimeout(resolve, 10))

    codeMirror!.setValue('hello')
    assert.strictEqual(watchableDoc.get().text.toString(), 'hello')
  })

  it('updates CodeMirror doc when Automerge doc changes', async () => {
    const { connectCodeMirror } = automergeCodeMirror(watchableDoc)

    let codeMirror: CodeMirror.Editor
    function makeCodeMirror(host: HTMLElement) {
      codeMirror = CodeMirror(host)
      return codeMirror
    }

    render(
      <AutomergeCodeMirror
        makeCodeMirror={makeCodeMirror}
        connectCodeMirror={connectCodeMirror}
        watchableDoc={watchableDoc}
        getText={getText}
      />,
      host
    )

    await new Promise((resolve) => setTimeout(resolve, 10))

    watchableDoc.set(Automerge.change(watchableDoc.get(), (draft) => draft.text.insertAt!(0, 'hello')))
    assert.strictEqual(codeMirror!.getValue(), 'hello')
  })
})
