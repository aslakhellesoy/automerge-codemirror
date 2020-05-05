import '../codeMirrorEnv'
import { render, unmountComponentAtNode } from 'react-dom'
import CodeMirror from 'codemirror'
import Automerge from 'automerge'
import AutomergeCodeMirror from '../../src/react/AutomergeCodeMirror'
import React from 'react'
import assert from 'assert'
import connectAutomergeDoc from '../../src/connectAutomergeDoc'
import { ConnectCodeMirror, GetText } from '../../src/types'

interface TestDoc {
  text: Automerge.Text
}

describe('<AutomergeCodeMirror>', () => {
  let doc: TestDoc
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
    const { connectCodeMirror } = connectAutomergeDoc(doc, (newDoc) => (doc = newDoc))
    const codeMirror: CodeMirror.Editor = await makeCodeMirror(connectCodeMirror, getText, host)
    codeMirror.setValue('hello')
    assert.strictEqual(doc.text.toString(), 'hello')
  })

  it('updates CodeMirror doc when Automerge doc changes', async () => {
    const { connectCodeMirror, updateCodeMirrors } = connectAutomergeDoc(doc, () => {
      throw new Error('Unexpected')
    })
    const codeMirror: CodeMirror.Editor = await makeCodeMirror(connectCodeMirror, getText, host)
    doc = Automerge.change(doc, (draft) => draft.text.insertAt!(0, 'hello'))
    updateCodeMirrors(doc)
    assert.strictEqual(codeMirror.getValue(), 'hello')
  })
})

function makeCodeMirror(
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
      <AutomergeCodeMirror makeCodeMirror={makeCodeMirror} connectCodeMirror={connectCodeMirror} getText={getText} />,
      host
    )
  })
}
