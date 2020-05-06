import '../codeMirrorEnv'
import { render, unmountComponentAtNode } from 'react-dom'
import CodeMirror from 'codemirror'
import Automerge from 'automerge'
import AutomergeCodeMirrorComponent from '../../src/react/AutomergeCodeMirrorComponent'
import React from 'react'
import assert from 'assert'
import AutomergeCodeMirror from '../../src/AutomergeCodeMirror'
import { ConnectCodeMirror, GetText } from '../../src/types'

interface TestDoc {
  text: Automerge.Text
}

describe('<AutomergeCodeMirror>', () => {
  let doc: Automerge.Doc<TestDoc>
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
    const { connectCodeMirror } = AutomergeCodeMirror<Automerge.Doc<TestDoc>>((newDoc) => (doc = newDoc))
    const codeMirror: CodeMirror.Editor = await makeCodeMirror(doc, connectCodeMirror, getText, host)
    codeMirror.setValue('hello')
    assert.strictEqual(doc.text.toString(), 'hello')
  })

  it('updates CodeMirror doc when Automerge doc changes', async () => {
    const { connectCodeMirror, updateCodeMirrors } = AutomergeCodeMirror<Automerge.Doc<TestDoc>>(() => {
      throw new Error('Unexpected')
    })
    const codeMirror: CodeMirror.Editor = await makeCodeMirror(doc, connectCodeMirror, getText, host)
    doc = updateCodeMirrors(
      doc,
      Automerge.change(doc, (draft) => draft.text.insertAt!(0, 'hello'))
    )
    assert.strictEqual(codeMirror.getValue(), 'hello')
  })
})

function makeCodeMirror(
  doc: Automerge.Doc<TestDoc>,
  connectCodeMirror: ConnectCodeMirror<TestDoc>,
  getText: GetText<TestDoc>,
  host: HTMLElement
): Promise<CodeMirror.Editor> {
  return new Promise((resolve) => {
    function makeCodeMirror(host: HTMLElement) {
      const cm = CodeMirror(host)
      resolve(cm)
      return cm
    }

    render(
      <AutomergeCodeMirror
        doc={doc}
        makeCodeMirror={makeCodeMirror}
        connectCodeMirror={connectCodeMirror}
        getText={getText}
      />,
      host
    )
  })
}
